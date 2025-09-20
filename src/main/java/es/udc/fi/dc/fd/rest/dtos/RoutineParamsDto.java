package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public class RoutineParamsDto {     /// CAMBIAR EXERCISE POR LONG (SON IDS)
    private String name;
    private Long duration; // Duration in minutes
    private List<Long> exercises;

    public RoutineParamsDto() {
    }

    public RoutineParamsDto(String name, Long duration, List<Long> exercises) {
        this.name = name;
        this.duration = duration;
        this.exercises = exercises;
    }
    @NotNull
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    @NotNull
    @Positive
    public Long getDuration() {
        return duration;
    }
    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public List<Long> getExercises() {
        return exercises;
    }
    public void setExercises(List<Long> exercises) {
        this.exercises = exercises;
    }
}
