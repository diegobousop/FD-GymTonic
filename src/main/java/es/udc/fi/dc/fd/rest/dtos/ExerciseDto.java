package es.udc.fi.dc.fd.rest.dtos;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExerciseDto {
    private String name;
    private String descripcion;
    private grupoMuscular grupoMuscular;

    public ExerciseDto() {}

    public ExerciseDto(String name, String descripcion,  grupoMuscular grupoMuscular){
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
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
}
