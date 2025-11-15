package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Routine_Exercise")
public class RoutineExercise {

    @EmbeddedId
    private RoutineExerciseId id;

    @MapsId("routineId")
    @ManyToOne
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @MapsId("exerciseId")
    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "order_in_routine", nullable = false)
    private int orderInRoutine;

    @Column(name = "rest_time", nullable = false)
    private int restTime; // en segundos


    // --- Getters y Setters ---
    public RoutineExerciseId getId() { return id; }
    public void setId(RoutineExerciseId id) { this.id = id; }

    public Routine getRoutine() { return routine; }
    public void setRoutine(Routine routine) { this.routine = routine; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public int getOrderInRoutine() { return orderInRoutine; }
    public void setOrderInRoutine(int orderInRoutine) { this.orderInRoutine = orderInRoutine; }

    public int getRestTime() { return restTime; }
    public void setRestTime(int restTime) { this.restTime = restTime; }
}
