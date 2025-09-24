package es.udc.fi.dc.fd.model.entities;


import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ExerciseDao extends JpaRepository<Exercise, Long> {

    boolean existsByExerciseName(String exerciseName);

    Slice<Exercise> findAllByOrderById(Pageable pageable);
        
}
