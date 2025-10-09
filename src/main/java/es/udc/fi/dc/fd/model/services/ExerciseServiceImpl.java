package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {
    @Autowired
    private ExerciseDao exerciseDao;
    @Autowired
    private UserDao userDao;
    @Autowired
    private SerieDao serieDao;

    @Override
    public Long addExercise(Long userId,Exercise exercise) throws DuplicateInstanceException{

        if(exerciseDao.existsByExerciseName(exercise.getExerciseName())){
            throw new DuplicateInstanceException("project.entities.exercise", exercise.getExerciseName());
        }

        Users validator = userDao.findById(userId).get();
        if(validator.getRole().toString() == "ADMIN"){ // si el que añade es admin, se valida directamente
            exercise.setValidated(true);
            exercise.setValidator(validator);
        }

        exerciseDao.save(exercise);
        return exercise.getId();
    }


    @Transactional(readOnly = true)
    @Override
    public Block<Exercise> getExercices(int page, int size){
        //Devuelve solo los ejerciccios validados
        Pageable pageable = PageRequest.of(page, size);
        Slice<Exercise> slice = exerciseDao.findAllByValidatedTrueOrderById(pageable);
        
        return new Block<>(slice.getContent(), slice.hasNext());
    }


    @Override
    public Slice<Serie> createSeries(Exercise exercise) throws DuplicateInstanceException {

        if (serieDao.findByExercise(exercise).hasContent())
            throw new DuplicateInstanceException("project.entities.exercise", exercise.getExerciseName());
        for(int i=1;i<=exercise.getNumeroSeries();i++){
            Serie serie = new Serie(20,10,i,exercise);
            serieDao.save(serie);
        }
        return serieDao.findByExercise(exercise);
    }

    @Override
    public Serie editSerie(Serie serie, int repeticiones, int peso) throws DuplicateInstanceException {
        serie.setPeso(peso);
        serie.setRepeticiones(repeticiones);
        serieDao.save(serie);
        return serie;
    }
}
