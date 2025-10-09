package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;
@Entity
public class Serie {

    private Long id;
    private int repeticiones;
    private int peso;
    private int numeroSerie;
    private Exercise exercise;

    public Serie() {}

    public Serie( int repeticiones, int peso, int numeroSerie, Exercise exercise ) {
        this.repeticiones = repeticiones;
        this.peso = peso;
        this.numeroSerie = numeroSerie;
        this.exercise = exercise;
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
}
