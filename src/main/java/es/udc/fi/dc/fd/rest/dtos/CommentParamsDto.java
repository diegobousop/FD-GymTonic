package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentParamsDto {
    
    @NotBlank(message = "El mensaje no puede estar vacío")
    private String mensaje;

    @NotNull(message = "trainingId es obligatorio")
    private Long trainingId;

    public CommentParamsDto(){}

    public CommentParamsDto(String mensaje, Long trainingId){
        this.mensaje = mensaje;
        this.trainingId = trainingId;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }
}
