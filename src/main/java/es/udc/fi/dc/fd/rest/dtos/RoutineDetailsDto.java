package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RoutineDetailsDto {

    private Long id;

    private String name;

    private List<ExerciseRoutineDto> exercises;

    private String creator;

    private String creatorAvatarBase64;

    private Long duration; // Duration in minutes

    private LocalDateTime modificationDate;
    
    private Boolean isPublic;

    public RoutineDetailsDto() {
    }

    public RoutineDetailsDto(Long id, String name, List<ExerciseRoutineDto> exercises, String creator, String creatorAvatarBase64, Long duration,
            LocalDateTime modificationDate, Boolean isPublic) {
        this.id = id;
        this.name = name;
        this.exercises = exercises;
        this.creator = creator;
        this.creatorAvatarBase64 = creatorAvatarBase64;
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
    public List<ExerciseRoutineDto> getExercises() {
        return exercises;
    }
    public void setExercises(List<ExerciseRoutineDto> exercises) {
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

    @NotNull
    public String getCreatorAvatarBase64() {
        return creatorAvatarBase64;
    }

    public void setCreatorAvatarBase64(String creatorAvatarBase64) {
        this.creatorAvatarBase64 = creatorAvatarBase64;
    }
}
