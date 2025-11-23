package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface SerieDao extends JpaRepository<Serie, Long> {

    Page<Serie> findByExercise (Exercise exercise, Pageable pageable);

    Page<Serie> findByExercise_ExerciseName(String exerciseName, Pageable pageable);

    @Query("SELECT s FROM Serie s WHERE s.routine = :routine AND s.exercise = :exercise AND s.training IS NULL")
    List<Serie> findByRoutineAndExercise(Routine routine, Exercise exercise);
    
    List<Serie> findByTrainingId(Long trainingId);
    
    List<Serie> findByExerciseIdAndTrainingId(Long exerciseId, Long trainingId);

    List<Serie> findByRoutineId(Long routineId);
}
