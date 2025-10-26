package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public class RoutineDto {
    private Long id;
    private String name;
    private List<ExerciseDto> exercises;
    private String creator;
    private Long duration; // Duration in minutes
    private LocalDateTime modificationDate;
    private Boolean isPublic;
    private Boolean isFollowing;

    public RoutineDto() {
    }

    public RoutineDto(Long id, String name, List<ExerciseDto> exercises, String creator, Long duration,
            LocalDateTime modificationDate, Boolean isPublic) {
        this.id = id;
        this.name = name;
        this.exercises = exercises;
        this.creator = creator;
        this.duration = duration;
        this.modificationDate = modificationDate;
        this.isPublic = isPublic;
    }

    public RoutineDto(Long id, String name, List<ExerciseDto> exercises,  Long duration,
            LocalDateTime modificationDate, Boolean isPublic) {
        this.id = id;
        this.name = name;
        this.exercises = exercises;
        this.duration = duration;
        this.modificationDate = modificationDate;
        this.isPublic = isPublic;
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
    public String getCreator() {
        return creator;
    }
    public void setCreator(String creator) {
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

    @NotNull
    public Boolean getIsPublic() {
        return isPublic;
    }
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Boolean getIsFollowing() { 
        return isFollowing;
    }

    public void setIsFollowing(Boolean isFollowing) {
        this.isFollowing = isFollowing;
    }
}
