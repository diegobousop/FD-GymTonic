package es.udc.fi.dc.fd.rest.controllers;


import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;


import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;


@RestController
@RequestMapping("/api/routines")
public class RoutineController {
    @Autowired
    private RoutineService routineService;
    @Autowired
    private MessageSource messageSource;

    private final static String INVALID_ROUTINE_NAME_EXCEPTION_CODE = "project.exceptions.InvalidRoutineNameException";
    private final static String INVALID_ROUTINE_DURATION_EXCEPTION_CODE = "project.exceptions.InvalidRoutineDurationException";


    @ExceptionHandler(InvalidRoutineNameException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidRoutineNameException(InvalidRoutineNameException exception, Locale locale){
        String errorMessage = messageSource.getMessage(INVALID_ROUTINE_NAME_EXCEPTION_CODE,
        new Object[] {exception.getName()}, INVALID_ROUTINE_NAME_EXCEPTION_CODE, locale);
    
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(InvalidRoutineDurationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidRoutineDurationException(InvalidRoutineNameException exception, Locale locale){
        String errorMessage = messageSource.getMessage(INVALID_ROUTINE_DURATION_EXCEPTION_CODE,
        new Object[] {exception.getName()}, INVALID_ROUTINE_DURATION_EXCEPTION_CODE, locale);
    
        return new ErrorsDto(errorMessage);
    }

    
    @PostMapping("/createRoutine")
    public RoutineDto createRoutine(@RequestAttribute Long userId, @Validated @RequestBody RoutineParamsDto params ) 
        throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        return RoutineConversor.toRoutineDto(routineService.createRoutine(userId,params.getName(), params.getExercises(), params.getDuration()));
    }

    @GetMapping("/viewAllRoutines")
	public List<RoutineDto> viewRoutine() {

		return RoutineConversor.toRoutineDtos(routineService.viewAllRoutines());

	}

    @PutMapping("/modifyRoutine/{routineId}")
    public RoutineDto modifyRoutine(
            @PathVariable Long routineId,
            @RequestAttribute Long userId, 
            @Validated @RequestBody RoutineParamsDto params) 
        throws InstanceNotFoundException, PermissionException {
        return RoutineConversor.toRoutineDto(
            routineService.modifyRoutine(routineId, userId, params.getName(), params.getExercises(), params.getDuration())
        );
    }

    @DeleteMapping("/deleteRoutine/{routineId}")
    public void deleteRoutine(
            @PathVariable Long routineId,
            @RequestAttribute Long userId) 
        throws InstanceNotFoundException, PermissionException {
        routineService.deleteRoutine(userId, routineId);
    }
    
}
