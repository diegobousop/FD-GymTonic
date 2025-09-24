package es.udc.fi.dc.fd.model.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.entities.Exercise;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {
    @Autowired
    private ExerciseDao exerciseDao;

    @Override
    public Long addExercise(Exercise exercise) throws DuplicateInstanceException{

        if(exerciseDao.existsByExerciseName(exercise.getExerciseName())){
            throw new DuplicateInstanceException("project.entities.exercise", exercise.getExerciseName());
        }

        exerciseDao.save(exercise);
        return exercise.getId();
    }


    @Transactional(readOnly = true)
    @Override
    public Block<Exercise> getExercices(int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        Slice<Exercise> slice = exerciseDao.findAllByOrderById(pageable);
        
        return new Block<>(slice.getContent(), slice.hasNext());
    }
}
//añadir al service