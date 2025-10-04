package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Optional;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ExerciseServiceTest {
    
    @Autowired
    private UserService userService;

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private AvatarDao avatarDao;

    private Users createUser(String userName) {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        return new Users(userName, "12345", "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
    }

    @Test
    public void addExerciseTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("admin1", "12345");
        Long idExercise = exerciseService.addExercise(new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO));

        Long idExercise2 = exerciseService.addExercise(new Exercise("ejercicio de prueba 2", "ejercicio de prueba", grupoMuscular.PECHO));

        //los ejercicios deberian insertarse uno detras de otro
        // si el idExercise2 es el siguiente id a idExercise se han insertado correctamente
        assertEquals(idExercise, idExercise2 - 1); 

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "ejercicio de prueba 1");
        assertEquals(exercise1.getExerciseDescription(), "ejercicio de prueba");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
    }

    @Test
    public void addDuplicateExerciseTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("admin1", "12345");

        Long idExercise = exerciseService.addExercise(new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO));
        assertThrows(DuplicateInstanceException.class, () -> {
        Long idExercise2 = exerciseService.addExercise(new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO));     
        });
    }

    @Test 
    public void getExercices() throws IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");

        Exercise exercise1 = new Exercise(
            "Push Up",
            "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.",
            grupoMuscular.PECHO
        );
    
        Exercise exercise2 = new Exercise(
            "Squat",
            "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA
        );
    
        Exercise exercise3 = new Exercise(
            "Pull Up",
            "An upper body exercise that primarily targets the back and biceps.",
            grupoMuscular.ESPALDA
        );
    
        Exercise exercise4 = new Exercise(
            "Lunge",
            "A lower body exercise that targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA
        );
    
        Exercise exercise5 = new Exercise(
            "Shoulder Press",
            "An upper body exercise that targets the shoulders and triceps.",
            grupoMuscular.HOMBROS
        );

        List<Exercise> exercises = List.of(exercise1, exercise2, exercise3, exercise4);

        Block<Exercise> returned = exerciseService.getExercices(0, 4);

        assertEquals(
                exercises.stream().map(Exercise::getExerciseName).toList(),
                returned.getItems().stream().map(Exercise::getExerciseName).toList()
        );

        assertTrue(returned.getExistMoreItems());

        List<Exercise> exercises2 = List.of(exercise5);


        Block<Exercise> returned2 = exerciseService.getExercices(1, 4);

        assertEquals(
                exercises2.stream().map(Exercise::getExerciseName).toList(),
                returned2.getItems().stream().map(Exercise::getExerciseName).toList()
        );
        assertFalse(returned2.getExistMoreItems());
    }

}
