package es.udc.fi.dc.fd.rest.dtos.user;

public class UserStatsParamsDto {
    private Long userProfileId;
    private int numReps;
    private String period;

    public UserStatsParamsDto() {}

    public UserStatsParamsDto(Long userProfileId, int numReps, String period) {
        this.userProfileId = userProfileId;
        this.numReps = numReps;
        this.period = period;
    }

    public Long getUserProfileId() {
        return userProfileId;
    }
    public void setUserProfileId(Long userProfileId) {
        this.userProfileId = userProfileId;
    }

    public int getNumReps() {
        return numReps;
    }

    public void setNumReps(int numReps) {
        this.numReps = numReps;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }
}
