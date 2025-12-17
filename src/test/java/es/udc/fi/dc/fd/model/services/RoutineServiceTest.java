package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise.Difficulty;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineServiceTest {
    
    @Autowired
	private UserService userService;
    
    @Autowired
    private RoutineService routineService;

    @Autowired
    private ExerciseService exerciseService;
    
    @Autowired
    private RoutineDao routineDao;
    
    @Autowired
    private ExerciseDao exerciseDao;
    
    @Autowired
    private AvatarDao avatarDao;

    @Autowired
    private SerieDao serieDao;

    @Autowired
    private RoutineFollowDao routineFollowDao;

    private static final String PASSWORD = "12345";

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


    private Routine createRoutine(String name, Users creator) {
        return new Routine(name, new ArrayList<RoutineExercise>(), creator,(long) 90, LocalDateTime.now().withNano(0), true);
    }

    private Exercise createExercise(String name, String description, grupoMuscular grupo, int numeroSeries) {
        Exercise exercise = new Exercise(name, description, grupo, numeroSeries);
        exercise.setDifficulty(Difficulty.FACIL);
        exercise.setEquipment(Equipment.POLEA_CABLE);
        return exercise;
    }

	/**
	 * Test sign up and login from id.
	 *
	 * @throws DuplicateInstanceException the duplicate instance exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 */
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = createUser("user", Users.RoleType.USER, Users.Gender.OTHER);

		userService.signUp(user, Users.RoleType.USER);

		Users loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals(Users.RoleType.USER, user.getRole());

	}

    @Test
    public void testCreateEmptyRoutine() throws LoginUserBlockedException, DuplicateInstanceException, InstanceNotFoundException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine1", creator);
        routine = routineService.createRoutine(creator.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);
        Optional<Routine> retrievedRoutine = routineDao.findById(routine.getId());

        if(retrievedRoutine.isPresent()){
            assertEquals(routine.getName(), retrievedRoutine.get().getName());
            assertEquals(routine.getCreator(), retrievedRoutine.get().getCreator());
            assertEquals(routine.getDuration(), retrievedRoutine.get().getDuration());
            assertEquals(routine.getModificationDate(), retrievedRoutine.get().getModificationDate());
            assertEquals(new ArrayList<RoutineExercise>(), retrievedRoutine.get().getRoutineExercises());
        }    
    }

    @Test
    public void testCreateRoutineWithExercises() throws LoginUserBlockedException, DuplicateInstanceException, InstanceNotFoundException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine1", creator);

        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO, 1));

        // Creamos la rutina con ejercicios
        routine = routineService.createRoutine(
                creator.getId(),
                routine.getName(),
                new ArrayList<Long>() {{
                    add(exercise1.getId());
                    add(exercise2.getId());
                }},
                90L,
                true
        );

        // Recuperamos la rutina desde la BD
        Optional<Routine> retrievedRoutine = routineDao.findById(routine.getId());

        assertTrue(retrievedRoutine.isPresent(), "La rutina debería existir en la base de datos");

        Routine foundRoutine = retrievedRoutine.get();

        // Verificaciones básicas
        assertEquals(routine.getName(), foundRoutine.getName());
        assertEquals(routine.getCreator(), foundRoutine.getCreator());
        assertEquals(routine.getDuration(), foundRoutine.getDuration());
        assertEquals(routine.getModificationDate(), foundRoutine.getModificationDate());

        // ✅ Verificar los ejercicios asociados
        List<RoutineExercise> routineExercises = foundRoutine.getRoutineExercises();
        assertEquals(2, routineExercises.size(), "La rutina debería tener 2 ejercicios asociados");

        List<Long> exerciseIds = routineExercises.stream()
                .map(re -> re.getExercise().getId())
                .toList();

        assertTrue(exerciseIds.contains(exercise1.getId()), "La rutina debe contener el ejercicio1");
        assertTrue(exerciseIds.contains(exercise2.getId()), "La rutina debe contener el ejercicio2");
    }


    @Test(expected = InvalidRoutineNameException.class)
    public void createInvalidNameRoutine() throws LoginUserBlockedException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
    }


    @Test(expected = InvalidRoutineDurationException.class)
    public void createInvalidDurationRoutine1() throws LoginUserBlockedException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("X", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));

        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, null, true);
    }

    @Test(expected = InvalidRoutineDurationException.class)
    public void createInvalidDurationRoutine2() throws LoginUserBlockedException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("X", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 0L, true);
    }

    @Test
    public void testViewAllRoutines() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");

        // Foto del estado previo (puede haber rutinas sembradas en BD)
        List<Routine> before = routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 100)).getContent();

        Routine routine1 = createRoutine("routine1", creator);
        Routine routine2 = createRoutine("routine2", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO,1));
        Exercise exercise3 = exerciseDao.save(new Exercise("exercise3", "description3", grupoMuscular.PECHO,1));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise2.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise3.getId());}}, (long) 90, true);

        List<Routine> after = routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 100)).getContent();

        List<Routine> expected = new ArrayList<>(before);
        expected.add(routine1);
        expected.add(routine2);

        assertEquals(expected, after);
    }

    @Test
    public void testViewAllRoutinesInOrder() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");

        // Rutinas existentes antes (semillas u otras)
        List<Routine> before = routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 100)).getContent();

        Routine routine1 = createRoutine("routine1", creator);
        Routine routine2 = createRoutine("routine2", creator);
        Routine routine3 = createRoutine("routine3", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));

        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(),
            new ArrayList<Long>(){{add(exercise1.getId());}}, 90L, true);
        routine2 = routineService.createRoutine(creator.getId(), routine2.getName(),
            new ArrayList<Long>(){{add(exercise1.getId());}}, 90L, true);
        routine3 = routineService.createRoutine(creator.getId(), routine3.getName(),
            new ArrayList<Long>(){{add(exercise1.getId());}}, 90L, true);

        List<Routine> after = routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 100)).getContent();

        // Tamaño esperado
        assertEquals(before.size() + 3, after.size());

        // El prefijo debe ser exactamente lo que había antes
        assertEquals(before, after.subList(0, before.size()));

        // Las nuevas deben conservar orden de inserción al final
        assertEquals(
            Arrays.asList(routine1, routine2, routine3),
            after.subList(after.size() - 3, after.size())
        );
    }
    

    @Test
    public void testGetRoutineById() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(routine1, routineService.getRoutineById(routine1.getId(), creator.getId()));

    }

 

    
    @Test(expected = InstanceNotFoundException.class)
    public void testGetRoutineByIdNonExistent() throws LoginUserBlockedException, InstanceNotFoundException, PermissionException, IncorrectLoginException {
        Users user = userService.login("admin1", "12345");
        Long id = 999999L;
        routineService.getRoutineById(id, user.getId());
    } 


    @Test
    public void testModifyRoutineSuccess() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine1", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO,1));
        routine = routineService.createRoutine(creator.getId(), routine.getName(),
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 60, true);

        Exercise exercise3 = exerciseDao.save(new Exercise("exercise3", "description3", grupoMuscular.ESPALDA,1));

        Routine modified = routineService.modifyRoutine(
            routine.getId(),
            creator.getId(),
            "routine-updated",
            new ArrayList<Long>(){{add(exercise2.getId()); add(exercise3.getId());}},
            (long) 75,
            true
        );

        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        if (retrieved.isPresent()) {
            assertEquals("routine-updated", retrieved.get().getName());
            assertEquals((Long)75L, retrieved.get().getDuration());
            assertEquals(2, retrieved.get().getRoutineExercises().size());
            assertEquals(true, retrieved.get().getRoutineExercises().contains(modified.getRoutineExercises().get(0)));
            assertEquals(true, retrieved.get().getRoutineExercises().contains(modified.getRoutineExercises().get(1)));
            assertEquals(modified.getModificationDate(), retrieved.get().getModificationDate());
        }
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testModifyRoutineNotFound() throws Exception {
        Users creator = userService.login("admin1", "12345");
        routineService.modifyRoutine(999999L, creator.getId(), "any", new ArrayList<>(), 30L, true);
    }

    @Test(expected = PermissionException.class)
    public void testModifyRoutinePermissionDenied() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users otherUser = userService.login("trainer1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "r1", new ArrayList<>(), 45L, true);
        routineService.modifyRoutine(routine.getId(), otherUser.getId(), "new-name", new ArrayList<>(), 50L, true);
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testModifyRoutineWithInvalidExercise() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "r1", new ArrayList<>(), 45L, true);
        routineService.modifyRoutine(routine.getId(), creator.getId(), "r1", new ArrayList<>(){{add(999999L);}}, 45L, true);
    }


    @Test
    public void deleteSeriesByRoutineTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineExerciseLimitReachedException, RoutineLimitReachedException {

        Users creator = userService.login("trainer1", "12345");
        
        long exerciseId= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,4));
        Exercise exercise1 = exerciseDao.getReferenceById(exerciseId);
        Routine rutina = routineService.createRoutine(creator.getId(), "r1", new ArrayList<>(), 45L, true);

        List<Long> exerciseIds = new ArrayList<>();
        exerciseIds.add(exerciseId);

        routineService.modifyRoutine(rutina.getId(), creator.getId(), rutina.getName(), exerciseIds, rutina.getDuration(), true);
        
        exerciseService.createSerie(exercise1.getId(), rutina.getId());
        exerciseService.createSerie(exercise1.getId(), rutina.getId());

        assertEquals(true, routineService.deleteSeriesByRoutine(rutina.getId()));
        assertEquals(0, exerciseService.getSeriesByExerciseAndRoutine(exerciseId,rutina.getId()).getItems().size());
    }

    @Test
    public void deleteSeriesByRoutineWithNoSeriesTest() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, PermissionException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {

        Users creator = userService.login("trainer1", "12345");
        
        long exerciseId= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
                "ejercicio de prueba", grupoMuscular.PECHO,4));
        Routine rutina = routineService.createRoutine(creator.getId(), "r1", new ArrayList<>(), 45L, true);

        List<Long> exerciseIds = new ArrayList<>();
        exerciseIds.add(exerciseId);

        routineService.modifyRoutine(rutina.getId(), creator.getId(), rutina.getName(), exerciseIds, rutina.getDuration(), true);
        
        assertEquals(0, exerciseService.getSeriesByExerciseAndRoutine(exerciseId,rutina.getId()).getItems().size());
        assertEquals(true, routineService.deleteSeriesByRoutine(rutina.getId()));
        assertEquals(0, exerciseService.getSeriesByExerciseAndRoutine(exerciseId,rutina.getId()).getItems().size());
    }


    @Test
    public void testDeleteRoutineSuccess() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "to-delete", new ArrayList<Long>(), 30L, true);
        routineService.deleteRoutine(creator.getId(), routine.getId());
        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        assertEquals(false, retrieved.isPresent());
    }

    @Test
    public void testDeleteRoutineWithSeriesSuccess() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "to-delete", new ArrayList<Long>(), 30L, true);
        
        long exerciseId= exerciseService.addExercise(creator.getId(), createExercise("ejercicio de prueba 1",
        "ejercicio de prueba", grupoMuscular.PECHO,4));

        List<Long> exerciseIds = new ArrayList<>();
        exerciseIds.add(exerciseId);

        routineService.modifyRoutine(routine.getId(), creator.getId(), routine.getName(), exerciseIds, routine.getDuration(), true);
        
        exerciseService.createSerie(exerciseId, routine.getId());
        exerciseService.createSerie(exerciseId, routine.getId());

        routineService.deleteRoutine(creator.getId(), routine.getId());
        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        assertEquals(false, retrieved.isPresent());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testDeleteRoutineNotFound() throws Exception {
        Users creator = userService.login("admin1", "12345");
        routineService.deleteRoutine(creator.getId(), 999999L);
    }

    @Test(expected = PermissionException.class)
    public void testDeleteRoutinePermissionDenied() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users otherUser = userService.login("user1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "to-delete-2", new ArrayList<Long>(), 35L, true);
        routineService.deleteRoutine(otherUser.getId(), routine.getId());
    }

    @Test(expected = RoutineLimitReachedException.class)
    public void testCreateRoutineLimitReached() throws Exception {
        Users creator = createUser("paco", RoleType.TRAINER, Gender.MALE);
        creator.setPremium(false);
        userService.signUp(creator, RoleType.TRAINER);

        routineService.createRoutine(creator.getId(), "r1", new ArrayList<Long>(), 45L, true);
        routineService.createRoutine(creator.getId(), "r2", new ArrayList<Long>(), 45L, true);
        routineService.createRoutine(creator.getId(), "r3", new ArrayList<Long>(), 45L, true);
        // This one should fail
        routineService.createRoutine(creator.getId(), "r4", new ArrayList<Long>(), 45L, true);
    }

    @Test(expected = RoutineExerciseLimitReachedException.class)
    public void testModifyRoutineExerciseLimitReached() throws Exception {
        Users creator = createUser("paco", RoleType.TRAINER, Gender.MALE);
        creator.setPremium(false);
        userService.signUp(creator, RoleType.TRAINER);
        
        Routine routine = routineService.createRoutine(creator.getId(), "r1", new ArrayList<Long>(), 45L, true);
        routineService.modifyRoutine(routine.getId(), creator.getId(), "r1", new ArrayList<Long>(){
            {add(1L);add(2L);add(3L);add(4L);add(5L);add(6L);}}, 45L, true);
    }

    @Test
    public void testAdminCanModifyAnyRoutine() throws Exception {
        Users creator = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");
        
        Routine routine = routineService.createRoutine(creator.getId(), "trainer-routine", new ArrayList<Long>(), 45L, true);
        
        // El Admin deberia poder modificar cualquier rutina
        routineService.modifyRoutine(
            routine.getId(),
            admin.getId(),
            "admin-modified",
            new ArrayList<>(),
            60L,
            true
        );
        
        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        if (retrieved.isPresent()) {
            assertEquals("admin-modified", retrieved.get().getName());
            assertEquals((Long)60L, retrieved.get().getDuration());
        }
    }

    @Test
    public void testAdminCanDeleteAnyRoutine() throws Exception {
        Users creator = userService.login("trainer1", "12345");
        Users admin = userService.login("admin1", "12345");
        
        Routine routine = routineService.createRoutine(creator.getId(), "trainer-routine-delete", new ArrayList<Long>(), 40L, true);
        
        // El Admin deberia poder eliminar cualquier rutina
        routineService.deleteRoutine(admin.getId(), routine.getId());
        
        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        assertEquals(false, retrieved.isPresent());
    }

    @Test
    public void testModifyRoutineWithEmptyExerciseList() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO,1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "with-exercises", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 30L, true);
        
         routineService.modifyRoutine(
            routine.getId(),
            creator.getId(),
            "no-exercises",
            new ArrayList<Long>(),
            45L,
            true
        );
        
        Optional<Routine> retrieved = routineDao.findById(routine.getId());
        if (retrieved.isPresent()) {
            assertEquals("no-exercises", retrieved.get().getName());
            assertEquals(0, retrieved.get().getRoutineExercises().size());
            assertEquals((Long)45L, retrieved.get().getDuration());
        }
    }


    @Test
    public void testFindRoutinesByCreator() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator1 = userService.login("trainer1", "12345");
        Users creator2 = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator1);
        Routine routine2 = createRoutine("routine2", creator1);
        Routine routine3 = createRoutine("routine3", creator2);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));

        PageRequest page = PageRequest.of(0, 100);

        // Fotos del estado previo
        List<Routine> beforeC1Own = routineService.findByFilters(creator1.getId(), creator1.getId(), null, page).getContent();
        List<Routine> beforeC2Own = routineService.findByFilters(creator2.getId(), creator2.getId(), null, page).getContent();
        List<Routine> beforeC1OfC2 = routineService.findByFilters(creator1.getId(), creator2.getId(), null, page).getContent();

        // Crear nuevas rutinas
        routine1 = routineService.createRoutine(creator1.getId(), routine1.getName(),
            new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);
        routine2 = routineService.createRoutine(creator1.getId(), routine2.getName(),
            new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);
        routine3 = routineService.createRoutine(creator2.getId(), routine3.getName(),
            new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);

        // Ver propias de creator1
        List<Routine> afterC1Own = routineService.findByFilters(creator1.getId(), creator1.getId(), null, page).getContent();
        List<Routine> expectedC1Own = new ArrayList<>(beforeC1Own);
        expectedC1Own.add(routine1);
        expectedC1Own.add(routine2);
        assertEquals(expectedC1Own, afterC1Own);

        // Ver propias de creator2 (admin)
        List<Routine> afterC2Own = routineService.findByFilters(creator2.getId(), creator2.getId(), null, page).getContent();
        List<Routine> expectedC2Own = new ArrayList<>(beforeC2Own);
        expectedC2Own.add(routine3);
        assertEquals(expectedC2Own, afterC2Own);

        // Ver rutinas de creator2 vistas por creator1 (públicas del admin)
        List<Routine> afterC1OfC2 = routineService.findByFilters(creator1.getId(), creator2.getId(), null, page).getContent();
        List<Routine> expectedC1OfC2 = new ArrayList<>(beforeC1OfC2);
        expectedC1OfC2.add(routine3);
        assertEquals(expectedC1OfC2, afterC1OfC2);
    }


    @Test
    public void testFindRoutinesByName() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator1 = userService.login("trainer1", "12345");
        Routine routine1 = createRoutine("routine1", creator1);
        Routine routine2 = createRoutine("routine2", creator1);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        
        routine1 = routineService.createRoutine(creator1.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator1.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(Arrays.asList(routine1), routineService.findByFilters(creator1.getId(), null, "routine1",PageRequest.of(0, 10)).getContent());
        assertEquals(Arrays.asList(routine2), routineService.findByFilters(creator1.getId(), null, "2",PageRequest.of(0, 10)).getContent());
    }

    @Test
    public void testFindRoutinesByNameAndCreator() throws LoginUserBlockedException, IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException{
        Users creator1 = userService.login("trainer1", "12345");
        Users creator2 = userService.login("admin1", "12345");

        // Nombres que pueden coincidir con filtros
        Routine routine1 = createRoutine("Pecho", creator1);              // No debe aparecer al filtrar por creator2
        Routine routine2 = createRoutine("Pecho y Triceps", creator2);    // Coincide con "Pecho" y con "P"
        Routine routine3 = createRoutine("Pierna", creator2);             // Coincide con "P" solo

        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));

        PageRequest page = PageRequest.of(0, 200);

        // Fotos previas (semillas existentes que también podrían hacer match)
        List<Routine> beforeExact = routineService.findByFilters(creator2.getId(), creator2.getId(), "Pecho", page).getContent();
        List<Routine> beforePartial = routineService.findByFilters(creator2.getId(), creator2.getId(), "P", page).getContent();

        // Crear rutinas
        routineService.createRoutine(creator1.getId(), routine1.getName(),
                new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);
        routine2 = routineService.createRoutine(creator2.getId(), routine2.getName(),
                new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);
        routine3 = routineService.createRoutine(creator2.getId(), routine3.getName(),
                new ArrayList<Long>(){{ add(exercise1.getId()); }}, 90L, true);

        // Después
        List<Routine> afterExact = routineService.findByFilters(creator2.getId(), creator2.getId(), "Pecho", page).getContent();
        List<Routine> afterPartial = routineService.findByFilters(creator2.getId(), creator2.getId(), "P", page).getContent();

        // Esperados: listas previas + nuevas que cumplen el filtro (orden de inserción)
        List<Routine> expectedExact = new ArrayList<>(beforeExact);
        expectedExact.add(routine2); // "Pecho y Triceps" contiene "Pecho"

        List<Routine> expectedPartial = new ArrayList<>(beforePartial);
        expectedPartial.add(routine2); // coincide con "P"
        expectedPartial.add(routine3); // coincide con "P"

        assertEquals(expectedExact, afterExact);
        assertEquals(expectedPartial, afterPartial);
    }

    @Test
    public void testCreateTrainingFromRoutineSuccess() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        Training createdTraining = routineService.createTrainingFromRoutine(
            creator.getId(),
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );

        assertEquals("Training 1", createdTraining.getName());
        assertEquals("Description of training", createdTraining.getDescription());
        assertEquals(45L, createdTraining.getDuration());
        assertTrue(createdTraining.getIsPublic());

        serieDao.findByTrainingId(createdTraining.getId()).forEach(serie -> {
            assertEquals(createdTraining, serie.getTraining());
            assertEquals(exercise1, serie.getExercise());
        });

    }

    @Test(expected = InstanceNotFoundException.class)
    public void testCreateTrainingFromRoutineWithInvalidUser() throws Exception {
        routineService.createTrainingFromRoutine(
            999999L,
            "Training",
            "Description",
            30L,
            true,
            new ArrayList<Serie>(),
            1L
        );
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testCreateTrainingFromRoutineWithInvalidExercise() throws Exception {
        Users creator = userService.login("admin1", "12345");
        
        Serie serie = new Serie();
        Exercise invalidExercise = new Exercise();
        invalidExercise.setId(999999L);
        serie.setExercise(invalidExercise);
        serie.setRepeticiones(10);
        serie.setPeso(50);
        serie.setNumeroSerie(0);
        
        routineService.createTrainingFromRoutine(
            creator.getId(),
            "Training",
            "Description",
            30L,
            true,
            new ArrayList<Serie>(){{add(serie);}},
            1L
        );
    }

    @Test
    public void testFollowAndUnfollowRoutine() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException, LoginUserBlockedException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        // Crear usuario y rutina con nombres únicos
        Users user = createUser("user_" + System.currentTimeMillis(), Users.RoleType.USER, Users.Gender.OTHER);
        userService.signUp(user, Users.RoleType.USER);

        Users trainer = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine_" + System.currentTimeMillis(), trainer);
        routine = routineService.createRoutine(trainer.getId(), routine.getName(), new ArrayList<>(), routine.getDuration(), true);

        // Inicialmente no sigue la rutina
        assertEquals(false, routineFollowDao.existsByUserIdAndRoutineId(user.getId(), routine.getId()));

        // Seguir rutina
        boolean followed = routineService.followRoutine(user.getId(), routine.getId());
        assertEquals(true, followed);
        assertEquals(true, routineFollowDao.existsByUserIdAndRoutineId(user.getId(), routine.getId()));

        // Intentar seguir de nuevo -> debería devolver false
        boolean followedAgain = routineService.followRoutine(user.getId(), routine.getId());
        assertEquals(false, followedAgain);

        // Dejar de seguir rutina
        boolean unfollowed = routineService.unfollowRoutine(user.getId(), routine.getId());
        assertEquals(true, unfollowed);
        assertEquals(false, routineFollowDao.existsByUserIdAndRoutineId(user.getId(), routine.getId()));

        // Intentar dejar de seguir de nuevo -> debería devolver false
        boolean unfollowedAgain = routineService.unfollowRoutine(user.getId(), routine.getId());
        assertEquals(false, unfollowedAgain);
    }

    @Test
    public void testLikeRoutine() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
                        
        assertTrue(routineService.likeRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testLikeRoutineTwice() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e", "desc", grupoMuscular.PECHO, 1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);

        assertTrue(routineService.likeRoutine(user.getId(), routine.getId()));
        assertFalse(routineService.likeRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testLikePrivateRoutine() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e", "desc", grupoMuscular.PECHO, 1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,false);

        assertThrows(PermissionException.class,
            () -> routineService.likeRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testLikeRoutineUserNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.likeRoutine(999L, 1L));
    }

    @Test
    public void testLikeRoutineNotFound() throws LoginUserBlockedException, IncorrectLoginException {
        Users user = userService.login("user1", "12345");
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.likeRoutine(user.getId(), 99999L));
    }

    @Test
    public void testUnlikeRoutine() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);

        routineService.likeRoutine(user.getId(), routine.getId());

        assertTrue(routineService.unlikeRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testUnlikeRoutineWithoutLike() throws Exception {
        Users user = userService.login("user1", "12345");
        assertFalse(routineService.unlikeRoutine(user.getId(), 12345L));
    }

    @Test
    public void testUnlikeRoutineUserNotFound() throws Exception {
        assertFalse(routineService.unlikeRoutine(999L, 50L));
    }

    @Test
    public void testIsLikedRoutine() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users user = userService.login("user1","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);

        routineService.likeRoutine(user.getId(), routine.getId());

        assertTrue(routineService.isLikedRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testIsLikedRoutineNoLike() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users user = userService.login("user1","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);

        assertFalse(routineService.isLikedRoutine(user.getId(), routine.getId()));
    }

    @Test
    public void testIsLikedRoutineUserNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.isLikedRoutine(999L, 10L));
    }

    @Test
    public void testIsLikedRoutineNotFound() throws Exception {
        Users user = userService.login("user1","12345");
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.isLikedRoutine(user.getId(), 99999L));
    }

    @Test
    public void testGetRoutineLikesCount() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users u1 = userService.login("user1","12345");
        Users u2 = userService.login("user2","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);

        routineService.likeRoutine(u1.getId(), routine.getId());
        routineService.likeRoutine(u2.getId(), routine.getId());

        assertEquals(2, routineService.getLikesCount(routine.getId()));
    }

    @Test
    public void testGetRoutineLikesCountRoutineNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.getLikesCount(99999L));
    }

    @Test
    public void testLikeTraining() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        Training createdTraining = routineService.createTrainingFromRoutine( creator.getId(), "Training 1", "Description of training", 45L, true, series, routine.getId());
        
        assertTrue(routineService.likeTraining(user.getId(), createdTraining.getId()));
    }

    @Test
    public void testLikeTrainingTwice() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e", "desc", grupoMuscular.PECHO, 1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,true,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        assertTrue(routineService.likeTraining(user.getId(), t.getId()));
        assertFalse(routineService.likeTraining(user.getId(), t.getId()));
    }

    @Test
    public void testLikePrivateTraining() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e", "desc", grupoMuscular.PECHO, 1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,false,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        assertThrows(PermissionException.class,
            () -> routineService.likeTraining(user.getId(), t.getId()));
    }

    @Test
    public void testLikeTrainingUserNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.likeTraining(999L, 1L));
    }

    @Test
    public void testLikeTrainingNotFound() throws LoginUserBlockedException, IncorrectLoginException {
        Users user = userService.login("user1", "12345");
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.likeTraining(user.getId(), 99999L));
    }

    @Test
    public void testUnlikeTraining() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,true,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        routineService.likeTraining(user.getId(), t.getId());

        assertTrue(routineService.unlikeTraining(user.getId(), t.getId()));
    }

    @Test
    public void testUnlikeTrainingWithoutLike() throws Exception {
        Users user = userService.login("user1", "12345");
        assertFalse(routineService.unlikeTraining(user.getId(), 12345L));
    }

    @Test
    public void testUnlikeTrainingUserNotFound() throws Exception {
        assertFalse(routineService.unlikeTraining(999L, 50L));
    }

    @Test
    public void testIsLikedTraining() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users user = userService.login("user1","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,true,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        routineService.likeTraining(user.getId(), t.getId());

        assertTrue(routineService.isLikedTraining(user.getId(), t.getId()));
    }

    @Test
    public void testIsLikedTrainingNoLike() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users user = userService.login("user1","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,true,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        assertFalse(routineService.isLikedTraining(user.getId(), t.getId()));
    }

    @Test
    public void testIsLikedTrainingUserNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.isLikedTraining(999L, 10L));
    }

    @Test
    public void testIsLikedTrainingNotFound() throws Exception {
        Users user = userService.login("user1","12345");
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.isLikedTraining(user.getId(), 99999L));
    }

    @Test
    public void testGetTrainingLikesCount() throws Exception {
        Users creator = userService.login("admin1","12345");
        Users u1 = userService.login("user1","12345");
        Users u2 = userService.login("user2","12345");

        Exercise e = exerciseDao.save(new Exercise("e","d",grupoMuscular.PECHO,1));
        Routine routine = routineService.createRoutine(creator.getId(),"r1",List.of(e.getId()),60L,true);
        Training t = routineService.createTrainingFromRoutine(
            creator.getId(),"t1","d",45L,true,
            routineService.getDefaultRoutineSeries(routine.getId(),e.getId()),
            routine.getId()
        );

        routineService.likeTraining(u1.getId(), t.getId());
        routineService.likeTraining(u2.getId(), t.getId());

        assertEquals(2, routineService.getTrainingLikesCount(t.getId()));
    }

    @Test
    public void testGetTrainingLikesCountTrainingNotFound() {
        assertThrows(InstanceNotFoundException.class,
            () -> routineService.getTrainingLikesCount(99999L));
    }

    @Test
    public void testGetFollowersByRoutine() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException, LoginUserBlockedException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        // Crear entrenador y rutina con nombres únicos
        Users trainer = userService.login("trainer1", "12345");
        Routine routine = createRoutine("routine_" + System.currentTimeMillis(), trainer);
        routine = routineService.createRoutine(trainer.getId(), routine.getName(), new ArrayList<>(), routine.getDuration(), true);

        Users user1 = createUser("user1_" + System.currentTimeMillis(), Users.RoleType.USER, Users.Gender.OTHER);
        Users user2 = createUser("user2_" + System.currentTimeMillis(), Users.RoleType.USER, Users.Gender.OTHER);
        userService.signUp(user1, Users.RoleType.USER);
        userService.signUp(user2, Users.RoleType.USER);

        routineService.followRoutine(user1.getId(), routine.getId());
        routineService.followRoutine(user2.getId(), routine.getId());

        // Obtener seguidores
        PageRequest pageable = PageRequest.of(0, 10);
        Block<Users> followersBlock = routineService.getFollowersByRoutine(routine.getId(), trainer.getId(), pageable);

        assertEquals(2, followersBlock.getItems().size());
        assertEquals(false, followersBlock.getExistMoreItems());

        // Verificar que los seguidores correctos están presentes
        assertEquals(true, followersBlock.getItems().stream().anyMatch(u -> u.getId().equals(user1.getId())));
        assertEquals(true, followersBlock.getItems().stream().anyMatch(u -> u.getId().equals(user2.getId())));
    }

    @Test
    public void testFindTrainingsEmptyForNewUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        Users newUser = createUser("noTrainingsUser_" + System.currentTimeMillis(), Users.RoleType.USER, Users.Gender.OTHER);
        userService.signUp(newUser, Users.RoleType.USER);

        List<Training> trainings = routineService.findTrainings(newUser.getId(), newUser.getId(), PageRequest.of(0, 10)).getContent();
        assertEquals(0, trainings.size());
    }

    @Test
    public void findOwnCreatedTrainingSuccess() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        Training createdTraining = routineService.createTrainingFromRoutine(
            creator.getId(),
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );

        List<Training> trainings = routineService.findTrainings(creator.getId(), creator.getId(),PageRequest.of(0, 10)).getContent();
        assertTrue(trainings.stream().anyMatch(t -> t.getId().equals(createdTraining.getId())));
    }

    @Test
    public void userFindOwnCreatedTrainingSuccess() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        Training createdTraining = routineService.createTrainingFromRoutine(
            user.getId(),
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );

        List<Training> trainings = routineService.findTrainings(user.getId(), user.getId(),PageRequest.of(0, 10)).getContent();
        assertTrue(trainings.stream().anyMatch(t -> t.getId().equals(createdTraining.getId())));
    }

    @Test
    public void userFindOtherCreatedTrainingSuccess2() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("user2", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        userService.followUser(user.getId(),creator.getId());
        Routine routine = routineService.createRoutine(creator.getId(), "routine1",
                new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);

        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());

        routineService.createTrainingFromRoutine(
                creator.getId(),
                "Training 1",
                "Description of training",
                45L,
                true,
                series,
                routine.getId()
        );

        List<Training> trainings = routineService.findTrainings(creator.getId(), user.getId(),PageRequest.of(0, 10)).getContent();
        assertEquals(10, trainings.size());
    }

    @Test
    public void userFindOtherCreatedTrainingFailed3() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("user2", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        userService.followUser(user.getId(),creator.getId());
        Routine routine = routineService.createRoutine(creator.getId(), "routine1",
                new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);

        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());

        routineService.createTrainingFromRoutine(
                creator.getId(),
                "Training 1",
                "Description of training",
                45L,
                false,
                series,
                routine.getId()
        );

        List<Training> trainings = routineService.findTrainings(creator.getId(), user.getId(),PageRequest.of(0, 10)).getContent();
        assertEquals(9, trainings.size());
    }

    @Test
    public void userFindOtherCreatedTrainingFailed1() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("user2", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));

        Routine routine = routineService.createRoutine(creator.getId(), "routine1",
                new ArrayList<>(){{add(exercise1.getId());}}, 60L, true);

        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());

        routineService.createTrainingFromRoutine(
                creator.getId(),
                "Training 1",
                "Description of training",
                45L,
                true,
                series,
                routine.getId()
        );

        List<Training> trainings = routineService.findTrainings(creator.getId(), user.getId(),PageRequest.of(0, 10)).getContent();
        assertEquals(10, trainings.size());
    }

    @Test
    public void userFindOtherCreatedTrainingFailed2() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("user2", "12345");
        Users user = new Users();
        user.setId(1000L);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));

        Routine routine = routineService.createRoutine(creator.getId(), "routine1",
                new ArrayList<>(){{add(exercise1.getId());}}, 60L, true);

        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());

         routineService.createTrainingFromRoutine(
                creator.getId(),
                "Training 1",
                "Description of training",
                45L,
                true,
                series,
                routine.getId()
        );
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findTrainings(creator.getId(), user.getId(),PageRequest.of(0, 10)).getContent());
    }

    @Test
    public void userFindTrainingSuccess() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));

        Routine routine = routineService.createRoutine(creator.getId(), "routine1",
                new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);

        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());

        Training createdTraining = routineService.createTrainingFromRoutine(
                user.getId(),
                "Training 1",
                "Description of training",
                45L,
                true,
                series,
                routine.getId()
        );

        assertEquals(createdTraining,routineService.findTrainingById(createdTraining.getId()));
    }

    @Test
    public void userFindTrainingFail()  {
        Training training= new Training();
        training.setId(1000L);

        assertThrows(InstanceNotFoundException.class, () ->routineService.findTrainingById(training.getId()));
    }

    @Test
    public void userFindDayOwnCreatedTrainingSuccess() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        Training createdTraining = routineService.createTrainingFromRoutine(
            user.getId(),
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );

        // Usar la fecha actual para la búsqueda por día
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth();
        int month = today.getMonthValue();
        int year = today.getYear();

        List<Training> trainings = routineService.findTrainingsByDay(
            user.getId(),
            day,
            month,
            year,
            PageRequest.of(0, 10)
        ).getContent();

        assertTrue(trainings.stream().anyMatch(t -> t.getId().equals(createdTraining.getId())));
    }


    @Test
    public void userFindDayOwnCreatedTrainingNotFound() throws LoginUserBlockedException, IncorrectLoginException, InstanceNotFoundException, PermissionException, DuplicateInstanceException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users creator = userService.login("admin1", "12345");
        Users user = userService.login("user1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        routineService.createTrainingFromRoutine(
            user.getId(),
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );

        // Fecha futura para que no encuentre el entrenamiento
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth();
        int month = today.getMonthValue();
        int year = today.getYear() + 1; 

        List<Training> trainings = routineService.findTrainingsByDay(
            user.getId(),
            day,
            month,
            year,
            PageRequest.of(0, 10)
        ).getContent();

        assertEquals(0, trainings.size());
    }

    @Test
    public void testGetRoutineByTraining() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "desc", grupoMuscular.PECHO, 1));
        Routine routine = routineService.createRoutine(creator.getId(), "routine1", new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        Training training = routineService.createTrainingFromRoutine(creator.getId(), "Training", "Desc", 60L, true, series, routine.getId());
        Routine foundRoutine = routineService.getRoutineByTraining(training.getId());
        assertEquals(routine.getId(), foundRoutine.getId());
    }

    @Test
    public void testFindFollowedUsersTrainingsFeedSuccess() throws Exception {

        Users follower = createUser("followerUser" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
        Users creator = createUser("creatorUser" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);

        userService.signUp(follower, Users.RoleType.USER);
        userService.signUp(creator, Users.RoleType.USER);

        Exercise exercise1 = exerciseDao.save(
            new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1)
        );

        Routine routine = routineService.createRoutine(
            creator.getId(),
            "routineFeed",
            new ArrayList<Long>() {{ add(exercise1.getId()); }},
            60L,
            true
        );

        List<Serie> series = routineService.getDefaultRoutineSeries(
            routine.getId(),
            exercise1.getId()
        );

        Training training = routineService.createTrainingFromRoutine(
            creator.getId(),
            "Training feed",
            "Desc feed",
            45L,
            true,
            series,
            routine.getId()
        );

        userService.followUser(follower.getId(), creator.getId());

        List<Training> result = routineService.findFollowedUsersTrainingsFeed(follower.getId());

        assertEquals(1, result.size());
        assertEquals(training.getId(), result.get(0).getId());
    }

    @Test
    @Transactional
    public void testFindFollowedUsersTrainingsFeedEmpty() throws Exception {

        Users user = createUser("feedUser" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
        userService.signUp(user, Users.RoleType.USER);

        // No sigue a nadie -> feed vacío
        List<Training> result = routineService.findFollowedUsersTrainingsFeed(user.getId());

        assertTrue(result.isEmpty());
    }

}
