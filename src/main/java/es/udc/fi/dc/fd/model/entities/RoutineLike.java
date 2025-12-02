package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "Routine_Like")
public class RoutineLike {

    @EmbeddedId
    private RoutineLikeId id = new RoutineLikeId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("routineId")
    private Routine routine;

    private LocalDateTime likeDate;

    public RoutineLike() {}

    public RoutineLike(Users user, Routine routine) {
        this.user = user;
        this.routine = routine;
        this.id = new RoutineLikeId(user.getId(), routine.getId());
        this.likeDate = LocalDateTime.now();
    }

    public RoutineLikeId getId() { 
        return id;
    }
    
    public Users getUser() {
        return user;
    }
    
    public Routine getRoutine() {
        return routine;
    }
    
    public LocalDateTime getLikeDate() {
        return likeDate;
    }
}
