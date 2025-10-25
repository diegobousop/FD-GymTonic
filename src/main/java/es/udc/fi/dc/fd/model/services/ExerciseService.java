package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import java.util.Optional;


public interface ExerciseService {

    Long addExercise(Long userId, Exercise exercise) throws DuplicateInstanceException, PermissionException, InstanceNotFoundException;

    Block<Exercise> getValidatedExercises(int page, int size);

    Block<Exercise> getUnvalidatedExercises(int page, int size);

    Block<Serie> createSeries(Exercise exercise, Optional<Integer> n, long routine) throws  InstanceNotFoundException;

    Serie editSerie(Serie serie,int repeticiones, int peso) throws DuplicateInstanceException;

    Serie getSerie(Long serieId);

    Block<Serie> getSeriesByExerciseAndRoutine(long exercise,long routine);

    Exercise validateExercise(Long userId, Long exerciseId) throws InstanceNotFoundException, PermissionException, AlreadyValidatedException;

    void declineExercise(Long userId, Long exerciseId) throws InstanceNotFoundException, PermissionException, AlreadyValidatedException;

    void blockExercise(Long userId, Long exerciseId2) throws InstanceNotFoundException;
} 
