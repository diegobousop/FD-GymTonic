package es.udc.fi.dc.fd.rest.dtos;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExerciseDto {
    private Long id;
    private String name;
    private String descripcion;
    private grupoMuscular grupoMuscular;
    private int numeroSeries;

    public ExerciseDto() {}

    public ExerciseDto(String name, String descripcion,  grupoMuscular grupoMuscular, int numeroSeries) {
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
        this.numeroSeries = numeroSeries;
    }

        public ExerciseDto(Long id, String name, String descripcion,  grupoMuscular grupoMuscular, int numeroSeries) {
        this.id = id;
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
        this.numeroSeries = numeroSeries;
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
    public int getNumeroSeries() {return numeroSeries;}

    public void setNumeroSeries(int numeroSeries) {this.numeroSeries = numeroSeries;}
}
