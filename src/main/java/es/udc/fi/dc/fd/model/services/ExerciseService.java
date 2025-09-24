package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.entities.Exercise;


public interface ExerciseService {
    Long addExercise(Exercise exercise) throws DuplicateInstanceException;

    Block<Exercise> getExercices(int page, int size);
} 
