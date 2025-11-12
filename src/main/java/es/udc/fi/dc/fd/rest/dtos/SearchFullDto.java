package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Users.RoleType;

/**
 * DTO unificado para devolver resultados completos de búsqueda:
 * puede representar un usuario, una rutina o un ejercicio.
 */
public class SearchFullDto {

    private Long id;
    private String type;              // "user", "routine" o "exercise"
    private String name;              // nombre de usuario, rutina o ejercicio
    private String avatarBase64;      // solo para usuario
    private RoleType rol;             // solo para usuario

    // ---- Campos adicionales para rutina ----
    private String creatorUsername;   // nombre del creador
    private Integer duration;         // duración en minutos
    private List<SearchExerciseForRoutineDto> exercises; // ejercicios con número de series

    // ---- Campo para ejercicio ----
    private String grupoMuscular;     // grupo muscular del ejercicio

    public SearchFullDto() {}

    public SearchFullDto(Long id, String type, String name) {
        this.id = id;
        this.type = type;
        this.name = name;
    }

    public static SearchFullDto fromUser(Long id, String username, String avatarBase64, RoleType rol) {
        SearchFullDto dto = new SearchFullDto(id, "user", username);
        dto.setAvatarBase64(avatarBase64);
        dto.setRol(rol);
        return dto;
    }

    public static SearchFullDto fromRoutine(Long id, String name, String creatorUsername,
                                             Integer duration, List<SearchExerciseForRoutineDto> exercises) {
        SearchFullDto dto = new SearchFullDto(id, "routine", name);
        dto.setCreatorUsername(creatorUsername);
        dto.setDuration(duration);
        dto.setExercises(exercises);
        return dto;
    }

    public static SearchFullDto fromExercise(Long id, String exerciseName, String grupoMuscular) {
        SearchFullDto dto = new SearchFullDto(id, "exercise", exerciseName);
        dto.setGrupoMuscular(grupoMuscular);
        return dto;
    }

    // --- Getters y setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarBase64() { return avatarBase64; }
    public void setAvatarBase64(String avatarBase64) { this.avatarBase64 = avatarBase64; }

    public String getCreatorUsername() { return creatorUsername; }
    public void setCreatorUsername(String creatorUsername) { this.creatorUsername = creatorUsername; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public List<SearchExerciseForRoutineDto> getExercises() { return exercises; }
    public void setExercises(List<SearchExerciseForRoutineDto> exercises) { this.exercises = exercises; }

    public String getGrupoMuscular() { return grupoMuscular; }
    public void setGrupoMuscular(String grupoMuscular) { this.grupoMuscular = grupoMuscular; }

    public RoleType getRol(){return rol;}
    public void setRol(RoleType rol){this.rol = rol;}

}
