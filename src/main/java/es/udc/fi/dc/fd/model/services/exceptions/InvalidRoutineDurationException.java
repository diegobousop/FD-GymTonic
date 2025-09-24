package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class InvalidRoutineDurationException extends Exception{
    private Long duration;


    public InvalidRoutineDurationException(Long duration){
        this.duration=duration;
    }

    public Long getDuration(){
        return duration;
    }

    public void setDuration(Long name){
        this.duration=name;
    }
}
