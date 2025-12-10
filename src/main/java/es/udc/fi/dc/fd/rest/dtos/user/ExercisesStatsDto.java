package es.udc.fi.dc.fd.rest.dtos.user;

import java.util.Map;
import java.time.LocalDate;

public class ExercisesStatsDto{

    private LocalDate date;
    private Map<String, Integer> exerciseWeightsKg;
    private Map<String, String> exerciseGroup;

    private Map<String, Boolean> isPR;

    public ExercisesStatsDto() {}

        public ExercisesStatsDto(LocalDate date, Map<String, Integer> exerciseWeightsKg, Map<String, String> exerciseGroup, Map<String, Boolean> isPR) {
            this.date = date;
        this.exerciseWeightsKg = exerciseWeightsKg;
        this.exerciseGroup = exerciseGroup;
        this.isPR = isPR;
    }
    
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Map<String, Integer> getExerciseWeightsKg() {
        return exerciseWeightsKg;
    }

    public void setExerciseWeightsKg(Map<String, Integer> exerciseWeightsKg) {
        this.exerciseWeightsKg = exerciseWeightsKg;
    }

    public Map<String, Boolean> getIsPR() {
        return isPR;
    }

    public void setIsPR(Map<String, Boolean> isPR) {
        this.isPR = isPR;
    }

    public Map<String, String> getExerciseGroup() {
        return exerciseGroup;
    }

    public void setExerciseGroup(Map<String, String> exerciseGroup) {
        this.exerciseGroup = exerciseGroup;
    }
}
