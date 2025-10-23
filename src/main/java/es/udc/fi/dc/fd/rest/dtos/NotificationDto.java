package es.udc.fi.dc.fd.rest.dtos;

public class NotificationDto {
    private Long id;
    private String message;
    private boolean isRead;
    private String date;

    public NotificationDto(Long id, String message, boolean isRead, String date) {
        this.id = id;
        this.message = message;
        this.isRead = isRead;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
