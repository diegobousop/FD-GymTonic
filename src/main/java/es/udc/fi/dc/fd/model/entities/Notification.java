package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Notification {
    private Long id;
    private Users receiver;
    private Users sender;
    private Routine routine;
    private Training training;
    private String message;
    private Boolean isRead;
    private LocalDateTime date;

    public Notification() {
    }

    public Notification(Users receiver, Users sender, Routine routine, Training training, String message, Boolean isRead, LocalDateTime date) {
        this.receiver = receiver;
        this.sender = sender;
        this.routine = routine;
        this.training = training;
        this.message = message;
        this.isRead = isRead;
        this.date = date;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne
    @JoinColumn(name = "receiverId")
    public Users getReceiver() {
        return receiver;
    }
    public void setReceiver(Users receiver) {
        this.receiver = receiver;
    }

    @ManyToOne
    @JoinColumn(name = "senderId")
    public Users getSender() {
        return sender;
    }
    public void setSender(Users sender) {
        this.sender = sender;
    }

    @ManyToOne
    @JoinColumn(name = "routineId")
    public Routine getRoutine() {
        return routine;
    }
    public void setRoutine(Routine routine) {
        this.routine = routine;
    }

    @ManyToOne
    @JoinColumn(name = "trainingId")
    public Training getTraining() {
        return training;
    }
    public void setTraining(Training training) {
        this.training = training;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getDate() {
        return date;
    }
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

}
