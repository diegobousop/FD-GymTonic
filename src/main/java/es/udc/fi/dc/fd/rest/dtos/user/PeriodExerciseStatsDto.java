package es.udc.fi.dc.fd.rest.dtos.user;
import java.time.LocalDate;
import java.util.List;

public class PeriodExerciseStatsDto {
    private LocalDate startDate;
    private List<ExercisesStatsDto> exerciseStats;

    public PeriodExerciseStatsDto() {
    }
    public PeriodExerciseStatsDto(LocalDate startDate, List<ExercisesStatsDto> exerciseStats) {
        this.startDate = startDate;
        this.exerciseStats = exerciseStats;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public List<ExercisesStatsDto> getExerciseStats() {
        return exerciseStats;
    }
    public void setExerciseStats(List<ExercisesStatsDto> exerciseStats) {
        this.exerciseStats = exerciseStats;
    }
    
}
