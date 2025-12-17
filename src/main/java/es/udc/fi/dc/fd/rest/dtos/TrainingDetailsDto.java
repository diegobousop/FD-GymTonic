package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class TrainingDetailsDto {

    private Long id;
    private String name;
    private Long duration;
    private String description;
    private List<ExerciseRoutineDto> exercises;
    private LocalDateTime creationDate;
    private Long creatorId;
    private String creatorUserName;
    private String creatorAvatarBase64;
    private Long routineId;
    private String routineName;
    private boolean isPublic;
    private boolean routineIsPublic; // <-- nuevo campo

    public TrainingDetailsDto() {}

    public TrainingDetailsDto(Long id, String name, String description, Long duration,
        LocalDateTime creationDate, Long creatorId, String creatorUserName, String creatorAvatarBase64,
        Long routineId, String routineName, List<ExerciseRoutineDto> exercises, boolean isPublic,
        boolean routineIsPublic) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.creationDate = creationDate;
        this.creatorId = creatorId;
        this.creatorUserName = creatorUserName;
        this.creatorAvatarBase64 = creatorAvatarBase64;
        this.routineId = routineId;
        this.routineName = routineName;
        this.exercises = exercises;
        this.isPublic = isPublic;
        this.routineIsPublic = routineIsPublic;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ExerciseRoutineDto> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseRoutineDto> exercises) {
        this.exercises = exercises;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorUserName() {
        return creatorUserName;
    }

    public void setCreatorUserName(String creatorUserName) {
        this.creatorUserName = creatorUserName;
    }

    public String getCreatorAvatarBase64() {
        return creatorAvatarBase64;
    }

    public void setCreatorAvatarBase64(String creatorAvatarBase64) {
        this.creatorAvatarBase64 = creatorAvatarBase64;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public String getRoutineName() {
        return routineName;
    }

    public void setRoutineName(String routineName) {
        this.routineName = routineName;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public boolean isRoutineIsPublic() {
        return routineIsPublic;
    }

    public void setRoutineIsPublic(boolean routineIsPublic) {
        this.routineIsPublic = routineIsPublic;
    }
}
