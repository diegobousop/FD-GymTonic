package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Optional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Slice;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;

import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;

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
    @Autowired
    private SerieDao serieDao;

    private Users createUser(String userName) {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        return new Users(userName, "12345", "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
    }

    @Test
    public void addExerciseTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("admin1", "12345");
        Long idExercise = exerciseService.addExercise(creator.getId(), new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Long idExercise2 = exerciseService.addExercise(creator.getId(), new Exercise("ejercicio de prueba 2", "ejercicio de prueba", grupoMuscular.PECHO,1));

        //los ejercicios deberian insertarse uno detras de otro
        // si el idExercise2 es el siguiente id a idExercise se han insertado correctamente
        assertEquals(idExercise, idExercise2 - 1); 

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "ejercicio de prueba 1");
        assertEquals(exercise1.getExerciseDescription(), "ejercicio de prueba");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
        assertEquals(exercise1.getNumeroSeries(), 1);
    }

    @Test
    public void addDuplicateExerciseTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("admin1", "12345");

        Long idExercise = exerciseService.addExercise(creator.getId(), new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        assertThrows(DuplicateInstanceException.class, () -> {
        Long idExercise2 = exerciseService.addExercise(creator.getId(), new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }

    @Test 
    public void getExercices() throws IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");

        Exercise exercise1 = new Exercise(
            "Push Up",
            "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.",
            grupoMuscular.PECHO,1
        );
    
        Exercise exercise2 = new Exercise(
            "Squat",
            "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA,1
        );
    
        Exercise exercise3 = new Exercise(
            "Pull Up",
            "An upper body exercise that primarily targets the back and biceps.",
            grupoMuscular.ESPALDA,1
        );
    
        Exercise exercise4 = new Exercise(
            "Lunge",
            "A lower body exercise that targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA,1
        );
    
        Exercise exercise5 = new Exercise(
            "Shoulder Press",
            "An upper body exercise that targets the shoulders and triceps.",
            grupoMuscular.HOMBROS,1
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

    @Test
    public void addExerciseAsTrainerTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("trainer1", "12345");
        Long idExercise = exerciseService.addExercise(creator.getId(), new Exercise("Push Up1",
                "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "Push Up1");
        assertEquals(exercise1.getExerciseDescription(), "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
        // al añadirlo un trainer, el ejercicio no deberia estar validado
        assertFalse(exercise1.isValidated());
    }

    @Test
    public void addExerciseAsAdminTest() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("admin1", "12345");
        Long idExercise = exerciseService.addExercise(creator.getId(), new Exercise("Push Up1",
                "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "Push Up1");
        assertEquals(exercise1.getExerciseDescription(), "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
        // al añadirlo un trainer, el ejercicio no deberia estar validado
        assertTrue(exercise1.isValidated());
        assertEquals(exercise1.getValidator().getId(), creator.getId());
    }

    @Test
    public void getExercicesValidatedExercises() throws IncorrectLoginException, DuplicateInstanceException{
        Users creator = userService.login("trainer1", "12345");
        //Creamos un ejercio sin validar
        exerciseService.addExercise(creator.getId(), new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Block<Exercise> returned = exerciseService.getExercices(0, 10);

        assertEquals(returned.getItems().size(), 5);
        assertFalse(returned.getExistMoreItems());
    }
    @Test
    public void createSeriesTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(),new Exercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
       Block<Serie> Series = exerciseService.createSeries(exercise1);

        assertEquals(Series.getItems(),serieDao.findByExercise(exercise1).getContent());
    }

    @Test
    public void createSeriesThrowTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(),new Exercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Block<Serie> Series = exerciseService.createSeries(exercise1);

        assertThrows(DuplicateInstanceException.class, () -> {
        exerciseService.createSeries(exercise1);});
    }
    @Test
    public void EditSerieTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(),new Exercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,3));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Block<Serie> Series = exerciseService.createSeries(exercise1);

        exerciseService.editSerie(Series.getItems().get(0),30,100);
        exerciseService.editSerie(Series.getItems().get(1),40,200);
        exerciseService.editSerie(Series.getItems().get(2),50,300);

        assertEquals(100,serieDao.getById(Series.getItems().get(0).getId()).getPeso());
        assertEquals(30,serieDao.getById(Series.getItems().get(0).getId()).getRepeticiones());
        assertEquals(200,serieDao.getById(Series.getItems().get(1).getId()).getPeso());
        assertEquals(40,serieDao.getById(Series.getItems().get(1).getId()).getRepeticiones());
        assertEquals(300,serieDao.getById(Series.getItems().get(2).getId()).getPeso());
        assertEquals(50,serieDao.getById(Series.getItems().get(2).getId()).getRepeticiones());
    }

    @Test
    public void  GetSerieTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(),new Exercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,3));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Block<Serie> Series = exerciseService.createSeries(exercise1);
        Serie serie=exerciseService.getSerie(Series.getItems().get(0).getId());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()),serie);
        assertNotEquals(exerciseService.getSerie(Series.getItems().get(1).getId()),serie);
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getRepeticiones(),serie.getRepeticiones());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getPeso(),serie.getPeso());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getExercise(),serie.getExercise());
    }

}
