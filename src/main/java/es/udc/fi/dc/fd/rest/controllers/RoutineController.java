package es.udc.fi.dc.fd.rest.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

import es.udc.fi.dc.fd.model.services.RoutineService;


import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;


@RestController
@RequestMapping("/api/routines")
public class RoutineController {
    @Autowired
    private RoutineService routineService;

    
    @PostMapping("/createRoutine")
    public RoutineDto createRoutine(@RequestAttribute Long userId, @Validated @RequestBody RoutineParamsDto params ) 
        throws DuplicateInstanceException, InstanceNotFoundException{
        return RoutineConversor.toRoutineDto(routineService.createRoutine(userId,params.getName(), params.getExercises(), params.getDuration()));
    }
    
}
