package es.udc.fi.dc.fd.model.services.exceptions;

public class RoutineLimitReachedException extends Exception {


    private static final int ROUTINE_LIMIT = 3;

    public RoutineLimitReachedException() {
        super("Has llegado al límite de rutinas permitidas: " + ROUTINE_LIMIT);
    }

    /**
     * Devuelve el límite de rutinas (constante).
     */
    public int getRoutineLimit() {
        return ROUTINE_LIMIT;
    }
    
}
