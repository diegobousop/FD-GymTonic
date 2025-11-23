package es.udc.fi.dc.fd.rest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;

@SuppressWarnings("null")
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
    private AvatarDao avatarDao;

    @Autowired
    private UserController userController;

    @Autowired
	private BCryptPasswordEncoder passwordEncoder;

    // ---------- FUNCIONES AUXILIARES ----------

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    private AuthenticatedUserDto createUser(String userName, RoleType roleType)
			throws LoginUserBlockedException, IncorrectLoginException {
        Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, "12345", "newUser", "user", "user@test.com", avatar.orElse(null));

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);
        user.setGender(Users.Gender.OTHER);
        user.setHeight(180);
        user.setWeight(75.0f);
        user.setBirthDate(LocalDate.now().minusYears(25));
        user.setPremium(true);

		usersDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserName());
		loginParams.setPassword("12345");

		return userController.login(loginParams);

	}

    private Exercise createExercise(String name, grupoMuscular gm) {
        Exercise e = new Exercise(name, "Desc " + name, gm, 1);
        exerciseDao.save(e);
        return e;
    }

    private void createRoutine(String name, AuthenticatedUserDto creator, List<Exercise> exercises) throws Exception{
        
        List<Long> exIds = new ArrayList<>();
        for (Exercise e : exercises) {
            exIds.add(e.getId());
        }

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName(name);
        params.setDuration(120L);
        params.setExercises(exIds);
        params.setIsPublic(true);

		ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine")
            .header("Authorization", "Bearer " + creator.getServiceToken())
            .requestAttr("userId", creator.getUserDto().getId())
			.contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsBytes(params)))
			.andExpect(status().isOk());
    }

    // ---------- TESTS ----------

    @Test
    public void testSuggestionsEndpoint() throws Exception {
        AuthenticatedUserDto u = createUser("admin", Users.RoleType.USER);
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
        AuthenticatedUserDto u = createUser("admin", Users.RoleType.USER);
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
        AuthenticatedUserDto trainer1 = createUser("trainer", Users.RoleType.TRAINER);
        AuthenticatedUserDto trainer2 = createUser("trainer2", Users.RoleType.TRAINER);
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
        AuthenticatedUserDto u = createUser("trainer", Users.RoleType.TRAINER);
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

    @Test
    public void testSuggestionsFiltersAdminsForNonAdmin() throws Exception {
        AuthenticatedUserDto admin = createUser("adminUser", Users.RoleType.ADMIN);
        AuthenticatedUserDto regularUser = createUser("regularUser", Users.RoleType.USER);
        
        // Búsqueda sin userId (no autenticado) - no debe mostrar admins
        mockMvc.perform(get("/api/search/suggestions")
                        .param("text", "admin")
                        .param("limit", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='user' && @.id==" + admin.getUserDto().getId() + ")]").doesNotExist());
        
        // Búsqueda con userId de usuario regular - no debe mostrar admins
        mockMvc.perform(get("/api/search/suggestions")
                        .param("text", "admin")
                        .param("limit", "5")
                        .requestAttr("userId", regularUser.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='user' && @.id==" + admin.getUserDto().getId() + ")]").doesNotExist());
    }

    @Test
    public void testSuggestionsShowsAdminsForAdmin() throws Exception {
        AuthenticatedUserDto admin1 = createUser("admin", Users.RoleType.ADMIN);
        AuthenticatedUserDto admin2 = createUser("admin2", Users.RoleType.ADMIN);
        
        // Búsqueda con userId de admin - debe mostrar otros admins
        mockMvc.perform(get("/api/search/suggestions")
                        .param("text", "admin")
                        .param("limit", "5")
                        .requestAttr("userId", admin1.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='user' && @.id==" + admin2.getUserDto().getId() + ")]").exists());
    }

    @Test
    public void testFullResultsFiltersAdminsForNonAdmin() throws Exception {
        AuthenticatedUserDto admin = createUser("adminUser", Users.RoleType.ADMIN);
        AuthenticatedUserDto regularUser = createUser("regularUser", Users.RoleType.USER);
        
        // Búsqueda sin userId (no autenticado) - no debe mostrar admins
        mockMvc.perform(get("/api/search/full")
                        .param("text", "user")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[?(@.id==" + admin.getUserDto().getId() + ")]").doesNotExist());
        
        // Búsqueda con userId de usuario regular - no debe mostrar admins
        mockMvc.perform(get("/api/search/full")
                        .param("text", "user")
                        .requestAttr("userId", regularUser.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[?(@.id==" + admin.getUserDto().getId() + ")]").doesNotExist());
    }

    @Test
    public void testFullResultsShowsAdminsForAdmin() throws Exception {
        AuthenticatedUserDto admin1 = createUser("admin", Users.RoleType.ADMIN);
        AuthenticatedUserDto admin2 = createUser("admin2", Users.RoleType.ADMIN);
        
        // Búsqueda con userId de admin - debe mostrar otros admins
        mockMvc.perform(get("/api/search/full")
                        .param("text", "admin")
                        .requestAttr("userId", admin1.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[?(@.id==" + admin2.getUserDto().getId() + ")]").exists());
    }
}
