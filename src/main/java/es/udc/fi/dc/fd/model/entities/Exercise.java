package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Exercise {
    private Long id;
    private String exerciseName;  
    private String exerciseDescription;  
    private grupoMuscular grupoMuscular;

    public enum grupoMuscular {PECHO, ESPALDA, PIERNA, HOMBROS, BRAZOS, ABDOMEN};

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
}