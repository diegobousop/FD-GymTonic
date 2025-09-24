package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class InvalidRoutineNameException extends Exception {
    private String name;


    public InvalidRoutineNameException(String name){
        this.name=name;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name=name;
    }
}
