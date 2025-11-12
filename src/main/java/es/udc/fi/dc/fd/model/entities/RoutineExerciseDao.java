package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface RoutineExerciseDao extends JpaRepository<RoutineExercise, RoutineExerciseId>, JpaSpecificationExecutor<RoutineExercise>{
    List<RoutineExercise> findByRoutineId(Long routineId);
    
    RoutineExercise findByRoutineIdAndExerciseId(Long routineId, Long exerciseId);
}
