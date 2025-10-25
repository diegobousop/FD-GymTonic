package es.udc.fi.dc.fd.rest.dtos;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExerciseSummaryDto {
    private Long id;
    private String name;
    private String descripcion;
    private grupoMuscular grupoMuscular;
    private String ownerName;
    private AvatarDto ownerAvatar;
    private boolean blocked;



    public ExerciseSummaryDto() {}

    public ExerciseSummaryDto(Long id, String name, String descripcion,  grupoMuscular grupoMuscular, String ownerName, AvatarDto ownerAvatar) {
        this.id = id; 
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
        this.ownerName = ownerName;
        this.ownerAvatar = ownerAvatar;
        this.blocked = false;
    }

    public ExerciseSummaryDto(Long id, String name, String descripcion,  grupoMuscular grupoMuscular, String ownerName, AvatarDto ownerAvatar, boolean blocked) {
        this.id = id; 
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
        this.ownerName = ownerName;
        this.ownerAvatar = ownerAvatar;
        this.blocked = blocked;
    }

    @NotNull
    public Long getId() {
        return id;
    } 
    public void setId(Long id) {
        this.id = id;
    }

    @NotBlank
    @NotNull
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @NotBlank
    @NotNull
    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @NotBlank
    @NotNull 
    public grupoMuscular getGrupoMuscular() {
        return grupoMuscular;
    }

    public void setGrupoMuscular(grupoMuscular grupoMuscular) {
        this.grupoMuscular = grupoMuscular;
    }

    @NotBlank
    @NotNull
    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    @NotNull
    public AvatarDto getOwnerAvatar() {
        return ownerAvatar;
    }

    public void setOwnerAvatar(AvatarDto ownerAvatar) {
        this.ownerAvatar = ownerAvatar;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }
}
