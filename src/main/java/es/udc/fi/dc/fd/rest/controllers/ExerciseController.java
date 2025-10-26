package es.udc.fi.dc.fd.rest.controllers;

import java.util.Locale;
import java.util.Optional;

import es.udc.fi.dc.fd.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import es.udc.fi.dc.fd.rest.dtos.ExerciseSummaryDto;


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
    public Long addExercise(@RequestAttribute Long userId, @RequestBody ExerciseDto exercise) throws DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        return exerciseService.addExercise(userId, ExerciseConversor.toExercise(exercise));
    }

    @GetMapping("/getValidatedExercises")
    public BlockDto<ExerciseSummaryDto> getValidatedExercises(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "0") int size){
        Block<Exercise> returned = exerciseService.getValidatedExercises(page, size);
        return new BlockDto<>(ExerciseConversor.toExerciseSummaryDtos(returned.getItems()), returned.getExistMoreItems());
    }

    @GetMapping("/getUnvalidatedExercises")
    public BlockDto<ExerciseSummaryDto> getUnvalidatedExercises(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "0") int size){
        Block<Exercise> returned = exerciseService.getUnvalidatedExercises(page, size);
        return new BlockDto<>(ExerciseConversor.toExerciseSummaryDtos(returned.getItems()), returned.getExistMoreItems());
    }

    @PostMapping("/validateExercise/{exerciseId}")
    public ExerciseDto validateExercise(@RequestAttribute Long userId, @PathVariable Long exerciseId)
        throws InstanceNotFoundException, PermissionException, AlreadyValidatedException {
        return ExerciseConversor.toExerciseDto(exerciseService.validateExercise(userId, exerciseId));
    }

    @PostMapping("/Series")
    public BlockDto<SerieDto> CreateSeries(@RequestBody ExerciseDto exercise, @RequestParam(required = false) Integer numSeries, @RequestParam long routineId)
            throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

        return new BlockDto<>(SerieConversor.toSerieDtos(exerciseService.createSeries( ExerciseConversor.toExerciseId(exercise), Optional.ofNullable(numSeries),routineId ).getItems()),false);

    }

    @PostMapping("/Series/create")
    public SerieDto CreateSerie(@RequestBody ExerciseDto exercise, @RequestParam long routineId)
        throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        return SerieConversor.toSerieDto((exerciseService.createSerie(ExerciseConversor.toExerciseId(exercise),routineId)));
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
    public BlockDto <SerieDto> getSeriesByExercise(@RequestParam long exerciseId, @RequestParam long routineId) {
        return new BlockDto<>(SerieConversor.toSerieDtos(exerciseService.getSeriesByExerciseAndRoutine(exerciseId,routineId).getItems()),false);
    }


    @PostMapping("/declineExercise/{exerciseId}")
    public void declineExercise(@RequestAttribute Long userId, @PathVariable Long exerciseId)
            throws InstanceNotFoundException, PermissionException, AlreadyValidatedException {
        exerciseService.declineExercise(userId, exerciseId);
    }

    @PostMapping("/blockExercise/{exerciseId}")
    public void blockExercise(@RequestAttribute Long userId, @PathVariable Long exerciseId) throws InstanceNotFoundException {
        exerciseService.blockExercise(userId, exerciseId);
    }


}
