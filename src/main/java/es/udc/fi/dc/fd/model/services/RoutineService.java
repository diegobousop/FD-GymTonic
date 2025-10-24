package es.udc.fi.dc.fd.model.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface RoutineService {
    Routine createRoutine(Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws DuplicateInstanceException, InstanceNotFoundException, 
    InvalidRoutineNameException, InvalidRoutineDurationException;
    
    Page<Routine> viewAllRoutines(Long userId, Pageable pageable) throws InstanceNotFoundException;

    Routine getRoutineById(Long routineId, Long userId) throws InstanceNotFoundException, PermissionException;
    
    Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws InstanceNotFoundException, PermissionException;

    void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException;

    Page<Routine> findByFilters(Long userId, Long creatorId, String name, Pageable pageable) throws InstanceNotFoundException;

    boolean followRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;

    boolean unfollowRoutine(Long userId, Long routineId) throws InstanceNotFoundException;

    Block<Users> getFollowersByRoutine(Long routineId, Long trainerId, Pageable pageable) throws InstanceNotFoundException, PermissionException;

}
