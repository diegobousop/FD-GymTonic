package es.udc.fi.dc.fd.rest;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
public class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao usersDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineDao routineDao;

    private Users createUser(String username, Users.RoleType role) {
        Users u = new Users(username, "12345", "First", "Last", username + "@mail.com", null);
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
    public void testSuggestionsEndpoint() throws Exception {
        Users u = createUser("admin1", Users.RoleType.USER);
        Exercise e = createExercise("Push Up", grupoMuscular.PECHO);
        createRoutine("Push Routine", u, List.of(e));

        mockMvc.perform(get("/api/search/suggestions")
                        .param("text", "push")
                        .param("limit", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='exercise')]").exists())
                .andExpect(jsonPath("$[?(@.type=='routine')]").exists());
    }

    @Test
    public void testSuggestionsEmptyText() throws Exception {
        mockMvc.perform(get("/api/search/suggestions")
                        .param("text", "")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    public void testFullResultsEndpointWithoutFilters() throws Exception {
        Users u = createUser("admin1", Users.RoleType.USER);
        Exercise e = createExercise("Bench Press", grupoMuscular.PECHO);
        createRoutine("Chest Routine", u, List.of(e));

        mockMvc.perform(get("/api/search/full")
                        .param("text", "press")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users").isArray())
                .andExpect(jsonPath("$.routines").isArray())
                .andExpect(jsonPath("$.exercises").isArray());
    }

    @Test
    public void testFullResultsTrainerFilter() throws Exception {
        Users trainer1 = createUser("trainer1", Users.RoleType.TRAINER);
        Users trainer2 = createUser("trainer2", Users.RoleType.TRAINER);
        Exercise e = createExercise("Squat", grupoMuscular.PIERNA);
        createRoutine("Leg Routine", trainer1, List.of(e));
        createRoutine("Other Routine", trainer2, List.of(e));

        mockMvc.perform(get("/api/search/full")
                        .param("trainerName", "trainer1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routines[*].creatorUsername")
                        .value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.containsStringIgnoringCase("trainer1"))));
    }

    @Test
    public void testFullResultsMuscleFilter() throws Exception {
        Exercise e1 = createExercise("Pull Up", grupoMuscular.ESPALDA);
        createRoutine("Back Routine", createUser("trainerX", Users.RoleType.TRAINER), List.of(e1));

        mockMvc.perform(get("/api/search/full")
                        .param("muscleGroup", "ESPALDA")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises[*].grupoMuscular")
                        .value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.equalToIgnoringCase("ESPALDA"))));
    }

    @Test
    public void testFullResultsEmptyText() throws Exception {
        mockMvc.perform(get("/api/search/full")
                        .param("text", "")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.length()").value(0))
                .andExpect(jsonPath("$.routines.length()").value(0))
                .andExpect(jsonPath("$.exercises.length()").value(0));

        mockMvc.perform(get("/api/search/full")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.length()").value(0))
                .andExpect(jsonPath("$.routines.length()").value(0))
                .andExpect(jsonPath("$.exercises.length()").value(0));
    }

    @Test
    public void testFullResultsLimit() throws Exception {
        Users u = createUser("trainer1", Users.RoleType.TRAINER);
        Exercise e1 = createExercise("Ex1", grupoMuscular.PECHO);
        Exercise e2 = createExercise("Ex2", grupoMuscular.PECHO);
        Exercise e3 = createExercise("Ex3", grupoMuscular.PECHO);
        createRoutine("Routine1", u, List.of(e1));
        createRoutine("Routine2", u, List.of(e2));
        createRoutine("Routine3", u, List.of(e3));

        mockMvc.perform(get("/api/search/full")
                        .param("text", "Ex")
                        .param("limit", "2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises.length()").value(2));
    }
}
