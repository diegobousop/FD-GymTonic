package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import jakarta.validation.constraints.NotNull;

public class SerieDto {
    private long Id;
    private Exercise exercise;
    private int numeroSerie;
    private int repeticiones;
    private int peso;
    private Routine routine;
    public SerieDto() {}

    public SerieDto(long id, int numeroSerie, int repeticiones, int peso,Exercise exercise, Routine routine) {
        this.Id = id;
        this.numeroSerie = numeroSerie;
        this.repeticiones = repeticiones;
        this.peso = peso;
        this.exercise = exercise;
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
    public Exercise getExercise() {return exercise;}
    public void setExercise(Exercise exercise) {this.exercise = exercise;}

    @NotNull
    public Routine getRoutine() {return routine;}
    public void setRoutine(Routine routine) {this.routine = routine;}
}
