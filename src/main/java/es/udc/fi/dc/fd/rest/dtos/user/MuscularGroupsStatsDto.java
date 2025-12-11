package es.udc.fi.dc.fd.rest.dtos.user;

import java.time.LocalDate;
import java.util.Map;

public class MuscularGroupsStatsDto {
    private LocalDate date;
    private Map<String, Integer> exerciseCount;

    public MuscularGroupsStatsDto() {

    }

    public MuscularGroupsStatsDto(LocalDate date, Map<String, Integer> exerciseCount) {
        this.date = date;
        this.exerciseCount = exerciseCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Map<String, Integer> getExerciseCount() {
        return exerciseCount;
    }

    public void setExerciseCount(Map<String, Integer> exerciseCount) {
        this.exerciseCount = exerciseCount;
    }

                                                                                                        
}
