package es.udc.fi.dc.fd.model.services;

import java.lang.reflect.Array;
import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.Difficulty;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.SerieDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;



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
    private SerieDao serieDao;


    private Exercise createExercise(String name, String description, grupoMuscular grupo, int numeroSeries) {
        Exercise exercise = new Exercise(name, description, grupo, numeroSeries);
        exercise.setDifficulty(Difficulty.FACIL);
        exercise.setEquipment(Equipment.POLEA_CABLE);
        return exercise;
    }

    @Test
    public void addExerciseTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");
        Exercise ex1 = new Exercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1);
        ex1.setDifficulty(Difficulty.FACIL);
        ex1.setEquipment(Equipment.POLEA_CABLE);
        Long idExercise = exerciseService.addExercise(creator.getId(), ex1);

        Exercise ex2 = new Exercise("ejercicio de prueba 2", "ejercicio de prueba", grupoMuscular.PECHO,1);
        ex2.setDifficulty(Difficulty.INTERMEDIO);
        ex2.setEquipment(Equipment.MAQUINA);
        Long idExercise2 = exerciseService.addExercise(creator.getId(), ex2);

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
    public void addExercisePermissionExceptionTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("user1", "12345");
        assertThrows(PermissionException.class, () -> {
            exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }


    @Test
    public void addDuplicateExerciseTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");

        Long idExercise = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        assertThrows(DuplicateInstanceException.class, () -> {
        Long idExercise2 = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }

    @Test 
    public void getExercices() throws IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");

        Exercise exercise1 = createExercise(
            "Push Up",
            "A bodyweight exercise that primarily targets the chest, shoulders, and triceps.",
            grupoMuscular.PECHO,1
        );
    
        Exercise exercise2 = createExercise(
            "Squat",
            "A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA,1
        );
    
        Exercise exercise3 = createExercise(
            "Pull Up",
            "An upper body exercise that primarily targets the back and biceps.",
            grupoMuscular.ESPALDA,1
        );
    
        Exercise exercise4 = createExercise(
            "Lunge",
            "A lower body exercise that targets the quadriceps, hamstrings, and glutes.",
            grupoMuscular.PIERNA,1
        );
    
        // Añadir Burpees que también está en data.sql
        Exercise exercise5 = createExercise(
            "Burpees",
            "El burpee es un ejercicio fullbody que combina sentadilla, plancha y salto para trabajar fuerza, resistencia y cardio.",
            grupoMuscular.FULLBODY,1
        );
    
        Exercise exercise6 = createExercise(
            "Shoulder Press",
            "An upper body exercise that targets the shoulders and triceps.",
            grupoMuscular.HOMBRO,1  // Cambiar HOMBRO a HOMBROS
        );

        // Primera página: 4 primeros ejercicios
        List<Exercise> exercises = List.of(exercise1, exercise2, exercise3, exercise4);

        Block<Exercise> returned = exerciseService.getValidatedExercises(0, 4);

        assertEquals(
                exercises.stream().map(Exercise::getExerciseName).toList(),
                returned.getItems().stream().map(Exercise::getExerciseName).toList()
        );

        assertTrue(returned.getExistMoreItems());

        // Segunda página: Burpees y Shoulder Press
        List<Exercise> exercises2 = List.of(exercise5, exercise6);

        Block<Exercise> returned2 = exerciseService.getValidatedExercises(1, 4);

        assertEquals(
                exercises2.stream().map(Exercise::getExerciseName).toList(),
                returned2.getItems().stream().map(Exercise::getExerciseName).toList()
        );
        assertFalse(returned2.getExistMoreItems());
    }

    @Test
    public void addExerciseAsTrainerTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException{
        Users creator = userService.login("trainer1", "12345");
        Long idExercise = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "ejercicio de prueba 1");
        assertEquals(exercise1.getExerciseDescription(), "ejercicio de prueba");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
        // al añadirlo un trainer, el ejercicio no deberia estar validado
        assertFalse(exercise1.isValidated());
    }

    @Test
    public void addExerciseAsAdminTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");
        Long idExercise = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "ejercicio de prueba 1");
        assertEquals(exercise1.getExerciseDescription(), "ejercicio de prueba");
        assertEquals(exercise1.getGrupoMuscular(), grupoMuscular.PECHO);
        // al añadirlo un trainer, el ejercicio no deberia estar validado
        assertTrue(exercise1.isValidated());
        assertEquals(exercise1.getValidator().getId(), creator.getId());
    }

    @Test
    public void getExercicesValidatedExercises() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        //Creamos un ejercio sin validar
        exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Block<Exercise> returned = exerciseService.getValidatedExercises(0, 10);

        assertEquals(returned.getItems().size(), 6);
        assertFalse(returned.getExistMoreItems());
    }
    @Test
    public void createSeriesTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
       Block<Serie> Series = exerciseService.createSeries(exercise1, Optional.empty(),1L);

        assertEquals(Series.getItems(),serieDao.findByExercise(exercise1).getContent());
    }


    @Test
    public void EditSerieTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,3));

        Exercise exercise1 = exerciseDao.getById(idExercise);

        Block<Serie> Series = exerciseService.createSeries(exercise1,Optional.empty(),1L);

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
    public void  GetSerieTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,3));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Block<Serie> Series = exerciseService.createSeries(exercise1,Optional.empty(), 1L);
        Serie serie=exerciseService.getSerie(Series.getItems().get(0).getId());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()),serie);
        assertNotEquals(exerciseService.getSerie(Series.getItems().get(1).getId()),serie);
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getRepeticiones(),serie.getRepeticiones());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getPeso(),serie.getPeso());
        assertEquals(exerciseService.getSerie(Series.getItems().get(0).getId()).getExercise(),serie.getExercise());
    }

    @Test
    public void getSeriesByExerciseAndRoutineTest() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,3));
        Block<Serie> series= exerciseService.getSeriesByExerciseAndRoutine(idExercise, 1L);
        assertEquals(true,series.getItems().isEmpty());
        exerciseService.createSeries(exerciseDao.getById(idExercise),Optional.empty(),1L);
        series= exerciseService.getSeriesByExerciseAndRoutine(idExercise,1L );
        assertEquals(series,exerciseService.getSeriesByExerciseAndRoutine(idExercise, 1L));

    }

    @Test
    public void validateExerciseSuccessTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {

        Users trainer = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        Exercise exercise2 = exerciseService.validateExercise(admin.getId(), idExercise);
        assertTrue(exercise2.isValidated());

    }

    @Test
    public void validateExerciseAlreadyValidatedExceptionTest() throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        exercise1.setValidated(true);
        exerciseDao.save(exercise1);

        assertThrows(AlreadyValidatedException.class, () -> exerciseService.validateExercise(admin.getId(), idExercise));
    }

    @Test
    public void validateExercisePermissionExceptionTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");


        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.validateExercise(trainer.getId(), idExercise));
    }

    @Test
    public void validateExercisePermissionException2Test() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");
        Users user1 = userService.login("user1", "12345");


        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.validateExercise(user1.getId(), idExercise));
    }

    @Test
    public void declineExerciseSuccessTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {

        Users trainer = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        exerciseService.declineExercise(admin.getId(), idExercise);

        Optional<Exercise> declinedExercise = exerciseDao.findById(idExercise);
        assertTrue(declinedExercise.isEmpty());
    }

    @Test
    public void declineExerciseAlreadyValidatedExceptionTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        exercise1.setValidated(true);
        exerciseDao.save(exercise1);

        assertThrows(AlreadyValidatedException.class, () -> exerciseService.declineExercise(admin.getId(), idExercise));
    }

    @Test
    public void declineExercisePermissionExceptionTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.declineExercise(trainer.getId(), idExercise));
    }

    @Test
    public void declineExercisePermissionException2Test() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");
        Users user1 = userService.login("user1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.declineExercise(user1.getId(), idExercise));
    }

    @Test
    public void declineExerciseInstanceNotFoundExceptionTest() 
    throws IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users admin = userService.login("admin1", "12345");

        Long nonExistentExerciseId = 99999L;

        assertThrows(InstanceNotFoundException.class, () -> exerciseService.declineExercise(admin.getId(), nonExistentExerciseId));
    }

    

    






}
