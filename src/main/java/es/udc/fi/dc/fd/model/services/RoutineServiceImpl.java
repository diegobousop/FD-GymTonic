package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;


@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {

    @Autowired
    private PermissionChecker permissionChecker;
    @Autowired
    private RoutineDao routineDao;
    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private SerieDao serieDao;

    @Autowired
    private TrainingDao trainingDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineFollowDao routineFollowDao;

    @Autowired
    private RoutineLikeDao routineLikeDao;

    @Autowired
    private NotificationService notificationService;

    private static final String TRAINER_STRING = "TRAINER";
    private static final String CREATOR_STRING = "creator";
    private static final int EXERCISE_LIMIT = 5;
    private static final int ROUTINE_LIMIT = 3;
    private static final String ROUTINE_EXCEPTION = "project.entities.routine";
    
    @Override
    public Routine createRoutine( Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws DuplicateInstanceException,
        InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = permissionChecker.checkUser(creatorId);


        if (routineDao.existsByNameAndCreator(name, creator)) {
            throw new DuplicateInstanceException(ROUTINE_EXCEPTION, name);
        }

        validateInputs(name, duration);


        if (isPublic == null) {
            isPublic = true;
        }

        checkNonPremiumLimits(creator, exercises);



        // Crear la rutina base
        Routine routine = new Routine();
        routine.setName(name);
        routine.setCreator(creator);
        routine.setDuration(duration);
        routine.setModificationDate(LocalDateTime.now().withNano(0));
        routine.setIsPublic(isPublic);


        routineDao.save(routine);


        // Notificar seguidores si es pública
        if(isPublic && creator.getFollowers()!=null) {
            notificationService.notifyFollowers(creatorId, routine);
        }

        createRoutineExercisesAndSeries(exercises, routine);




        return routineDao.save(routine);
    }


    @Override
    public Page<Routine> viewAllRoutines(Long userId, Pageable pageable) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        
        Specification<Routine> spec = Specification.where(null);
        
        if (!user.getRole().equals(Users.RoleType.ADMIN)) {
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.equal(root.get("isPublic"), true),
                    cb.equal(root.get(CREATOR_STRING).get("id"), userId)
                ));
        }
        
        return routineDao.findAll(spec, pageable);
    }

    @Override
    public Routine getRoutineById(Long routineId, Long userId) throws InstanceNotFoundException, PermissionException {
        Users user = permissionChecker.checkUser(userId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        if (Boolean.TRUE.equals(!routine.getIsPublic() && 
            !user.getRole().equals(Users.RoleType.ADMIN)) && 
            !routine.getCreator().getId().equals(userId)) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }
        
        return routine;
    }

    @Override
    public Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws InstanceNotFoundException, PermissionException, RoutineExerciseLimitReachedException {
        Users creator = permissionChecker.checkUser(creatorId);

        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId));

        // Solo el creador o un admin puede modificar
        if (!creator.getRole().equals(Users.RoleType.ADMIN) &&
            !routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }

        //Si el creador no es premium comprobar limite de ejercicios
        if(Boolean.TRUE.equals(!creator.getPremium()) && creator.getRole().toString().equals(TRAINER_STRING)) {
            int exerciseLimit = 5;
            if (exercises.size() > exerciseLimit) {
                throw new RoutineExerciseLimitReachedException();
            }
        }

        // Recuperamos las relaciones actuales
        List<RoutineExercise> current = routine.getRoutineExercises();

        // Eliminar las relaciones que ya no están
        current.removeIf(re -> exercises.stream()
            .noneMatch(id -> re.getExercise().getId().equals(id)));

        // Buscar los ejercicios de la nueva lista
        List<Exercise> foundExercises = new ArrayList<>();
        for (Long id : exercises) {
            Exercise ex = exerciseDao.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", id));
            foundExercises.add(ex);
        }

        // Añadir los nuevos ejercicios (solo los que no existían)
        int order = 1;
        for (Exercise ex : foundExercises) {
            RoutineExercise existing = current.stream()
                .filter(re -> re.getExercise().getId().equals(ex.getId()))
                .findFirst()
                .orElse(null);

            if (existing != null) {
                existing.setOrderInRoutine(order++);
            } else {
                RoutineExercise newRE = new RoutineExercise();
                RoutineExerciseId newId = new RoutineExerciseId();
                newRE.setId(newId);
                newRE.setRoutine(routine);
                newRE.setExercise(ex);
                newRE.setOrderInRoutine(order++);
                newRE.setRestTime(120);
                current.add(newRE);
            }
        }

        // Notificar seguidores si es pública
        if(Boolean.TRUE.equals(isPublic) && creator.getFollowers()!=null) {
            notificationService.notifyFollowers(creatorId, routine);
        }

        // Actualizar datos de la rutina
        routine.setName(name);
        routine.setDuration(duration);
        routine.setModificationDate(LocalDateTime.now().withNano(0));
        routine.setIsPublic(isPublic);

        return routineDao.save(routine);
    }

    @Override
    public boolean deleteSeriesByRoutine(Long routineId) {
        try {
            List<Serie> series = serieDao.findByRoutineId(routineId);
            series.forEach(serie -> serieDao.deleteById(serie.getId()));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException {
        Users creator = permissionChecker.checkUser(creatorId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        if (!creator.getRole().equals(Users.RoleType.ADMIN) && !routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }
        
        deleteSeriesByRoutine(routine.getId());
        routineDao.delete(routine);
    }

    @Override
    public Page<Routine> findByFilters(Long userId, Long creatorId, String name, Pageable pageable) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        Specification<Routine> spec = Specification.where(null);

        if (!user.getRole().equals(Users.RoleType.ADMIN)) {
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.equal(root.get("isPublic"), true),
                    cb.equal(root.get(CREATOR_STRING).get("id"), userId)
                ));
        }

        if (creatorId != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get(CREATOR_STRING).get("id"), creatorId));
        }

        if (name != null && !name.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }

        return routineDao.findAll(spec, pageable);
    }

    public void createTraining(Long userId, String trainingName, String trainingDescription, Boolean isPublic) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        Training training = new Training();
        training.setName(trainingName);
        training.setDescription(trainingDescription);
        training.setCreationDate(LocalDateTime.now().withNano(0));
        training.setIsPublic(isPublic);
        training.setUser(user);

        trainingDao.save(training);
    }

    @Override
    public List<Serie> getDefaultRoutineSeries(Long routineId, Long exerciseId) throws InstanceNotFoundException {
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }

        Routine routine = optionalRoutine.get();

        Optional<Exercise> optionalExercise = exerciseDao.findById(exerciseId);

        if (optionalExercise.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.exercise", exerciseId);
        }

        Exercise exercise = optionalExercise.get();

        return serieDao.findByRoutineAndExercise(routine, exercise);
    }

    @Override
    public Training createTrainingFromRoutine(Long userId, String trainingName, String trainingDescription, Long duration, Boolean isPublic, List<Serie> series, Long routineId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        Training training = new Training();
        training.setName(trainingName);
        training.setDescription(trainingDescription);
        training.setCreationDate(LocalDateTime.now().withNano(0));
        training.setIsPublic(isPublic);
        training.setUser(user);
        training.setCreationDate(LocalDateTime.now().withNano(0));
        training.setDuration(duration);

        trainingDao.save(training);

        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }

        Routine routine = optionalRoutine.get();

        for (Serie serie : series) {

            Serie newSerie = new Serie();
            newSerie.setRepeticiones(serie.getRepeticiones());
            newSerie.setPeso(serie.getPeso());
            newSerie.setNumeroSerie(serie.getNumeroSerie());

            Optional<Exercise> optionalExercise = exerciseDao.findById(serie.getExercise().getId());
            if (optionalExercise.isEmpty()) {
                throw new InstanceNotFoundException("project.entities.exercise", serie.getExercise().getId());
            }

            newSerie.setExercise(optionalExercise.get());
            newSerie.setTraining(training);
            newSerie.setRoutine(routine);

            serieDao.save(newSerie);
        }
        
        return training;
    }

    @Override
    public boolean followRoutine(Long userId, Long routineId) 
            throws InstanceNotFoundException, PermissionException {

        Users user = permissionChecker.checkUser(userId);
        Routine routine = routineDao.findById(routineId)
            .orElseThrow(() -> new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId));

        if (Boolean.FALSE.equals(routine.getIsPublic())) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }

        // Evitar seguir dos veces
        if (routineFollowDao.existsByUserIdAndRoutineId(userId, routineId)) {
            return false;
        }

        routineFollowDao.save(new RoutineFollow(user, routine));
        
        // Notificar al entrenador sobre el nuevo seguidor de la rutina
        notificationService.notifyRoutineFollow(userId, routine);
        
        return true;
    }

    @Override
    public boolean unfollowRoutine(Long userId, Long routineId) 
            throws InstanceNotFoundException {

        if (!routineFollowDao.existsByUserIdAndRoutineId(userId, routineId)) {
            return false;
        }

        routineFollowDao.deleteByUserIdAndRoutineId(userId, routineId);
        return true;
    }

    @Override
    public boolean likeRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException {

        Users user = permissionChecker.checkUser(userId);
        Routine routine = routineDao.findById(routineId)
            .orElseThrow(() -> new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId));

        if (Boolean.FALSE.equals(routine.getIsPublic())) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }

        // Evitar dar like dos veces
        if (routineLikeDao.existsByUserIdAndRoutineId(userId, routineId)) {
            return false;
        }

        routineLikeDao.save(new RoutineLike(user, routine));
        
        // Notificar al entrenador sobre el like
        notificationService.notifyRoutineLike(userId, routine);
        
        return true;
    }

    @Override
    public boolean unlikeRoutine(Long userId, Long routineId) throws InstanceNotFoundException {

        if (!routineLikeDao.existsByUserIdAndRoutineId(userId, routineId)) {
            return false;
        }

        routineLikeDao.deleteByUserIdAndRoutineId(userId, routineId);
        return true;
    }

    @Override 
    public boolean isLikedRoutine(Long userId, Long routineId) throws InstanceNotFoundException {
        permissionChecker.checkUser(userId);

        if (!routineDao.existsById(routineId)) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }

        return routineLikeDao.existsByUserIdAndRoutineId(userId, routineId);
    }   

    @Override
    public long getLikesCount(Long routineId) throws InstanceNotFoundException {
        if (!routineDao.existsById(routineId)) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId);
        }
        return routineLikeDao.countByRoutineId(routineId);
    }

    @Override
    public Block<Users> getFollowersByRoutine(Long routineId, Long trainerId, Pageable pageable) 
            throws InstanceNotFoundException, PermissionException {

        Users trainer = permissionChecker.checkUser(trainerId);
        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException(ROUTINE_EXCEPTION, routineId));

        if (!routine.getCreator().getId().equals(trainerId)) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }

        if (!trainer.getRole().equals(Users.RoleType.TRAINER)) {
            throw new PermissionException(ROUTINE_EXCEPTION, routineId);
        }

        Page<RoutineFollow> followsPage = routineFollowDao.findByRoutineId(routineId, pageable);
        List<Users> followers = followsPage.map(RoutineFollow::getUser).toList();

        return new Block<>(followers, followsPage.hasNext());
    }
    /*userId creador, Id el que lo busca*/
    @Override
    public Page<Training> findTrainings(Long userId, Long id,Pageable pageable) throws InstanceNotFoundException, PermissionException {
        boolean esDuenho=Objects.equals(userId, id);
            Users user = userDao.findById(id)
                    .orElseThrow(() -> new InstanceNotFoundException("user not found", userDao.findById(id) ));
            Users requestedUser = userDao.findById(userId)
                    .orElseThrow(() -> new InstanceNotFoundException("user not found", userDao.findById(userId)));
            if (!esDuenho) {
                if (!user.getFollowing().contains(requestedUser))
                    return Page.empty();
                else {
                    Page<Training> trainings = trainingDao.findByUserIdOrderByCreationDateDesc(userId, pageable);
                    List<Training> filtered = trainings.stream()
                            .filter(Training::getIsPublic)
                            .toList();
                    return new PageImpl<>(filtered, pageable, filtered.size());
                }
            }
        return trainingDao.findByUserIdOrderByCreationDateDesc(userId, pageable);
    }

    @Override
    public List<Exercise> findTrainingExercises(Long trainingId) throws InstanceNotFoundException {
        return exerciseDao.findExercisesByTrainingId(trainingId);
    }

    @Override
    public Training findTrainingById (Long trainingId) throws InstanceNotFoundException {
        Optional<Training> optionalTraining = trainingDao.findById(trainingId);
        if (optionalTraining.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.training", trainingId);
        }
        return optionalTraining.get();
    }

    @Override
    public List<Training> findTrainingsByYear(Long userId, int year) throws InstanceNotFoundException, PermissionException {
        permissionChecker.checkUser(userId);

        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59, 59);    

        return trainingDao.findByUserIdAndCreationDateBetween(userId, start, end);
    }    

    @Override
    public Page<Training> findTrainingsByDay(Long userId, int day, int month, int year, Pageable pageable) throws InstanceNotFoundException, PermissionException {
        permissionChecker.checkUser(userId);

        LocalDate startDate = LocalDate.of(year, month, day);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = startDate.atTime(23, 59, 59);

        return trainingDao.findByUserIdAndCreationDateBetweenOrderByCreationDateDesc(userId, start, end, pageable);
    }

    @Override
    public Routine getRoutineByTraining(Long trainingId) throws InstanceNotFoundException {
        Optional<Training> optionalTraining = trainingDao.findById(trainingId);
        if (optionalTraining.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.training", trainingId);
        }

        Training training = optionalTraining.get();

        List<Serie> series = serieDao.findByTrainingId(training.getId());

        if (series.isEmpty()) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, "No routine associated with training id: " + trainingId);
        }

        Serie firstSerie = series.get(0);
        Routine routine = firstSerie.getRoutine();

        if (routine == null) {
            throw new InstanceNotFoundException(ROUTINE_EXCEPTION, "No routine associated with training id: " + trainingId);
        }

        return routine;
    }

    private void validateInputs(String name, Long duration) throws InvalidRoutineNameException, InvalidRoutineDurationException {
        if(name == null || name.isBlank()) {
            throw new InvalidRoutineNameException(name);
        }
        if(duration == null || duration <= 0) {
            throw new InvalidRoutineDurationException(duration);
        }

    }

    private void checkNonPremiumLimits(Users creator, List<Long> exercises) throws RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        // Comprobar límite de rutinas para usuarios no premium
        if(Boolean.TRUE.equals(!creator.getPremium()) && creator.getRole().toString().equals(TRAINER_STRING)) {
            List<Routine> routineCount = routineDao.findByCreator(creator);
            if (routineCount.size() >= ROUTINE_LIMIT) {
                throw new RoutineLimitReachedException();
            }
        }

        // Comprobar límite de ejercicios por rutina para usuarios no premium
        if(Boolean.TRUE.equals(!creator.getPremium()) && creator.getRole().toString().equals(TRAINER_STRING) && exercises.size() > EXERCISE_LIMIT) {
                throw new RoutineExerciseLimitReachedException();
            }
        
    }

    private void createRoutineExercisesAndSeries(List<Long> exercises, Routine routine) throws InstanceNotFoundException {
        // Crear las relaciones RoutineExercise con orden y descanso
        int order = 1;
        for (Long exerciseId : exercises) {
            Exercise exercise = exerciseDao.findById(exerciseId)
                    .orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", exerciseId));


            RoutineExercise routineExercise = new RoutineExercise();
            routineExercise.setId(new RoutineExerciseId());
            routineExercise.setRoutine(routine);
            routineExercise.setExercise(exercise);
            routineExercise.setOrderInRoutine(order++);
            routineExercise.setRestTime(120);


            routine.getRoutineExercises().add(routineExercise);


            // Crear series asociadas al ejercicio
            for (int i = 1; i <= exercise.getNumeroSeries(); i++) {
                Serie serie = new Serie();
                serie.setExercise(exercise);
                serie.setPeso(40);
                serie.setRepeticiones(8);
                serie.setNumeroSerie(i);
                serie.setRoutine(routine);
                serieDao.save(serie);
            }
        }
    }

}

