package es.udc.fi.dc.fd.model.services.exceptions;

import org.junit.Test;
import static org.junit.Assert.*;

public class ServiceExceptionsTest {

    @Test
    public void testLoginUserBlockedExceptionDefaultConstructor() {
        LoginUserBlockedException ex = new LoginUserBlockedException();
        assertNotNull(ex);
        assertNull(ex.getMessage());
    }

    @Test
    public void testIncorrectPasswordExceptionDefaultConstructor() {
        IncorrectPasswordException ex = new IncorrectPasswordException();
        assertNotNull(ex);
        assertNull(ex.getMessage());
    }

    @Test
    public void testIncorrectLoginException() {
        IncorrectLoginException ex = new IncorrectLoginException("user", "pass");
        assertEquals("user", ex.getUserName());
        assertEquals("pass", ex.getPassword());
        assertNull(ex.getMessage());
    }

    @Test
    public void testInvalidRoutineNameException() {
        InvalidRoutineNameException ex = new InvalidRoutineNameException("RutinaX");
        assertEquals("RutinaX", ex.getName());
        ex.setName("RutinaY");
        assertEquals("RutinaY", ex.getName());
    }

    @Test
    public void testRoutineExerciseLimitReachedException() {
        RoutineExerciseLimitReachedException ex = new RoutineExerciseLimitReachedException();
        assertTrue(ex.getMessage().contains("RoutineExerciseLimitReachedException"));
        assertEquals(5, ex.getRoutineExerciseLimit());
    }

    @Test
    public void testRoutineLimitReachedException() {
        RoutineLimitReachedException ex = new RoutineLimitReachedException();
        assertTrue(ex.getMessage().contains("Has llegado al límite"));
        assertEquals(3, ex.getRoutineLimit());
    }
}
