package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import jakarta.validation.constraints.NotNull;


public class TrainingParamsDto {

    private String name;

    private String description;

    private Long duration;

    private boolean visibility;

    private List<ExerciseRoutineParamsDto> exercises;

    private Long routineId;

    public TrainingParamsDto() {

    }

    public TrainingParamsDto(String name, String description, Long duration, boolean visibility,
            List<ExerciseRoutineParamsDto> exercises, Long routineId) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.visibility = visibility;
        this.exercises = exercises;
        this.routineId = routineId;
    }

    @NotNull
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @NotNull
    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    @NotNull
    public boolean getVisibility() {
        return visibility;
    }

    public void setVisibility(boolean visibility) {
        this.visibility = visibility;
    }

    public List<ExerciseRoutineParamsDto> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseRoutineParamsDto> exercises) {
        this.exercises = exercises;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }
}
