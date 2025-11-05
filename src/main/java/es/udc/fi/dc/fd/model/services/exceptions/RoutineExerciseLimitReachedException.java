package es.udc.fi.dc.fd.model.services.exceptions;

public class RoutineExerciseLimitReachedException extends Exception {
    private static final int ROUTINE_EXERCISE_LIMIT = 5;

    public RoutineExerciseLimitReachedException() {
        super("project.exceptions.RoutineExerciseLimitReachedException" + ROUTINE_EXERCISE_LIMIT);
    }

    /**
     * Devuelve el límite de ejercicios por rutina (constante).
     */
    public int getRoutineExerciseLimit() {
        return ROUTINE_EXERCISE_LIMIT;
    }
}
