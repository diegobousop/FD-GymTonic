package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineFollow;
import es.udc.fi.dc.fd.model.entities.RoutineFollowDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;


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
    private RoutineFollowDao routineFollowDao;
    @Autowired
    private NotificationService notificationService;
    
    @Override
    public Routine createRoutine( Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws DuplicateInstanceException,
        InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException {
        Users creator = permissionChecker.checkUser(creatorId);

		if (routineDao.existsByNameAndCreator(name, creator)) {
			throw new DuplicateInstanceException("project.entities.routine", name);
		}

        if(name.isBlank()) throw new InvalidRoutineNameException(name);
        if(duration == null || duration<=0 ) throw new InvalidRoutineDurationException(duration);

        List<Exercise> found = new ArrayList<>();
        for (Long exerciseId : exercises) {
            Optional<Exercise> exercise = exerciseDao.findById(exerciseId);
            if (exercise.isEmpty()) {
                throw new InstanceNotFoundException("project.entities.exercise", exerciseId);
            }
            found.add(exercise.get());
        }
        if (isPublic == null) {
            isPublic = true;
        }
        Routine routine = new Routine(name, found, creator, duration, LocalDateTime.now().withNano(0), isPublic);
        
        if(isPublic && creator.getFollowers()!=null) {
            notificationService.notifyFollowers(creatorId, routine);
        }

        routineDao.save(routine);
        return routine;
    }

    @Override
    public Page<Routine> viewAllRoutines(Long userId, Pageable pageable) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        
        Specification<Routine> spec = Specification.where(null);
        
        if (!user.getRole().equals(Users.RoleType.ADMIN)) {
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.equal(root.get("isPublic"), true),
                    cb.equal(root.get("creator").get("id"), userId)
                ));
        }
        
        return routineDao.findAll(spec, pageable);
    }

    @Override
    public Routine getRoutineById(Long routineId, Long userId) throws InstanceNotFoundException, PermissionException {
        Users user = permissionChecker.checkUser(userId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        if (!routine.getIsPublic() && 
            !user.getRole().equals(Users.RoleType.ADMIN) && 
            !routine.getCreator().getId().equals(userId)) {
            throw new PermissionException("project.entities.routine", routineId);
        }
        
        return routine;
    }

    @Override
    public Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws InstanceNotFoundException, PermissionException {
        Users creator = permissionChecker.checkUser(creatorId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        // Admin can modify any routine, others can only modify their own
        if (!creator.getRole().equals(Users.RoleType.ADMIN) && !routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException("project.entities.routine", routineId);
        }
        
        List<Exercise> foundExercises = new ArrayList<>();
        for (Long exerciseId : exercises) {
            Optional<Exercise> exercise = exerciseDao.findById(exerciseId);
            if (exercise.isEmpty()) {
                throw new InstanceNotFoundException("project.entities.exercise", exerciseId);
            }
            foundExercises.add(exercise.get());
        }
        
        routine.setName(name);
        routine.setExercises(foundExercises);
        routine.setDuration(duration);
        if (isPublic != null && creator.getFollowers() != null) {
            routine.setIsPublic(isPublic);
            notificationService.notifyFollowers(routine.getCreator().getId(), routine);
        }
        routine.setModificationDate(LocalDateTime.now().withNano(0));
        
        routineDao.save(routine);
        return routine;
    }

    @Override
    public void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException {
        Users creator = permissionChecker.checkUser(creatorId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        if (!creator.getRole().equals(Users.RoleType.ADMIN) && !routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException("project.entities.routine", routineId);
        }
        
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
                    cb.equal(root.get("creator").get("id"), userId)
                ));
        }

        if (creatorId != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("creator").get("id"), creatorId));
        }

        if (name != null && !name.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }

        return routineDao.findAll(spec, pageable);
    }

    @Override
    public boolean followRoutine(Long userId, Long routineId) 
            throws InstanceNotFoundException, PermissionException {

        Users user = permissionChecker.checkUser(userId);
        Routine routine = routineDao.findById(routineId)
            .orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId));

        if (!routine.getIsPublic()) {
            throw new PermissionException("project.entities.routine", routineId);
        }

        // Evitar seguir dos veces
        if (routineFollowDao.existsByUserIdAndRoutineId(userId, routineId)) {
            return false;
        }

        routineFollowDao.save(new RoutineFollow(user, routine));
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
    public Block<Users> getFollowersByRoutine(Long routineId, Long trainerId, Pageable pageable) 
            throws InstanceNotFoundException, PermissionException {

        Users trainer = permissionChecker.checkUser(trainerId);
        Routine routine = routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId));

        if (!routine.getCreator().getId().equals(trainerId)) {
            throw new PermissionException("project.entities.routine", routineId);
        }

        if (!trainer.getRole().equals(Users.RoleType.TRAINER)) {
            throw new PermissionException("project.entities.routine", routineId);
        }

        Page<RoutineFollow> followsPage = routineFollowDao.findByRoutineId(routineId, pageable);
        List<Users> followers = followsPage.map(RoutineFollow::getUser).toList();

        return new Block<>(followers, followsPage.hasNext());
    }

}
