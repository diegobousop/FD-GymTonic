package es.udc.fi.dc.fd.rest.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseRoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDetailsConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDetailsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;
import es.udc.fi.dc.fd.rest.dtos.TrainingParamsDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseRoutineParamsDto;
import es.udc.fi.dc.fd.rest.dtos.SerieConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;




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

    @GetMapping("/getRoutineDetailsById/{routineId}")
	public RoutineDetailsDto getRoutineDetailsById(@PathVariable Long routineId, @RequestAttribute Long userId) 
        throws InstanceNotFoundException, PermissionException {

        Routine routine = routineService.getRoutineById(routineId, userId);

        List<ExerciseRoutineDto> exerciseRoutineDtos = new ArrayList<>();

        for (Exercise exercise : routine.getExercises()) {
            List<Serie> series = routineService.getDefaultRoutineSeries(routineId, exercise.getId());
            ExerciseRoutineDto exerciseRoutineDtoItem = ExerciseConversor.toExerciseRoutineDto(exercise, series);
            exerciseRoutineDtos.add(exerciseRoutineDtoItem);
        }

        RoutineDetailsDto routineDetails = RoutineDetailsConversor.toRoutineDetailsDto(routine, exerciseRoutineDtos);

		return routineDetails;
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

    @PostMapping("/createTraining")
    public void createTraining(@RequestAttribute Long userId, @RequestBody TrainingParamsDto params)
            throws InstanceNotFoundException, PermissionException {

        List<Serie> series = new ArrayList<>();
        for (ExerciseRoutineParamsDto exerciseParamsDto : params.getExercises()) {

            series.addAll(SerieConversor.toSerieFromSerieParamsDtoList(exerciseParamsDto.getSeries(), exerciseParamsDto.getId(), params.getRoutineId()));
        }

        //id usuario, id rutina, descripcion, duracion, visibilidad, lista de ejercicios con repes
        routineService.createTrainingFromRoutine(userId, params.getRoutineId(), params.getName(), params.getDescription(), params.getDuration(), params.getVisibility(), series);
    }

}
