package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

public class CalendarStatsDto {

    List<CalendarTrainingDto> trainings;
    

    public CalendarStatsDto() { }

    public CalendarStatsDto(List<CalendarTrainingDto> trainings) {
        this.trainings = trainings;
    }

    public List<CalendarTrainingDto> getTrainings() {
        return trainings;
    }

    public void setTrainings(List<CalendarTrainingDto> trainings) {
        this.trainings = trainings;
    }
}
