package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
@Entity
public class Serie {

    private Long id;
    private int repeticiones;
    private int peso;
    private int numeroSerie;
    private Exercise exercise;
    private Routine routine;
    private Training training;

    public Serie() {}

    public Serie( int repeticiones, int peso, int numeroSerie ) {
        this.repeticiones = repeticiones;
        this.peso = peso;
        this.numeroSerie = numeroSerie;
    }

    public Serie( int repeticiones, int peso, int numeroSerie, Exercise exercise, Routine routine ) {
        this.repeticiones = repeticiones;
        this.peso = peso;
        this.numeroSerie = numeroSerie;
        this.exercise = exercise;
        this.routine = routine;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(java.lang.Long id) {
        this.id = id;
    }

    public int getPeso() {
        return peso;
    }

    public void setPeso(int peso) {
        this.peso = peso;
    }

    public int getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(int numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public int getRepeticiones() {
        return repeticiones;
    }

    public void setRepeticiones(int repeticiones) {
        this.repeticiones = repeticiones;
    }

    @ManyToOne
    @JoinColumn(name = "exerciseId")
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    @ManyToOne
    @JoinColumn(name = "routineId")
    public Routine getRoutine() { return routine; }
    public void setRoutine(Routine routine) { this.routine = routine; }

    @ManyToOne
    @JoinColumn(name = "trainingId")
    public Training getTraining() { return training; }
    public void setTraining(Training training) { this.training = training; }
}

