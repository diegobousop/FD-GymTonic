package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FollowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id")
    private Users sender; // quien solicita seguir

    @ManyToOne(optional = false)
    @JoinColumn(name = "receiver_id")
    private Users receiver; // quien recibe la solicitud

    private LocalDateTime createdAt;
    private boolean accepted;

    public FollowRequest() {}

    public FollowRequest(Users sender, Users receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.createdAt = LocalDateTime.now();
        this.accepted = false;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public Users getSender() { return sender; }
    public Users getReceiver() { return receiver; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
}
