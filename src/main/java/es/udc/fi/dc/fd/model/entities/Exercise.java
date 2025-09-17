package es.udc.fi.dc.fd.model.entities;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Exercise {
    private Long id;
    private String name;  
    private String description;  
    private grupoMuscular grupoMuscular;

    public enum grupoMuscular {PECHO, ESPALDA, PIERNA, HOMBROS, BRAZOS, ABDOMEN};

    @Id
    @Generated(value = "ID_GENERATOR") 
    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public grupoMuscular getGrupoMuscular() {
        return grupoMuscular;
    }

    public void setGrupoMuscular(grupoMuscular grupoMuscular) {
        this.grupoMuscular = grupoMuscular;
    }
}