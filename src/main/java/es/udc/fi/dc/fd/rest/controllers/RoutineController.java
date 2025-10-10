package es.udc.fi.dc.fd.rest.controllers;


import java.util.Locale;

import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.model.services.ExerciseServiceImpl;
import es.udc.fi.dc.fd.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;


import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import static es.udc.fi.dc.fd.rest.dtos.ExerciseConversor.toExercise;


@RestController
@RequestMapping("/api/routines")
public class RoutineController {
    @Autowired
    private RoutineService routineService;
    @Autowired
    private ExerciseService exerciseService;
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
    public ErrorsDto handleInvalidRoutineDurationException(InvalidRoutineDurationException exception, Locale locale){
        String errorMessage = messageSource.getMessage(INVALID_ROUTINE_DURATION_EXCEPTION_CODE,
        new Object[] {exception.getDuration()}, INVALID_ROUTINE_DURATION_EXCEPTION_CODE, locale);
    
        return new ErrorsDto(errorMessage);
    }

    
    @PostMapping("/createRoutine")
    public RoutineDto createRoutine(@RequestAttribute Long userId, @RequestBody RoutineParamsDto params ) 
        throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        return RoutineConversor.toRoutineDto(routineService.createRoutine(userId, params.getName(), params.getExercises(), params.getDuration(), params.getIsPublic()));
    }

    @GetMapping("/viewAllRoutines")
    public BlockDto<RoutineDto> viewRoutine(
            @RequestAttribute Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {

        Pageable pageable = PageRequest.of(page, size);
        Page<Routine> routinesPage = routineService.viewAllRoutines(userId, pageable);
        
        return new BlockDto<>(RoutineConversor.toRoutineDtos(routinesPage.getContent()),
                            routinesPage.hasNext());
    }

    @GetMapping("/getRoutineById/{routineId}")
	public RoutineDto getRoutineById(@PathVariable Long routineId, @RequestAttribute Long userId) 
        throws InstanceNotFoundException, PermissionException {

		return RoutineConversor.toRoutineDto(routineService.getRoutineById(routineId, userId));
        
	}

    @PutMapping("/modifyRoutine/{routineId}")
    public RoutineDto modifyRoutine(
            @PathVariable Long routineId,
            @RequestAttribute Long userId, 
            @Validated @RequestBody RoutineParamsDto params) 
        throws InstanceNotFoundException, PermissionException {
        return RoutineConversor.toRoutineDto(
            routineService.modifyRoutine(routineId, userId, params.getName(), params.getExercises(), params.getDuration(), params.getIsPublic())
        );
    }

    @DeleteMapping("/deleteRoutine/{routineId}")
    public void deleteRoutine(
            @PathVariable Long routineId,
            @RequestAttribute Long userId) 
        throws InstanceNotFoundException, PermissionException {
        routineService.deleteRoutine(userId, routineId);
    }

    @GetMapping("/search")
    public BlockDto<RoutineDto> searchRoutines(
            @RequestAttribute Long userId,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {

        Pageable pageable = PageRequest.of(page, size);

        Page<Routine> routinesPage = routineService.findByFilters(userId, creatorId, name, pageable);
        
        return new BlockDto<>(RoutineConversor.toRoutineDtos(routinesPage.getContent()),
                            routinesPage.hasNext());
    }
    @PostMapping("/Series")
    public BlockDto<SerieDto> CreateSerie( @RequestBody ExerciseDto exercise) throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

       return new BlockDto<>(SerieConversor.toSerieDtos(exerciseService.createSeries( ExerciseConversor.toExerciseId(exercise)).getItems()),false);

    }

    @PutMapping("/Series")
    public SerieDto modifySerie(@RequestParam long serieId,
                                @RequestParam int repeticiones,
                                @RequestParam int peso) throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        return SerieConversor.toSerieDto(exerciseService.editSerie(exerciseService.getSerie(serieId),repeticiones,peso));
    }
    @GetMapping("/Series")
    public SerieDto getSerie(@RequestParam long serieId) {

        return SerieConversor.toSerieDto(exerciseService.getSerie(serieId));
    }
}
