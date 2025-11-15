package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class FollowRequestDto {

    private Long id;
    private Long senderId;
    private String senderUserName;
    private Long receiverId;
    private String receiverUserName;
    private LocalDateTime createdAt;
    private boolean accepted;

    public FollowRequestDto() {}

    public FollowRequestDto(Long id, Long senderId, String senderUserName,
                            Long receiverId, String receiverUserName,
                            LocalDateTime createdAt, boolean accepted) {
        this.id = id;
        this.senderId = senderId;
        this.senderUserName = senderUserName;
        this.receiverId = receiverId;
        this.receiverUserName = receiverUserName;
        this.createdAt = createdAt;
        this.accepted = accepted;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderUserName() { return senderUserName; }
    public void setSenderUserName(String senderUserName) { this.senderUserName = senderUserName; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverUserName() { return receiverUserName; }
    public void setReceiverUserName(String receiverUserName) { this.receiverUserName = receiverUserName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
}
