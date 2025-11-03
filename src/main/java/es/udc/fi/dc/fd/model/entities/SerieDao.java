package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface SerieDao extends JpaRepository<Serie, Long> {

    Slice<Serie> findByExercise (Exercise exercise );

    Slice<Serie> findByExercise_ExerciseName(String exerciseName);

    @Query("SELECT s FROM Serie s WHERE s.routine = :routine AND s.exercise = :exercise AND s.training IS NULL")
    List<Serie> findByRoutineAndExercise(Routine routine, Exercise exercise);
    
    List<Serie> findByTrainingId(Long trainingId);

    List<Serie> findByRoutineId(Long routineId);
}
