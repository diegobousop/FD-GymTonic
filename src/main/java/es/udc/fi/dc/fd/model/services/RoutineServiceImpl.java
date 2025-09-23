package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;

import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Exercise;

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
    
    @Override
    public Routine createRoutine( Long creatorId, String name, List<Long> exercises,Long duration) throws DuplicateInstanceException, InstanceNotFoundException {
        Users creator = permissionChecker.checkUser(creatorId);

		if (routineDao.existsByNameAndCreator(name, creator)) {
			throw new DuplicateInstanceException("project.entities.routine", name);
		}

        List<Exercise> found = new ArrayList<>();
        for (Long exerciseId : exercises) {
            Optional<Exercise> exercise = exerciseDao.findById(exerciseId);
            if (exercise.isEmpty()) {
                throw new InstanceNotFoundException("project.entities.exercise", exerciseId);
            }
            found.add(exercise.get());
        }
        Routine routine = new Routine(name, found, creator, duration, LocalDateTime.now().withNano(0));

        routineDao.save(routine);
        return routine;
    }

    @Override
    public List<Routine> viewAllRoutines(){
        return routineDao.findAll();
    }

    @Override
    public Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration) throws InstanceNotFoundException, PermissionException {
        Users creator = permissionChecker.checkUser(creatorId);
        
        Optional<Routine> optionalRoutine = routineDao.findById(routineId);
        if (optionalRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }
        
        Routine routine = optionalRoutine.get();
        
        if (!routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException();
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
        
        if (!routine.getCreator().getId().equals(creator.getId())) {
            throw new PermissionException();
        }
        
        routineDao.delete(routine);
    }
    
}
