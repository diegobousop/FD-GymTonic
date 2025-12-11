package es.udc.fi.dc.fd.rest.dtos.user;

import java.time.LocalDate;
import java.util.List;

public class PeriodMuscularGroupStatsDto {
    private LocalDate startDate;
    private List<MuscularGroupsStatsDto> muscularGroupStats;

    public PeriodMuscularGroupStatsDto() {
    }
    public PeriodMuscularGroupStatsDto(LocalDate startDate, List<MuscularGroupsStatsDto> muscularGroupStats) {
        this.startDate = startDate;
        this.muscularGroupStats = muscularGroupStats;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public List<MuscularGroupsStatsDto> getMuscularGroupStats() {
        return muscularGroupStats;
    }
    public void setMuscularGroupStats(List<MuscularGroupsStatsDto> muscularGroupStats) {
        this.muscularGroupStats = muscularGroupStats;
    }
}
