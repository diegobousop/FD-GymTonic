package es.udc.fi.dc.fd.rest.controllers;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;  

import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.entities.Exercise;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import org.springframework.web.bind.annotation.ExceptionHandler;




@RestController
@RequestMapping("/api/exercise")
public class ExerciseController {

    @Autowired
    private MessageSource messageSource;

    private final static String ALREADY_VALIDATED_EXCEPTION_CODE = "project.exceptions.AlreadyValidatedException";

    @ExceptionHandler(AlreadyValidatedException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleAlreadyValidatedException(AlreadyValidatedException exception, Locale locale){
        String errorMessage = messageSource.getMessage(ALREADY_VALIDATED_EXCEPTION_CODE,
        new Object[] {exception.getExerciseId()}, ALREADY_VALIDATED_EXCEPTION_CODE, locale);

        return new ErrorsDto(errorMessage);
    }

    @Autowired
    private ExerciseService exerciseService;

    @PostMapping("/addExercise")
    public Long addExercise(@RequestAttribute Long userId, @RequestBody ExerciseDto exercise) throws DuplicateInstanceException, PermissionException {
        return exerciseService.addExercise(userId, ExerciseConversor.toExercise(exercise));
    }

    @GetMapping("/getExercises")
    public BlockDto<ExerciseDto> getExercises(@RequestParam(defaultValue = "0") int page){
        Block<Exercise> returned = exerciseService.getExercices(page, 5);
        return new BlockDto<>(ExerciseConversor.toExerciseDtos(returned.getItems()), returned.getExistMoreItems());
    }    

    @PostMapping("/validateExercise/{exerciseId}")
    public ExerciseDto postMethodName(@RequestAttribute Long userId, @PathVariable Long exerciseId) 
        throws InstanceNotFoundException, PermissionException, AlreadyValidatedException {
        return ExerciseConversor.toExerciseDto(exerciseService.validateExercise(userId, exerciseId));
    }
    
}
