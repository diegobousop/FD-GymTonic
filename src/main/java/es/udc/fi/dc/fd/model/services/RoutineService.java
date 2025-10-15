package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;

import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;  

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoutineService {
    Routine createRoutine(Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws DuplicateInstanceException, InstanceNotFoundException, 
    InvalidRoutineNameException, InvalidRoutineDurationException;
    
    Page<Routine> viewAllRoutines(Long userId, Pageable pageable) throws InstanceNotFoundException;

    Routine getRoutineById(Long routineId, Long userId) throws InstanceNotFoundException, PermissionException;
    
    Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration, Boolean isPublic) throws InstanceNotFoundException, PermissionException;

    void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException;

    Page<Routine> findByFilters(Long userId, Long creatorId, String name, Pageable pageable) throws InstanceNotFoundException;
}
