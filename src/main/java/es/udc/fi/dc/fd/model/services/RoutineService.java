package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;  

public interface RoutineService {
    Routine createRoutine(Long creatorId, String name, List<Long> exercises,Long duration) throws DuplicateInstanceException, InstanceNotFoundException;
    
    List<Routine> viewAllRoutines();

    
    Routine modifyRoutine(Long routineId, Long creatorId, String name, List<Long> exercises, Long duration) throws InstanceNotFoundException, PermissionException;
    void deleteRoutine(Long creatorId, Long routineId) throws InstanceNotFoundException, PermissionException;
}
