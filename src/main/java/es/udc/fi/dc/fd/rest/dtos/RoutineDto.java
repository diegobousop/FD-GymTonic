package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import es.udc.fi.dc.fd.model.entities.Users;

public class RoutineDto {
    private Long id;
    private String name;
    private List<ExerciseDto> exercises;
    private Users creator;
    private Long duration; // Duration in minutes
    private LocalDateTime modificationDate;

    public RoutineDto() {
    }

    public RoutineDto(Long id, String name, List<ExerciseDto> exercises, Users creator, Long duration,
            LocalDateTime modificationDate) {
        this.id = id;
        this.name = name;
        this.exercises = exercises;
        this.creator = creator;
        this.duration = duration;
        this.modificationDate = modificationDate;
    }

    public RoutineDto(Long id, String name, List<ExerciseDto> exercises,  Long duration,
            LocalDateTime modificationDate) {
        this.id = id;
        this.name = name;
        this.exercises = exercises;
        this.duration = duration;
        this.modificationDate = modificationDate;
    }

    @NotNull
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    @NotNull
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    
    @NotNull
    public List<ExerciseDto> getExercises() {
        return exercises;
    }
    public void setExercises(List<ExerciseDto> exercises) {
        this.exercises = exercises;
    }

    @NotNull
    public Users getCreator() {
        return creator;
    }
    public void setCreator(Users creator) {
        this.creator = creator;
    }

    @NotNull
    @Positive
    public Long getDuration() {
        return duration;
    }
    public void setDuration(Long duration) {
        this.duration = duration;
    }

    @NotNull
    public LocalDateTime getModificationDate() {
        return modificationDate;
    }
    public void setModificationDate(LocalDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

}
