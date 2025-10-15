package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
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
    private UserDao usersDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private AvatarDao avatarDao;

    private Users benchUser;
    private Exercise exerciseBench;
    private Routine routineBench;

    @Before
    public void setUp() {
        benchUser = createUser("benchUser", Users.RoleType.USER);
        exerciseBench = createExercise("Bench Press", grupoMuscular.PECHO);
        routineBench = createRoutine("Bench Routine", benchUser, List.of(exerciseBench));
    }

    private Users createUser(String username, Users.RoleType role) {
        Avatar avatar = avatarDao.findByName("default").orElse(null);
        Users u = new Users(username, "12345", "First", "Last", username + "@mail.com", avatar);
        u.setRole(role);
        usersDao.save(u);
        return u;
    }

    private Exercise createExercise(String name, grupoMuscular gm) {
        Exercise e = new Exercise(name, "Desc " + name, gm, 1);
        exerciseDao.save(e);
        return e;
    }

    private Routine createRoutine(String name, Users creator, List<Exercise> exercises) {
        Routine r = new Routine(name, exercises, creator, 60L, LocalDateTime.now().withNano(0), true);
        routineDao.save(r);
        return r;
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
        Map<String, List<SearchFullDto>> results = searchService.findFullResults("bench", null, null, 10);
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
        Map<String, List<SearchFullDto>> resultsEmpty = searchService.findFullResults("", null, null, 10);
        Map<String, List<SearchFullDto>> resultsNull = searchService.findFullResults(null, null, null, 10);
        assertNotNull(resultsEmpty);
        assertNotNull(resultsNull);
        assertTrue(resultsEmpty.get("users").isEmpty());
        assertTrue(resultsEmpty.get("routines").isEmpty());
        assertTrue(resultsEmpty.get("exercises").isEmpty());
        assertTrue(resultsNull.get("users").isEmpty());
        assertTrue(resultsNull.get("routines").isEmpty());
        assertTrue(resultsNull.get("exercises").isEmpty());
    }
}
