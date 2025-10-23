package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import jakarta.validation.constraints.NotNull;

public class SerieDto {
    private long Id;
    private Long exerciseId;
    private int numeroSerie;
    private int repeticiones;
    private int peso;
    private Long routineId;
    public SerieDto() {}

    public SerieDto(long id, int numeroSerie, int repeticiones, int peso,Exercise exercise, Routine routine) {
        this.Id = id;
        this.numeroSerie = numeroSerie;
        this.repeticiones = repeticiones;
        this.peso = peso;
        this.exerciseId = exercise.getId();
        this.routineId = routine.getId();
    }

    @NotNull
    public long getId() {return Id;}
    public void setId(long id) {Id = id;}

    @NotNull
    public int getNumeroSerie() {return numeroSerie;}
    public void setNumeroSerie(int numeroSerie) {this.numeroSerie = numeroSerie;}

    @NotNull
    public int getRepeticiones() {return repeticiones;}
    public void setRepeticiones(int repeticiones) {this.repeticiones = repeticiones;}

    @NotNull
    public int getPeso() {return peso;}
    public void setPeso(int peso) {this.peso = peso;}

    @NotNull
    public Long getExercise() {return exerciseId;}
    public void setExercise(Long exercise) {this.exerciseId = exercise;}

    @NotNull
    public Long getRoutine() {return routineId;}
    public void setRoutine(Long routine) {this.routineId = routine;}
}
