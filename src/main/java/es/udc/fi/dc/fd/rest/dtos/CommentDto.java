package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class CommentDto {

    private Long id;

    private String mensaje;

    private LocalDateTime fecha;

    private Long trainingId;

    private Long userId;

    public CommentDto(){}

    public CommentDto(String mensaje, LocalDateTime fecha, Long trainingId, Long userId){
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.trainingId = trainingId;
        this.userId = userId;
    }

    public CommentDto(Long id, String mensaje, LocalDateTime fecha, Long trainingId, Long userId){
        this.id = id;
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.trainingId = trainingId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
