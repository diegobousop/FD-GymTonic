package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
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
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;
import es.udc.fi.dc.fd.rest.dtos.SearchFullDto;
import es.udc.fi.dc.fd.rest.dtos.SearchSuggestionDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SearchServiceTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserDao usersDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private AvatarDao avatarDao;

    private Users benchUser;
    private Exercise exerciseBench;
    private Routine routineBench;

    private static final String PASSWORD = "12345";
    @Before
    public void setUp() throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        benchUser = createUser("benchUser", Users.RoleType.USER);
        exerciseBench = createExercise("Bench Press", grupoMuscular.PECHO);
        routineBench = createRoutine("Bench Routine", benchUser, exerciseBench);
    }

	private Users createUser(String userName, RoleType role) {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user =  new Users(userName, PASSWORD, "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
        user.setRole(role);
        user.setPremium(true);
        user.setGender(Gender.OTHER);
        user.setHeight(190);
        user.setWeight(80);
        user.setBirthDate(LocalDate.now());
        usersDao.save(user);
		return user;
	}

    private Exercise createExercise(String name, grupoMuscular gm) {
        Exercise e = new Exercise(name, "Desc " + name, gm, 1);
        exerciseDao.save(e);
        return e;
    }

    private Routine createRoutine(String name, Users creator, Exercise exercise) throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        return routineService.createRoutine(
            creator.getId(),
            name,
            new ArrayList<Long>() {{
                add(exercise.getId());
            }},
            90L,
            true
        );
    }

    @Test
    public void testFindSuggestions() {
        List<SearchSuggestionDto> suggestions = searchService.findSuggestions("bench", 5);
        assertNotNull(suggestions);
        assertTrue(suggestions.stream().anyMatch(s -> s.getType().equals("exercise")));
    }

    @Test
    public void testFindSuggestionsEmptyText() {
        List<SearchSuggestionDto> suggestions1 = searchService.findSuggestions("", 5);
        List<SearchSuggestionDto> suggestions2 = searchService.findSuggestions(null, 5);
        assertNotNull(suggestions1);
        assertNotNull(suggestions2);
        assertTrue(suggestions1.isEmpty());
        assertTrue(suggestions2.isEmpty());
    }

    @Test
    public void testFindFullResultsWithoutFilters() {
        Map<String, List<SearchFullDto>> results = searchService.findFullResults("bench", null, null, 10, null, null, null);
        assertNotNull(results);
        assertTrue(results.get("exercises").stream()
                .anyMatch(e -> e.getName().equals(exerciseBench.getExerciseName())));
        assertTrue(results.get("routines").stream()
                .anyMatch(r -> r.getName().equals(routineBench.getName())));
        assertTrue(results.get("users").stream()
                .anyMatch(u -> u.getName().equals(benchUser.getUserName())));
    }

    @Test
    public void testFindFullResultsEmptyText() {
        Map<String, List<SearchFullDto>> resultsEmpty = searchService.findFullResults("", null, null, 10, null, null, null);
        Map<String, List<SearchFullDto>> resultsNull = searchService.findFullResults(null, null, null, 10, null, null, null);
        assertNotNull(resultsEmpty);
        assertNotNull(resultsNull);
        assertTrue(resultsEmpty.get("users").isEmpty());
        assertTrue(resultsEmpty.get("routines").isEmpty());
        assertTrue(resultsEmpty.get("exercises").isEmpty());
        assertTrue(resultsNull.get("users").isEmpty());
        assertTrue(resultsNull.get("routines").isEmpty());
        assertTrue(resultsNull.get("exercises").isEmpty());
    }

    @Test
    public void testFindSuggestionsFiltersAdminsForNonAdmin() {
        Users admin = createUser("adminUser", Users.RoleType.ADMIN);
        Users regularUser = createUser("regularUser", Users.RoleType.USER);
        
        List<SearchSuggestionDto> suggestionsUnauthenticated = searchService.findSuggestions("admin", 5);
        assertTrue(suggestionsUnauthenticated.stream()
                .noneMatch(s -> s.getType().equals("user") && s.getId().equals(admin.getId())));
        
        List<SearchSuggestionDto> suggestionsAsUser = searchService.findSuggestions("admin", 5, regularUser.getId());
        assertTrue(suggestionsAsUser.stream()
                .noneMatch(s -> s.getType().equals("user") && s.getId().equals(admin.getId())));
    }

    @Test
    public void testFindSuggestionsShowsAdminsForAdmin() {
        Users admin1 = createUser("admin1", Users.RoleType.ADMIN);
        Users admin2 = createUser("admin2", Users.RoleType.ADMIN);
        
        List<SearchSuggestionDto> suggestionsAsAdmin = searchService.findSuggestions("admin", 5, admin1.getId());
        assertTrue(suggestionsAsAdmin.stream()
                .anyMatch(s -> s.getType().equals("user") && s.getId().equals(admin2.getId())));
    }

    @Test
    public void testFindFullResultsFiltersAdminsForNonAdmin() {
        Users admin = createUser("adminUser", Users.RoleType.ADMIN);
        Users regularUser = createUser("regularUser", Users.RoleType.USER);
        Users trainer = createUser("trainerUser", Users.RoleType.TRAINER);
        
        Map<String, List<SearchFullDto>> resultsUnauthenticated = searchService.findFullResults("user", null, null, 10, null, null, null);
        assertTrue(resultsUnauthenticated.get("users").stream()
                .noneMatch(u -> u.getId().equals(admin.getId())));
        assertTrue(resultsUnauthenticated.get("users").stream()
                .anyMatch(u -> u.getId().equals(regularUser.getId()) || u.getId().equals(trainer.getId())));
        
        Map<String, List<SearchFullDto>> resultsAsUser = searchService.findFullResults("user", null, null, 10, null, null, regularUser.getId());
        assertTrue(resultsAsUser.get("users").stream()
                .noneMatch(u -> u.getId().equals(admin.getId())));
    }

    @Test
    public void testFindFullResultsShowsAdminsForAdmin() {
        Users admin1 = createUser("admin1", Users.RoleType.ADMIN);
        Users admin2 = createUser("admin2", Users.RoleType.ADMIN);
        
        Map<String, List<SearchFullDto>> resultsAsAdmin = searchService.findFullResults("admin", null, null, 10, null, null, admin1.getId());
        assertTrue(resultsAsAdmin.get("users").stream()
                .anyMatch(u -> u.getId().equals(admin2.getId())));
    }
}
