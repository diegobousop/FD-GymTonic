package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
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
    private boolean validated;
    private Users validator;

    public enum grupoMuscular {PECHO, ESPALDA, PIERNA, HOMBROS, BRAZOS, ABDOMEN};

    public Exercise() {}
    public Exercise(String exerciseName, String exerciseDescripcion, grupoMuscular grupo){
        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescripcion;
        this.grupoMuscular = grupo;
        this.validated = false;
        this.validator=null;
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
}