package es.udc.fi.dc.fd.model.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class RoutineExerciseId implements Serializable {

    @Column(name = "routine_id")
    private Long routineId;

    @Column(name = "exercise_id")
    private Long exerciseId;

    public RoutineExerciseId() {}

    public RoutineExerciseId(Long routineId, Long exerciseId) {
        this.routineId = routineId;
        this.exerciseId = exerciseId;
    }

    public Long getRoutineId() { return routineId; }
    public void setRoutineId(Long routineId) { this.routineId = routineId; }

    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoutineExerciseId)) return false;
        RoutineExerciseId that = (RoutineExerciseId) o;
        return Objects.equals(routineId, that.routineId) &&
               Objects.equals(exerciseId, that.exerciseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(routineId, exerciseId);
    }
}
