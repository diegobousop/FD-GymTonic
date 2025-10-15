package es.udc.fi.dc.fd.rest.controllers;

import java.util.Locale;
import java.util.Optional;

import es.udc.fi.dc.fd.rest.dtos.*;
import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;  

import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.entities.Exercise;

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

    @PostMapping("/Series")
    public BlockDto<SerieDto> CreateSerie(@RequestBody ExerciseDto exercise, @RequestParam(required = false) Integer numSeries) throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

        return new BlockDto<>(SerieConversor.toSerieDtos(exerciseService.createSeries( ExerciseConversor.toExerciseId(exercise), Optional.ofNullable(numSeries) ).getItems()),false);

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

    @GetMapping("/exerciseSeries")
    public BlockDto <SerieDto> getSeriesByExercise(@RequestParam long id) {
        return new BlockDto<>(SerieConversor.toSerieDtos(exerciseService.getSeriesByExercise(id).getItems()),false);
    }

}
