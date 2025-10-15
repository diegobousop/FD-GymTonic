package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

/**
 * DTO unificado para devolver resultados completos de búsqueda:
 * puede representar un usuario, una rutina o un ejercicio.
 */
public class SearchFullDto {

    private Long id;
    private String type;              // "user", "routine" o "exercise"
    private String name;              // nombre de usuario, rutina o ejercicio
    private String avatarBase64;      // solo para usuario
    private String creatorUsername;   // solo para rutina
    private List<String> exercises;   // solo para rutina
    private String grupoMuscular;     // solo para ejercicio

    public SearchFullDto() {}

    public SearchFullDto(Long id, String type, String name) {
        this.id = id;
        this.type = type;
        this.name = name;
    }

    public static SearchFullDto fromUser(Long id, String username, String avatarBase64) {
        SearchFullDto dto = new SearchFullDto(id, "user", username);
        dto.setAvatarBase64(avatarBase64);
        return dto;
    }

    public static SearchFullDto fromRoutine(Long id, String name, String creatorUsername, List<String> exercises) {
        SearchFullDto dto = new SearchFullDto(id, "routine", name);
        dto.setCreatorUsername(creatorUsername);
        dto.setExercises(exercises);
        return dto;
    }

    public static SearchFullDto fromExercise(Long id, String exerciseName, String grupoMuscular) {
        SearchFullDto dto = new SearchFullDto(id, "exercise", exerciseName);
        dto.setGrupoMuscular(grupoMuscular);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarBase64() {
        return avatarBase64;
    }

    public void setAvatarBase64(String avatarBase64) {
        this.avatarBase64 = avatarBase64;
    }

    public String getCreatorUsername() {
        return creatorUsername;
    }

    public void setCreatorUsername(String creatorUsername) {
        this.creatorUsername = creatorUsername;
    }

    public List<String> getExercises() {
        return exercises;
    }

    public void setExercises(List<String> exercises) {
        this.exercises = exercises;
    }

    public String getGrupoMuscular() {
        return grupoMuscular;
    }

    public void setGrupoMuscular(String grupoMuscular) {
        this.grupoMuscular = grupoMuscular;
    }
}
