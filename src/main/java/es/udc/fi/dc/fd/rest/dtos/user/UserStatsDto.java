package es.udc.fi.dc.fd.rest.dtos.user;
import java.util.List;

import es.udc.fi.dc.fd.rest.dtos.ImageDto;

public class UserStatsDto {
    private Long userId;
    private String period;
    private List<ImageDto> muscleGroupImages;
    private List<PeriodExerciseStatsDto> periodExerciseStats;
    private List<PeriodMuscularGroupStatsDto> periodMuscularGroupStats;

    public UserStatsDto() {
    }
    public UserStatsDto(Long userId, String period, List<ImageDto> muscleGroupImages, List<PeriodExerciseStatsDto> periodExerciseStats, List<PeriodMuscularGroupStatsDto> periodMuscularGroupStats) {
        // Constructor with images
        this.userId = userId;
        this.period = period;
        this.muscleGroupImages = muscleGroupImages;
        this.periodExerciseStats = periodExerciseStats;
        this.periodMuscularGroupStats = periodMuscularGroupStats;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public List<PeriodExerciseStatsDto> getPeriodExerciseStats() {
        return periodExerciseStats;
    }
    public void setPeriodExerciseStats(List<PeriodExerciseStatsDto> periodExerciseStats) {
        this.periodExerciseStats = periodExerciseStats;
    }
    public List<PeriodMuscularGroupStatsDto> getPeriodMuscularGroupStats() {
        return periodMuscularGroupStats;
    }
    public void setPeriodMuscularGroupStats(List<PeriodMuscularGroupStatsDto> periodMuscularGroupStats) {
        this.periodMuscularGroupStats = periodMuscularGroupStats;
    }
    public String getPeriod() {
        return period;
    }
    public void setPeriod(String period) {
        this.period = period;
    }
    public List<ImageDto> getMuscleGroupImages() {
        return muscleGroupImages;
    }
    public void setMuscleGroupImages(List<ImageDto> muscleGroupImages) {
        this.muscleGroupImages = muscleGroupImages;
    }
}
    
