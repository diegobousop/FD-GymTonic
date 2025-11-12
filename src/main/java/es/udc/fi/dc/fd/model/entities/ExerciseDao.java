package es.udc.fi.dc.fd.model.entities;


import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseDao extends JpaRepository<Exercise, Long> {

    boolean existsByExerciseName(String exerciseName);

    Slice<Exercise> findAllByOrderById(Pageable pageable);

    Slice<Exercise> findAllByValidatedTrueOrderById(Pageable pageable);

    Slice<Exercise> findAllByValidatedFalseOrderById(Pageable pageable);

    @Query(value = "SELECT DISTINCT e.* " +
                   "FROM Exercise e " +
                   "JOIN Serie s ON s.exerciseId = e.id " +
                   "WHERE s.trainingId = :trainingId",
           nativeQuery = true)
    List<Exercise> findExercisesByTrainingId(@Param("trainingId") Long trainingId);
}
