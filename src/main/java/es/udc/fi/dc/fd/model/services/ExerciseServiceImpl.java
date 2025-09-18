package es.udc.fi.dc.fd.model.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Exercise;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {
    @Autowired
    private ExerciseDao exerciseDao;

    @Override
    public Long addExercise(Exercise exercise){

        exerciseDao.save(exercise);
        return exercise.getId();
    }
}
