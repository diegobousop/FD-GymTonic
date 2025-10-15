package es.udc.fi.dc.fd.model.services.exceptions;

public class AlreadyValidatedException extends Exception {
    private Long exerciseId;

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public AlreadyValidatedException(String name, Long exerciseId) {
        this.exerciseId = exerciseId;
    }
    
}
