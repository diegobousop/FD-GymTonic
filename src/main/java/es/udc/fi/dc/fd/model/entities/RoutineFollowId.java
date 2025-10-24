package es.udc.fi.dc.fd.model.entities;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class RoutineFollowId implements Serializable {
    private Long userId;
    private Long routineId;

    public RoutineFollowId() {}
    public RoutineFollowId(Long userId, Long routineId) {
        this.userId = userId;
        this.routineId = routineId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoutineFollowId)) return false;
        RoutineFollowId that = (RoutineFollowId) o;
        return userId.equals(that.userId) && routineId.equals(that.routineId);
    }

    @Override
    public int hashCode() {
        return userId.hashCode() + routineId.hashCode();
    }
}
