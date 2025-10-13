package es.udc.fi.dc.fd.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

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
    private RoutineDao routineDao;
    
    @Autowired
    private ExerciseDao exerciseDao;
    
    @Autowired
    private AvatarDao avatarDao;

    private Users createUser(String userName) {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        return new Users(userName, "12345", "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
    }

    private Routine createRoutine(String name, Users creator) {
        return new Routine(name, new ArrayList<Exercise>(), creator,(long) 90, LocalDateTime.now().withNano(0), true);
    }

	/**
	 * Test sign up and login from id.
	 *
	 * @throws DuplicateInstanceException the duplicate instance exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 */
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = createUser("user");

		userService.signUp(user, Users.RoleType.USER);

		Users loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals(Users.RoleType.USER, user.getRole());

	}

    @Test
    public void testCreateEmptyRoutine() throws DuplicateInstanceException, InstanceNotFoundException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine1", creator);
        routine = routineService.createRoutine(creator.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);
        Optional<Routine> retrievedRoutine = routineDao.findById(routine.getId());

        if(retrievedRoutine.isPresent()){
            assertEquals(routine.getName(), retrievedRoutine.get().getName());
            assertEquals(routine.getCreator(), retrievedRoutine.get().getCreator());
            assertEquals(routine.getDuration(), retrievedRoutine.get().getDuration());
            assertEquals(routine.getModificationDate(), retrievedRoutine.get().getModificationDate());
            assertEquals(new ArrayList<Exercise>(), retrievedRoutine.get().getExercises());
        }    
    }

    @Test
    public void testCreateRoutineWithExercises() throws DuplicateInstanceException, InstanceNotFoundException, IncorrectLoginException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("routine1", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO,1));
        routine = routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise2.getId());}}, (long) 90, true);
        Optional<Routine> retrievedRoutine = routineDao.findById(routine.getId());

        if(retrievedRoutine.isPresent()){
            assertEquals(routine.getName(), retrievedRoutine.get().getName());
            assertEquals(routine.getCreator(), retrievedRoutine.get().getCreator());
            assertEquals(routine.getDuration(), retrievedRoutine.get().getDuration());
            assertEquals(routine.getModificationDate(), retrievedRoutine.get().getModificationDate());
            assertEquals(2, retrievedRoutine.get().getExercises().size());
            assertEquals(true, retrievedRoutine.get().getExercises().contains(routine.getExercises().get(0)));
            assertEquals(true, retrievedRoutine.get().getExercises().contains(routine.getExercises().get(1)));
        }    
    }

    @Test(expected = InvalidRoutineNameException.class)
    public void createInvalidNameRoutine() throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
    }


    @Test(expected = InvalidRoutineDurationException.class)
    public void createInvalidDurationRoutine1() throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("X", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));

        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, null, true);
    }

    @Test(expected = InvalidRoutineDurationException.class)
    public void createInvalidDurationRoutine2() throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, IncorrectLoginException{
        Users creator = userService.login("admin1", "12345");
        Routine routine = createRoutine("X", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 0L, true);
    }

    @Test
    public void testViewAllRoutines() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator);
        Routine routine2 = createRoutine("routine2", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO,1));
        Exercise exercise3 = exerciseDao.save(new Exercise("exercise3", "description3", grupoMuscular.PECHO,1));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise2.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise3.getId());}}, (long) 90, true);
            
        assertEquals(Arrays.asList(routine1, routine2), routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 10)).getContent());

    }

    @Test
    public void testViewAllRoutinesInOrder() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator);
        Routine routine2 = createRoutine("routine2", creator);
        Routine routine3 = createRoutine("routine3", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine3 = routineService.createRoutine(creator.getId(), routine3.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(Arrays.asList(routine1, routine2, routine3), routineService.viewAllRoutines(creator.getId(), PageRequest.of(0, 10)).getContent());
    }
    
    @Test
    public void testViewAllRoutinesWithoutRoutines() throws InstanceNotFoundException, IncorrectLoginException {
        Users user = userService.login("admin1", "12345");
        assertEquals(Arrays.asList(), routineService.viewAllRoutines(user.getId(), PageRequest.of(0, 10)).getContent());
    }

    @Test
    public void testGetRoutineById() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException{
        Users creator = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(routine1, routineService.getRoutineById(routine1.getId(), creator.getId()));

    }

    
    @Test(expected = InstanceNotFoundException.class)
    public void testGetRoutineByIdNonExistent() throws InstanceNotFoundException, PermissionException, IncorrectLoginException {
        Users user = userService.login("admin1", "12345");
        Long id = 1L;
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
            assertEquals(2, retrieved.get().getExercises().size());
            assertEquals(true, retrieved.get().getExercises().contains(modified.getExercises().get(0)));
            assertEquals(true, retrieved.get().getExercises().contains(modified.getExercises().get(1)));
            assertEquals(modified.getModificationDate(), retrieved.get().getModificationDate());
        }
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testModifyRoutineNotFound() throws Exception {
        Users creator = userService.login("admin1", "12345");
        routineService.modifyRoutine(999999L, creator.getId(), "any", new ArrayList<Long>(), 30L, true);
    }

    @Test(expected = PermissionException.class)
    public void testModifyRoutinePermissionDenied() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Users otherUser = userService.login("trainer1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "r1", new ArrayList<Long>(), 45L, true);
        routineService.modifyRoutine(routine.getId(), otherUser.getId(), "new-name", new ArrayList<Long>(), 50L, true);
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testModifyRoutineWithInvalidExercise() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "r1", new ArrayList<Long>(), 45L, true);
        routineService.modifyRoutine(routine.getId(), creator.getId(), "r1", new ArrayList<Long>(){{add(999999L);}}, 45L, true);
    }

    @Test
    public void testDeleteRoutineSuccess() throws Exception {
        Users creator = userService.login("admin1", "12345");
        Routine routine = routineService.createRoutine(creator.getId(), "to-delete", new ArrayList<Long>(), 30L, true);
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
            new ArrayList<Long>(),
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
            assertEquals(0, retrieved.get().getExercises().size());
            assertEquals((Long)45L, retrieved.get().getDuration());
        }
    }


    @Test
    public void testFindRoutinesByCreator() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator1 = userService.login("trainer1", "12345");
        Users creator2 = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator1);
        Routine routine2 = createRoutine("routine2", creator1);
        Routine routine3 = createRoutine("routine3", creator2);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        
        assertEquals(Arrays.asList(), routineService.findByFilters(creator2.getId(), creator2.getId(), null,PageRequest.of(0, 10)).getContent());        

        routine1 = routineService.createRoutine(creator1.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator1.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine3 = routineService.createRoutine(creator2.getId(), routine3.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(Arrays.asList(routine1, routine2), routineService.findByFilters(creator1.getId(), creator1.getId(), null,PageRequest.of(0, 10)).getContent());
        assertEquals(Arrays.asList(routine3), routineService.findByFilters(creator2.getId(), creator2.getId(), null,PageRequest.of(0, 10)).getContent());
    }


    @Test
    public void testFindRoutinesByName() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
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
    public void testFindRoutinesByNameAndCreator() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator1 = userService.login("trainer1", "12345");
        Users creator2 = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("Pecho", creator1);
        Routine routine2 = createRoutine("Pecho y Triceps", creator2);
        Routine routine3 = createRoutine("Pierna", creator2);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO,1));
        
        routine1 = routineService.createRoutine(creator1.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine2 = routineService.createRoutine(creator2.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
        routine3 = routineService.createRoutine(creator2.getId(), routine3.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId());}}, (long) 90, true);
            
        assertEquals(Arrays.asList(routine2), routineService.findByFilters
        (creator2.getId(), creator2.getId(), "Pecho",PageRequest.of(0, 10)).getContent());
        
        assertEquals(Arrays.asList(routine2, routine3), routineService.findByFilters
        (creator2.getId(), creator2.getId(), "P",PageRequest.of(0, 10)).getContent());
    }

}
