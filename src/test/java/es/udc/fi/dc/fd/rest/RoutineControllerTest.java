package es.udc.fi.dc.fd.rest;

import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.AdminController;
import es.udc.fi.dc.fd.rest.controllers.RoutineController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineControllerTest {
    @Autowired
    private UserController userController;

    @Autowired
    private RoutineController routineController;

    @Autowired
    private UserService userService;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

	@Autowired
	private MockMvc mockMvc;

    @Autowired
	private BCryptPasswordEncoder passwordEncoder;

    private static final String PASSWORD = "12345";


    private AuthenticatedUserDto createAuthenticatedUser(String userName, RoleType roleType)
			throws IncorrectLoginException {

		Users user = new Users(userName, PASSWORD, "newUser", "user", "user@test.com");

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);

		userDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserName());
		loginParams.setPassword(PASSWORD);

		return userController.login(loginParams);

	}

    @Test
    public void testPostCreateRoutine() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Rutina Alvaro");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().isOk());

    }

    @Test
    public void testPostCreateInvalidRoutine() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Rutina Alvaro");
        params.setDuration(-120L);
        params.setExercises(new ArrayList<>());

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().is4xxClientError());

        params.setDuration(120L);
        params.setName(" ");

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().is4xxClientError());
    }

    @Test
    public void testPostDuplicatedRoutine() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Rutina Alvaro");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().isOk());

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().is4xxClientError());

    }

    @Test
    public void testViewAllRoutines() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Full-Body");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)));

        params.setName("Push");
        params.setDuration(50L);
        params.setExercises(new ArrayList<>());

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)));

        mockMvc.perform(get("/api/routines/viewAllRoutines")
        .header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Full-Body"))
        .andExpect(jsonPath("$[0].duration").value("120"))
        .andExpect(jsonPath("$[1].name").value("Push"))
        .andExpect(jsonPath("$[1].duration").value("50"));

    }

    @Test
    public void testViewAllRoutinesWithoutRoutines() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        mockMvc.perform(get("/api/routines/viewAllRoutines")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0)); 
    }
}