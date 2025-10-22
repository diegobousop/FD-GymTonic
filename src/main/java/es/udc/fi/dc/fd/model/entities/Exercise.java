package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Exercise {
    private Long id;
    private String exerciseName;  
    private String exerciseDescription;  
    private grupoMuscular grupoMuscular;
    private int numeroSeries;
    private Users creator;
    private boolean validated;
    private Users validator;
    private Difficulty difficulty;
    private Equipment equipment;

    public enum grupoMuscular {PECHO, ESPALDA, PIERNA, HOMBROS, BRAZOS, ABDOMEN};
    
    public enum Difficulty {
        FACIL,       // 0
        INTERMEDIO,  // 1
        DIFICIL      // 2
    };
    
    public enum Equipment {
        POLEA_CABLE,  // 0
        MAQUINA,      // 1
        PESO_LIBRE,   // 2
        OTROS         // 3
    };

    public Exercise() {}
    public Exercise(String exerciseName, String exerciseDescripcion, grupoMuscular grupo, int numeroSeries) {
        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescripcion;
        this.grupoMuscular = grupo;
        this.numeroSeries = numeroSeries;
        this.validated = false;
        this.validator=null;
    }

    public Exercise(long id, String exerciseName, String exerciseDescripcion, grupoMuscular grupo, int numeroSeries) {
        this.id=id;
        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescripcion;
        this.grupoMuscular = grupo;
        this.numeroSeries = numeroSeries;
        this.validated = false;
        this.validator=null;
    }

    
    public Exercise(long id, String exerciseName, String exerciseDescripcion, grupoMuscular grupo, int numeroSeries, Users creator) {
        this.id=id;
        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescripcion;
        this.grupoMuscular = grupo;
        this.numeroSeries = numeroSeries;
        this.validated = false;
        this.validator=null;
        this.creator=creator;
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String name) {
        this.exerciseName = name;
    }

    public String getExerciseDescription() {
        return exerciseDescription;
    }

    public void setExerciseDescription(String description) {
        this.exerciseDescription = description;
    }
    @Enumerated(EnumType.STRING)
    public grupoMuscular getGrupoMuscular() {
        return grupoMuscular;
    }

    public void setGrupoMuscular(grupoMuscular grupoMuscular) {
        this.grupoMuscular = grupoMuscular;
    }

    public int getNumeroSeries() {return numeroSeries;}

    public void setNumeroSeries(int numeroSeries) {this.numeroSeries = numeroSeries;}

    @ManyToOne
    @JoinColumn(name="creator")
    public Users getCreator() {
        return creator;
    }
    public void setCreator(Users creator) {
        this.creator = creator;
    }

    public boolean isValidated() {
        return validated;
    }
    public void setValidated(boolean validated) {
        this.validated = validated;
    }
    @ManyToOne
    @JoinColumn(name="validator")
    public Users getValidator() {
        return validator;
    }
    public void setValidator(Users validator) {
        this.validator = validator;
    }

    @Enumerated(EnumType.ORDINAL)
    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    @Enumerated(EnumType.ORDINAL)
    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    @PrePersist
    private void applyDefaultsBeforePersist() {
        if (this.difficulty == null) {
            this.difficulty = Difficulty.FACIL;
        }
        if (this.equipment == null) {
            this.equipment = Equipment.OTROS;
        }
    }
}