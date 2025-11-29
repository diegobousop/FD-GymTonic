package es.udc.fi.dc.fd.model.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class RoutineLikeId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long userId;
    private Long routineId;

    public RoutineLikeId() {}

    public RoutineLikeId(Long userId, Long routineId) {
        this.userId = userId;
        this.routineId = routineId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoutineLikeId that = (RoutineLikeId) o;
        return Objects.equals(userId, that.userId) && 
               Objects.equals(routineId, that.routineId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, routineId);
    }
}
