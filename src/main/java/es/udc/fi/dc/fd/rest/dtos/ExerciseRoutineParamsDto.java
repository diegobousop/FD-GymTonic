package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

public class ExerciseRoutineParamsDto {

    private Long id;

    private String name;

    private List<SerieParamsDto> series;


    public ExerciseRoutineParamsDto() {
    }

    public ExerciseRoutineParamsDto(Long id, String name, List<SerieParamsDto> series) {
        this.id = id;
        this.name = name;
        this.series = series;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<SerieParamsDto> getSeries() {
        return series;
    }

    public void setSeries(List<SerieParamsDto> series) {
        this.series = series;
    }

    
    
}
