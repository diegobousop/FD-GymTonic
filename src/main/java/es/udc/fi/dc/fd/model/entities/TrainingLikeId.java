package es.udc.fi.dc.fd.model.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class TrainingLikeId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long userId;
    private Long trainingId;

    public TrainingLikeId() {}

    public TrainingLikeId(Long userId, Long trainingId) {
        this.userId = userId;
        this.trainingId = trainingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TrainingLikeId that = (TrainingLikeId) o;
        return Objects.equals(userId, that.userId) && 
               Objects.equals(trainingId, that.trainingId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, trainingId);
    }
}
