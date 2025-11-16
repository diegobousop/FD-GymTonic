package es.udc.fi.dc.fd.rest.dtos;

public class NotificationDto {
    private Long id;
    private Long routineId;
    private String message;
    private boolean isRead;
    private String date;

    public NotificationDto(Long id, Long routineId, String message, boolean isRead, String date) {
        this.id = id;
        this.routineId = routineId;
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

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
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
