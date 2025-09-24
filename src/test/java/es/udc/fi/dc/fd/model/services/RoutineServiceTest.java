package es.udc.fi.dc.fd.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;

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

    private Users createUser(String userName) {
        return new Users(userName, "12345", "firstName", "lastName", userName + "@" + userName + ".com");
    }

    private Routine createRoutine(String name, Users creator) {
        return new Routine(name, new ArrayList<Exercise>(), creator,(long) 90, LocalDateTime.now().withNano(0));
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
        routine = routineService.createRoutine(creator.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration());
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
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO));
        routine = routineService.createRoutine(creator.getId(), routine.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise2.getId());}}, (long) 90);
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

    @Test
    public void viewAllRoutines() throws IncorrectLoginException, DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException{
        Users creator = userService.login("admin1", "12345");
        Routine routine1 = createRoutine("routine1", creator);
        Routine routine2 = createRoutine("routine2", creator);
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1",grupoMuscular.PECHO));
        Exercise exercise2 = exerciseDao.save(new Exercise("exercise2", "description2", grupoMuscular.PECHO));
        Exercise exercise3 = exerciseDao.save(new Exercise("exercise3", "description3", grupoMuscular.PECHO));
        routine1 = routineService.createRoutine(creator.getId(), routine1.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise2.getId());}}, (long) 90);
        routine2 = routineService.createRoutine(creator.getId(), routine2.getName(), 
            new ArrayList<Long>(){{add(exercise1.getId()); add(exercise3.getId());}}, (long) 90);
            
        assertEquals(Arrays.asList(routine1, routine2), routineService.viewAllRoutines());

    }

}
