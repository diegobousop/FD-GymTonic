package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "Routine_Follow")
public class RoutineFollow {

    @EmbeddedId
    private RoutineFollowId id = new RoutineFollowId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("routineId")
    private Routine routine;

    private LocalDateTime followDate;

    public RoutineFollow() {}

    public RoutineFollow(Users user, Routine routine) {
        this.user = user;
        this.routine = routine;
        this.id = new RoutineFollowId(user.getId(), routine.getId());
        this.followDate = LocalDateTime.now();
    }

    public RoutineFollowId getId() { 
        return id;
    }
    public Users getUser() {
        return user;
    }
    public Routine getRoutine() {
        return routine;
    }
    public LocalDateTime getFollowDate() {
        return followDate;
    }
}
