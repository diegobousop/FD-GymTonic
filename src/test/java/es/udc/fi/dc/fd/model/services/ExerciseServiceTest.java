package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNull;
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
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.Difficulty;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.SerieDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyValidatedException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
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

    @Autowired
    private AvatarDao avatarDao;

    private static final String PASSWORD = "password";

    private Exercise createExercise(String name, String description, grupoMuscular grupo, int numeroSeries) {
        Exercise exercise = new Exercise(name, description, grupo, numeroSeries);
        exercise.setDifficulty(Difficulty.FACIL);
        exercise.setEquipment(Equipment.POLEA_CABLE);
        return exercise;
    }

	private Users createUser(String userName, RoleType role, Gender gender) {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user =  new Users(userName, PASSWORD, "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
        user.setRole(role);
        user.setGender(gender);
        user.setHeight(190);
        user.setWeight(80);
        user.setBirthDate(LocalDate.now());
		return user;
	}

    @Test
    public void addExerciseTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
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
    public void addExercisePermissionExceptionTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("user1", "12345");
        assertThrows(PermissionException.class, () -> {
            exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }


    @Test
    public void addDuplicateExerciseTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");

        Long idExercise = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        assertThrows(DuplicateInstanceException.class, () -> {
        Long idExercise2 = exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }

    @Test 
    public void getExercices() throws LoginUserBlockedException, IncorrectLoginException{
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
            grupoMuscular.HOMBRO,1
        );

        List<Exercise> exercises = List.of(exercise1, exercise2, exercise3, exercise4);

        Block<Exercise> returned = exerciseService.getValidatedExercises(0, 4);

        // Primera página: debe contener exactamente estos 4 ejercicios en este orden
        assertEquals(
                exercises.stream().map(Exercise::getExerciseName).toList(),
                returned.getItems().stream().map(Exercise::getExerciseName).toList()
        );

        assertTrue(returned.getExistMoreItems());

        // Segunda página: al menos Burpees y Shoulder Press al inicio, puede haber más datos en BBDD
        Block<Exercise> returned2 = exerciseService.getValidatedExercises(1, 4);
        List<String> returned2Names = returned2.getItems().stream().map(Exercise::getExerciseName).toList();
        List<String> expectedSecondPagePrefix = List.of(exercise5.getExerciseName(), exercise6.getExerciseName());

        assertTrue(returned2Names.size() >= expectedSecondPagePrefix.size());
        assertEquals(expectedSecondPagePrefix, returned2Names.subList(0, expectedSecondPagePrefix.size()));
    }

    @Test
    public void addExerciseAsTrainerTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException{
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
    public void addExerciseAsAdminTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
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
    public void getExercicesValidatedExercises() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("trainer1", "12345");
        //Creamos un ejercio sin validar
        exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));

        Block<Exercise> returned = exerciseService.getValidatedExercises(0, 10);

        // Verificar que todos los devueltos están validados y que el no validado no aparece
        assertTrue(returned.getItems().stream().allMatch(Exercise::isValidated));
        assertTrue(returned.getItems().stream().noneMatch(e -> "ejercicio de prueba 1".equals(e.getExerciseName())));
    }
    @Test
    public void createSeriesTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
       Block<Serie> Series = exerciseService.createSeries(exercise1, Optional.empty(),1L);

        assertEquals(Series.getItems(),serieDao.findByExercise(exercise1).getContent());
    }


    @Test
    public void EditSerieTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
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
    public void  GetSerieTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
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
    public void getSeriesByExerciseAndRoutineTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
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
    public void createSerieTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Serie serie = exerciseService.createSerie(exercise1.getId(), 1L);

        assertEquals(serie,serieDao.findByExercise(exercise1).getContent().get(0));
    }

    @Test
    public void createSerieTestFailRoutine() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertThrows(InstanceNotFoundException.class,()->exerciseService.createSerie(exercise1.getId(), 100L));

    }

    @Test
    public void createSerieTestFailExercise() {


        assertThrows(InstanceNotFoundException.class,()->exerciseService.createSerie(10L, 1L));

    }

    @Test
    public void removeSerieTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException {

        Users creator = userService.login("trainer1", "12345");
        long idExercise= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Serie serie = exerciseService.createSerie(exercise1.getId(), 1L);
        assertEquals(true, exerciseService.removeSerie(serie.getId()));
    }

    @Test
    public void removeSerieTestFail() {
        assertThrows(InstanceNotFoundException.class, ()->exerciseService.removeSerie(100L));
    }

    @Test
    public void validateExerciseSuccessTest() 
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {

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
    public void validateExerciseAlreadyValidatedExceptionTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
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
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");


        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.validateExercise(trainer.getId(), idExercise));
    }

    @Test
    public void validateExercisePermissionException2Test() 
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
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
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {

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
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
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
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users trainer = userService.login("trainer1", "12345");

        long idExercise = exerciseService.addExercise(trainer.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,1));

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertFalse(exercise1.isValidated());

        assertThrows(PermissionException.class, () -> exerciseService.declineExercise(trainer.getId(), idExercise));
    }

    @Test
    public void declineExercisePermissionException2Test() 
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
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
    throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users admin = userService.login("admin1", "12345");

        Long nonExistentExerciseId = 99999L;

        assertThrows(InstanceNotFoundException.class, () -> exerciseService.declineExercise(admin.getId(), nonExistentExerciseId));
    }

    @Test
    public void addBlockedExerciseTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");
        Exercise ex1 = new Exercise("ejercicio bloqueado", "ejercicio bloqueado de prueba", grupoMuscular.PECHO,1);
        ex1.setDifficulty(Difficulty.FACIL);
        ex1.setEquipment(Equipment.POLEA_CABLE);
        Long idExercise = exerciseService.addExercise(creator.getId(), ex1);

        exerciseService.blockExercise(creator.getId(), idExercise);

        Exercise exercise1 = exerciseDao.getById(idExercise);

        assertEquals(exercise1.getExerciseName(), "ejercicio bloqueado");
        assertFalse(exercise1.isValidated());
    }

    @Test
    public void exerciseBlockedDefaultsToFalseTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException {
        Users creator = userService.login("admin1", "12345");
        Users creator2 = userService.login("trainer1", "12345");

        Exercise ex1 = new Exercise("ejercicio no bloqueado", "ejercicio de prueba", grupoMuscular.PECHO,1);
        ex1.setDifficulty(Difficulty.FACIL);
        ex1.setEquipment(Equipment.POLEA_CABLE);

        Exercise ex2 = new Exercise("ejercicio entrenador", "ejercicio de prueba", grupoMuscular.PECHO,1);
        ex2.setDifficulty(Difficulty.FACIL);
        ex2.setEquipment(Equipment.POLEA_CABLE);
        // No se establece blocked explícitamente
        Long idExercise = exerciseService.addExercise(creator.getId(), ex1);
        Long idExercise2 = exerciseService.addExercise(creator2.getId(), ex2);

        Exercise exercise1 = exerciseDao.getById(idExercise);
        Exercise exercise2 = exerciseDao.getById(idExercise2);

        assertEquals(exercise1.getExerciseName(), "ejercicio no bloqueado");
        assertTrue(exercise1.isValidated());

        assertFalse(exercise2.isValidated());
        assertNull(exercise2.getValidator());
    }

    @Test
    public void updateExerciseBlockedStatusTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException, InstanceNotFoundException, AlreadyValidatedException {
        Users creator = userService.login("admin1", "12345");
        Exercise ex1 = new Exercise("ejercicio para bloquear", "ejercicio de prueba", grupoMuscular.PECHO,1);
        ex1.setDifficulty(Difficulty.FACIL);
        ex1.setEquipment(Equipment.POLEA_CABLE);

        Long idExercise = exerciseService.addExercise(creator.getId(), ex1);

        Exercise exercise1 = exerciseDao.getById(idExercise);
        assertTrue(exercise1.isValidated());

        // Bloquear el ejercicio
        exerciseService.blockExercise(creator.getId(), idExercise);

        assertFalse(exercise1.isValidated());
        assertEquals(exercise1.getValidator(), creator);

        // Desbloquear el ejercicio
        exercise1 = exerciseService.validateExercise(creator.getId(), idExercise);
        assertTrue(exercise1.isValidated());
    }

    @Test
    public void addExerciseNonPremiumUserTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, PermissionException {
        Users usuario = createUser("testuser1", RoleType.TRAINER, Gender.FEMALE);
        usuario.setPremium(false);
        userService.signUp(usuario, RoleType.TRAINER);

        Users creator = userService.login("testuser1", PASSWORD);

        assertThrows(PermissionException.class, () -> {
            exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1", "ejercicio de prueba", grupoMuscular.PECHO,1));
        });
    }

}
