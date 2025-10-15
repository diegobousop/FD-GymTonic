package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Serie;

import java.util.Optional;


public interface ExerciseService {

    Long addExercise(Long userId, Exercise exercise) throws DuplicateInstanceException, PermissionException;

    Block<Exercise> getExercices(int page, int size);

    Block<Serie> createSeries(Exercise exercise,  Optional<Integer> n) throws  InstanceNotFoundException;

    Serie editSerie(Serie serie,int repeticiones, int peso) throws DuplicateInstanceException;

    Serie getSerie(Long serieId);

    Block<Serie>getSeriesByExercise(long exercise);

    Exercise validateExercise(Long userId, Long exerciseId) throws InstanceNotFoundException, PermissionException, AlreadyValidatedException;

} 
