package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Exercise.Difficulty;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExerciseRoutineDto {

    private Long id;

    private String name;

    private String descripcion;

    private grupoMuscular grupoMuscular;

    private int numeroSeries;

    private Difficulty difficulty;

    private Equipment equipment;
    
    private List<SerieSummaryDto> series;

    private String exerciseImageBase64;

    private int orderInRoutine;

    private int restTime;


    public ExerciseRoutineDto(Long id, String name, String descripcion, grupoMuscular grupoMuscular, int numeroSeries, Difficulty difficulty, Equipment equipment,
            List<SerieSummaryDto> series, String exerciseImageBase64, int restTime, int orderInRoutine) {
        this.id = id;
        this.name = name;
        this.descripcion = descripcion;
        this.grupoMuscular = grupoMuscular;
        this.numeroSeries = numeroSeries;
        this.exerciseImageBase64 = exerciseImageBase64;
        this.difficulty = difficulty;
        this.equipment = equipment;
        this.series = series;
        this.restTime = restTime;
        this.orderInRoutine = orderInRoutine;
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

    @NotNull
    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    @NotNull
    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public List<SerieSummaryDto> getSeries() {
        return series;
    }

    public void setSeries(List<SerieSummaryDto> series) {
        this.series = series;
    }

    public String getExerciseImageBase64() {
        return exerciseImageBase64;
    }

    public void setExerciseImageBase64(String exerciseImageBase64) {
        this.exerciseImageBase64 = exerciseImageBase64;
    }

    public int getOrderInRoutine() {return orderInRoutine;}

    public void setOrderInRoutine(int orderInRoutine) {this.orderInRoutine = orderInRoutine;}

    public int getRestTime() {return restTime;}

    public void setRestTime(int restTime) {this.restTime = restTime;}


}
