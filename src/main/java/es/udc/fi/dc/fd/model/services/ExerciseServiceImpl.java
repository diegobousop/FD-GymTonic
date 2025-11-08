package es.udc.fi.dc.fd.model.services;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private SerieDao serieDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private IconDao iconDao;

    @Override
    public Long addExercise(Long userId, Exercise exercise) throws DuplicateInstanceException, PermissionException, InstanceNotFoundException {

        if(exerciseDao.existsByExerciseName(exercise.getExerciseName())){
            throw new DuplicateInstanceException("project.entities.exercise", exercise.getExerciseName());
        }

        Optional<Users> creator = userDao.findById(userId);

        if(creator.isEmpty()){
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        exercise.setCreator(creator.get());

        Optional<Users> validator = userDao.findById(userId);

        if(validator.isEmpty()){
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        if(validator.get().getRole().toString().equals("USER")){ // si el que añade es admin, se valida directamente
            throw new PermissionException("project.entities.exercise", exercise.getExerciseName());
        }

        if(validator.get().getRole().toString().equals("ADMIN")){ // si el que añade es admin, se valida directamente
            exercise.setValidated(true);
            exercise.setValidator(validator.get());
        }

        if(validator.get().getRole().toString().equals("TRAINER") ){
            exercise.setValidated(false);
        }

        Icon icon = iconDao.findByName(exercise.getGrupoMuscular().toString());
        exercise.setIcon(icon);

        exerciseDao.save(exercise);
        return exercise.getId();
    }


    @Transactional(readOnly = true)
    @Override
    public Block<Exercise> getValidatedExercises(int page, int size){
        //Devuelve solo los ejerciccios validados
        Pageable pageable = PageRequest.of(page, size);
        Slice<Exercise> slice = exerciseDao.findAllByValidatedTrueOrderById(pageable);
        
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Transactional(readOnly = true)
    @Override
    public Block<Exercise> getUnvalidatedExercises(int page, int size){
        //Devuelve solo los ejerciccios no validados
        Pageable pageable = PageRequest.of(page, size);
        Slice<Exercise> slice = exerciseDao.findAllByValidatedFalseOrderById(pageable);

        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    public Block<Serie> createSeries(Exercise exercise, Optional<Integer> n, long routine) throws  InstanceNotFoundException {
        int aux;
        int aux2;
        if (!exerciseDao.existsByExerciseName(exercise.getExerciseName()))
            throw new InstanceNotFoundException("project.entities.exercise", exercise.getExerciseName());

        aux = n.orElseGet(exercise::getNumeroSeries);
        aux2=getSeriesByExerciseAndRoutine(exercise.getId(), routine).getItems().size();
        for(int i=1;i<=aux;i++){
            Serie serie = new Serie(20,10,i+aux2,exercise, routineDao.getReferenceById(routine));
            serieDao.save(serie);
        }
        Slice<Serie> slice= serieDao.findByExercise(exercise);
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    public Serie createSerie(Exercise exercise, long routine) throws InstanceNotFoundException {
        int aux;
        if(!exerciseDao.existsByExerciseName(exercise.getExerciseName()))
            throw new InstanceNotFoundException("project.entities.exercise", exercise.getExerciseName());
        if (!routineDao.existsById(routine))
            throw new InstanceNotFoundException("project.entities.routine", routine);
        aux=getSeriesByExerciseAndRoutine(exercise.getId(), routine).getItems().size();
        Serie serie= new Serie(0,0,aux+1,exercise,routineDao.getReferenceById(routine));
        serieDao.save(serie);
        return serie;
    }

    @Override
    public Serie editSerie(Serie serie, int repeticiones, int peso) throws DuplicateInstanceException {
        serie.setPeso(peso);
        serie.setRepeticiones(repeticiones);
        serieDao.save(serie);
        return serie;
    }

    @Override
    public Serie getSerie(Long id)throws NoSuchElementException {
        if (serieDao.findById(id).isEmpty())
            throw new NoSuchElementException("project.entities.serie");
        return serieDao.findById(id).get();
    }

    @Override
    public Block<Serie> getSeriesByExerciseAndRoutine(long exercise, long routine)  {

        if (exerciseDao.findById( exercise).isEmpty() || routineDao.findById(routine).isEmpty())
            throw new NoSuchElementException("project.entities.serie");
        else{
            Slice<Serie> slice = serieDao.findByExercise(exerciseDao.findById( exercise).get());
            List<Serie> filtered = slice.getContent().stream()
                    .filter(serie -> serie.getRoutine() != null
                            && serie.getRoutine().getId() == routine)
                    .toList();
            return new Block<>(filtered, slice.hasNext());
        }
    }

    @Override
    public Exercise validateExercise(Long userId, Long exerciseId) throws InstanceNotFoundException, PermissionException, AlreadyValidatedException {

        Optional<Exercise> foundExercise = exerciseDao.findById(exerciseId);

        Users validator = userDao.findById(userId).get();

        if(!(validator.getRole().toString().equals("ADMIN"))){ 
            throw new PermissionException("project.entities.exercise", exerciseId);
        }

        if (foundExercise.isEmpty())
            throw new InstanceNotFoundException("project.entities.exercise", exerciseId);

        if (foundExercise.get().isValidated())
            throw new AlreadyValidatedException("project.entities.exercise", exerciseId);

        foundExercise.get().setValidated(true);
        exerciseDao.save(foundExercise.get());

        return foundExercise.get();
    }

    
    @Override
    public void declineExercise(Long userId, Long exerciseId) throws InstanceNotFoundException, PermissionException, AlreadyValidatedException {

        Optional<Exercise> foundExercise = exerciseDao.findById(exerciseId);

        Users validator = userDao.findById(userId).get();

        if(!(validator.getRole().toString().equals("ADMIN"))){ 
            throw new PermissionException("project.entities.exercise", exerciseId);
        }

        if (foundExercise.isEmpty())
            throw new InstanceNotFoundException("project.entities.exercise", exerciseId);

        if (foundExercise.get().isValidated())
            throw new AlreadyValidatedException("project.entities.exercise", exerciseId);

        exerciseDao.delete(foundExercise.get());
    }

    @Override
    public void blockExercise(Long userId, Long exerciseId) throws InstanceNotFoundException {

        Optional<Exercise> foundExercise = exerciseDao.findById(exerciseId);
        Users blocker = userDao.findById(userId).get();
        if (foundExercise.isEmpty())
            throw new InstanceNotFoundException("project.entities.exercise", exerciseId);

        foundExercise.get().setValidated(false);
        foundExercise.get().setValidator(blocker); // para saber quien lo ha bloqueado
        exerciseDao.save(foundExercise.get());
    }

    @Override
    public List<Serie> findExerciseSeriesInTraining(Long trainingId, Long exerciseId) {
        return serieDao.findByExerciseIdAndTrainingId(exerciseId, trainingId);
    }

}
