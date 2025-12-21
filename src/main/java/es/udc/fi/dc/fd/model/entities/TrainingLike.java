package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "Training_Like")
public class TrainingLike {

    @EmbeddedId
    private TrainingLikeId id = new TrainingLikeId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("trainingId")
    private Training training;

    private LocalDateTime likeDate;

    public TrainingLike() {}

    public TrainingLike(Users user, Training training) {
        this.user = user;
        this.training = training;
        this.id = new TrainingLikeId(user.getId(), training.getId());
        this.likeDate = LocalDateTime.now();
    }

    public TrainingLikeId getId() { 
        return id;
    }
    
    public Users getUser() {
        return user;
    }
    
    public Training getTraining() {
        return training;
    }
    
    public LocalDateTime getLikeDate() {
        return likeDate;
    }
}
