package es.udc.fi.dc.fd.model.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;

public interface RoutineService {
    Routine createRoutine(Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws DuplicateInstanceException, InstanceNotFoundException, 
    InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException;
    
    Page<Routine> viewAllRoutines(Long userId, Pageable pageable) throws InstanceNotFoundException;

    Routine getRoutineById(Long routineId, Long userId) throws InstanceNotFoundException, PermissionException;
    
    Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws InstanceNotFoundException, PermissionException, RoutineExerciseLimitReachedException;

    boolean deleteSeriesByRoutine(Long routineId) throws InstanceNotFoundException;

    void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException;

    Page<Routine> findByFilters(Long userId, Long creatorId, String name, Pageable pageable) throws InstanceNotFoundException;

    void createTraining(Long userId, String trainingName, String trainingDescription, Boolean isPublic) throws InstanceNotFoundException;

    List<Serie> getDefaultRoutineSeries(Long routineId, Long exerciseId) throws InstanceNotFoundException;

    Training createTrainingFromRoutine(Long userId, String trainingName, String trainingDescription, Long duration, Boolean isPublic, List<Serie> series, Long routineId) throws InstanceNotFoundException;

    boolean followRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;

    boolean unfollowRoutine(Long userId, Long routineId) throws InstanceNotFoundException;

    Block<Users> getFollowersByRoutine(Long routineId, Long trainerId, Pageable pageable) throws InstanceNotFoundException, PermissionException;

    Page<Training> findTrainings(Long userId, Long id, Pageable pageable) throws InstanceNotFoundException, PermissionException;

    Page<Training> findTrainingsByDay(Long userId, int day, int month, int year, Pageable pageable) throws InstanceNotFoundException, PermissionException;

    List<Exercise> findTrainingExercises(Long trainingId) throws InstanceNotFoundException;

    List<Training> findTrainingsByYear(Long userId, int year) throws InstanceNotFoundException, PermissionException;

    Routine getRoutineByTraining(Long trainingId) throws InstanceNotFoundException;

    Training findTrainingById(Long trainingId) throws InstanceNotFoundException;
}