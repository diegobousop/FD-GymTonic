package es.udc.fi.dc.fd.rest.dtos;

public class SearchExerciseForRoutineDto {

    private String name;       // nombre del ejercicio
    private int numeroSeries;  // número de series

    public SearchExerciseForRoutineDto() {} // necesario para Jackson

    public SearchExerciseForRoutineDto(String name, int numeroSeries) {
        this.name = name;
        this.numeroSeries = numeroSeries;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getNumeroSeries() { return numeroSeries; }
    public void setNumeroSeries(int numeroSeries) { this.numeroSeries = numeroSeries; }
}

