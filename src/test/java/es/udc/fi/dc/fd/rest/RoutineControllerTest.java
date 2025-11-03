package es.udc.fi.dc.fd.rest;

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
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.Exercise.Difficulty;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;
import es.udc.fi.dc.fd.rest.dtos.TrainingParamsDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseRoutineParamsDto;
import es.udc.fi.dc.fd.rest.dtos.SerieParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineControllerTest {
    @Autowired
    private UserController userController;

    @Autowired
    private UserDao userDao;

    @Autowired
	private AvatarDao avatarDao;

    @Autowired
	private ExerciseDao exerciseDao;

	@Autowired
	private MockMvc mockMvc;

    @Autowired
	private BCryptPasswordEncoder passwordEncoder;

    private static final String PASSWORD = "12345";

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    private AuthenticatedUserDto createAuthenticatedUser(String userName, RoleType roleType)
			throws LoginUserBlockedException, IncorrectLoginException {
        Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, PASSWORD, "newUser", "user", "user@test.com", avatar.orElse(null));

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
        params.setIsPublic(true);

		ObjectMapper mapper = createObjectMapper();

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

		ObjectMapper mapper = createObjectMapper();

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
        params.setIsPublic(true);

		ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().isOk());

        mockMvc.perform(post("/api/routines/createRoutine").header("Authorization", "Bearer " + user.getServiceToken())
			.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(params)))
			.andExpect(status().is4xxClientError());

    }

    @Test
    public void testViewAllRoutines() throws Exception {

        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Full-Body");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

        ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)));

        params.setName("Push");
        params.setDuration(50L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

        mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)));

        mockMvc.perform(get("/api/routines/viewAllRoutines")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Full-Body"))
                .andExpect(jsonPath("$.items[0].duration").value(120))
                .andExpect(jsonPath("$.items[1].name").value("Push"))
                .andExpect(jsonPath("$.items[1].duration").value(50))
                .andExpect(jsonPath("$.existMoreItems").isBoolean());
    }

    @Test
    public void testViewAllRoutinesWithoutRoutines() throws Exception {

        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        mockMvc.perform(get("/api/routines/viewAllRoutines")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }


    @Test
    public void testRemoveExerciseFromRoutineSuccess() throws Exception {
    AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

    // Crear una rutina
    RoutineParamsDto createParams = new RoutineParamsDto();
    createParams.setName("Routine with Exercise");
    createParams.setDuration(45L);
    createParams.setExercises(new ArrayList<>());
    createParams.setIsPublic(true);

    ObjectMapper mapper = createObjectMapper();

    String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
            .header("Authorization", "Bearer " + user.getServiceToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsBytes(createParams)))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

    RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);

    // Crear un ejercicio
    ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1, Difficulty.FACIL, Equipment.POLEA_CABLE);

    String exerciseJson = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + user.getServiceToken())
    .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

    Long createdExerciseId = mapper.readValue(exerciseJson, Long.class);

    // Asociar el ejercicio a la rutina
    List<Long> exerciseIds = new ArrayList<>();
    exerciseIds.add(createdExerciseId);

    RoutineParamsDto modifyParams = new RoutineParamsDto();
    modifyParams.setName(createdRoutine.getName());
    modifyParams.setDuration(createdRoutine.getDuration());
    modifyParams.setExercises(exerciseIds);
    modifyParams.setIsPublic(createdRoutine.getIsPublic());

    mockMvc.perform(put("/api/routines/modifyRoutine/" + createdRoutine.getId())
        .header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsBytes(modifyParams)))
        .andExpect(status().isOk());

    // Quitar el ejercicio de la rutina
    mockMvc.perform(put("/api/routines/" + createdRoutine.getId() + "/removeExercise/" + createdExerciseId )
        .header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
    }

    @Test
    public void testRemoveExerciseFromRoutine_NotFoundRoutine() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        Long nonExistingRoutineId = 99999L;
        Long someExerciseId = 1L; // ID cualquiera

        mockMvc.perform(put("/api/routines/" + nonExistingRoutineId + "/removeExercise/" + someExerciseId)
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        }

    @Test
    public void testRemoveExerciseFromRoutine_NotFoundExercise() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        // Crear una rutina válida
        RoutineParamsDto createParams = new RoutineParamsDto();
        createParams.setName("Routine test");
        createParams.setDuration(45L);
        createParams.setExercises(new ArrayList<>());
        createParams.setIsPublic(true);

        ObjectMapper mapper = createObjectMapper();

        String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(createParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);

        Long nonExistingExerciseId = 99999L;

        mockMvc.perform(put("/api/routines/" + createdRoutine.getId() + "/removeExercise/" + nonExistingExerciseId)
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        }




    @Test
    public void testModifyRoutineSuccess() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        RoutineParamsDto createParams = new RoutineParamsDto();
        createParams.setName("Original Routine");
        createParams.setDuration(60L);
        createParams.setExercises(new ArrayList<>());
        createParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String responseJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(createParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
                
        RoutineDto createdRoutine = mapper.readValue(responseJson, RoutineDto.class);
        
        RoutineParamsDto modifyParams = new RoutineParamsDto();
        modifyParams.setName("Modified Routine");
        modifyParams.setDuration(90L);
        modifyParams.setExercises(new ArrayList<>());
        modifyParams.setIsPublic(true);
        
        mockMvc.perform(put("/api/routines/modifyRoutine/" + createdRoutine.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(modifyParams)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Modified Routine"))
                .andExpect(jsonPath("$.duration").value("90"));
    }
    
    @Test
    public void testModifyRoutineNotFound() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Modified Routine");
        params.setDuration(90L);
        params.setExercises(new ArrayList<>());
        
        ObjectMapper mapper = createObjectMapper();
        
        mockMvc.perform(put("/api/routines/modifyRoutine/999999")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)))
                .andExpect(status().is4xxClientError());
    }
    
    @Test
    public void testModifyRoutinePermissionDenied() throws Exception {
        AuthenticatedUserDto creator = createAuthenticatedUser("creator", RoleType.TRAINER);
        AuthenticatedUserDto otherUser = createAuthenticatedUser("otheruser", RoleType.USER);
        
        RoutineParamsDto createParams = new RoutineParamsDto();
        createParams.setName("Original Routine");
        createParams.setDuration(60L);
        createParams.setExercises(new ArrayList<>());
        createParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String responseJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + creator.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(createParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
                
        RoutineDto createdRoutine = mapper.readValue(responseJson, RoutineDto.class);
        
        RoutineParamsDto modifyParams = new RoutineParamsDto();
        modifyParams.setName("Modified Routine");
        modifyParams.setDuration(90L);
        modifyParams.setExercises(new ArrayList<>());
        modifyParams.setIsPublic(true);
        
        mockMvc.perform(put("/api/routines/modifyRoutine/" + createdRoutine.getId())
                .header("Authorization", "Bearer " + otherUser.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(modifyParams)))
                .andExpect(status().is4xxClientError());
    }
    
    @Test
    public void testDeleteRoutineSuccess() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        RoutineParamsDto createParams = new RoutineParamsDto();
        createParams.setName("Routine to Delete");
        createParams.setDuration(45L);
        createParams.setExercises(new ArrayList<>());
        createParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String responseJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(createParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
                
        RoutineDto createdRoutine = mapper.readValue(responseJson, RoutineDto.class);
        
        mockMvc.perform(delete("/api/routines/deleteRoutine/" + createdRoutine.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
    
    @Test
    public void testDeleteRoutineNotFound() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        mockMvc.perform(delete("/api/routines/deleteRoutine/999999")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }
    
    @Test
    public void testDeleteRoutinePermissionDenied() throws Exception {
        AuthenticatedUserDto creator = createAuthenticatedUser("creator", RoleType.TRAINER);
        AuthenticatedUserDto otherUser = createAuthenticatedUser("otheruser", RoleType.USER);
        
        RoutineParamsDto createParams = new RoutineParamsDto();
        createParams.setName("Routine to Delete");
        createParams.setDuration(45L);
        createParams.setExercises(new ArrayList<>());
        createParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String responseJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + creator.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(createParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
                
        RoutineDto createdRoutine = mapper.readValue(responseJson, RoutineDto.class);
        
        mockMvc.perform(delete("/api/routines/deleteRoutine/" + createdRoutine.getId())
                .header("Authorization", "Bearer " + otherUser.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }


    @Test
    public void testGetRoutineById() throws Exception{

		AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Full-Body");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

		ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());


        MvcResult result = mockMvc.perform(post("/api/routines/createRoutine")
            .header("Authorization", "Bearer " + user.getServiceToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsBytes(params)))
            .andExpect(status().isOk())
            .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        RoutineDto createdRoutine = mapper.readValue(jsonResponse, RoutineDto.class);

        Long routineId = createdRoutine.getId();

        mockMvc.perform(get("/api/routines/getRoutineById/" + routineId)
        .header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("name").value("Full-Body"))
        .andExpect(jsonPath("duration").value("120"));

    }


    @Test
    public void testFindRoutinesByParams() throws Exception {

        AuthenticatedUserDto user1 = createAuthenticatedUser("trainer", RoleType.TRAINER);
        AuthenticatedUserDto user2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);

        RoutineParamsDto params = new RoutineParamsDto();
        params.setName("Pierna");
        params.setDuration(120L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

        ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)));

        params.setName("Pecho");
        params.setDuration(50L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

        mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)));

        params.setName("Pecho y hombro");
        params.setDuration(60L);
        params.setExercises(new ArrayList<>());
        params.setIsPublic(true);

        mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user2.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params)));
        
        // 3 rutinas en la bd ahora mismo -> Pierna, Pecho, Pecho y hombro
        // Creadas por                        user1, user1,    user2

        // Buscar por creador y nombre
        mockMvc.perform(get("/api/routines/search?creatorId=" + user1.getUserDto().getId() + "&name=Pecho")
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Pecho"))
                .andExpect(jsonPath("$.items[0].duration").value(50))
                .andExpect(jsonPath("$.existMoreItems").isBoolean());

        // Buscar por nombre
        mockMvc.perform(get("/api/routines/search?name=Pecho")
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Pecho"))
                .andExpect(jsonPath("$.items[1].name").value("Pecho y hombro"))
                .andExpect(jsonPath("$.existMoreItems").isBoolean());

        // Buscar por creador
        mockMvc.perform(get("/api/routines/search?creatorId=" + user1.getUserDto().getId())
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Pierna"))
                .andExpect(jsonPath("$.items[1].name").value("Pecho"))
                .andExpect(jsonPath("$.existMoreItems").isBoolean());
    }

    @Test
    public void testCreateTrainingFromRoutineSuccess() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.ADMIN);
        
        // Crear ejercicio
        Exercise exercise1 = new Exercise("exercise1", "description1", Exercise.grupoMuscular.PECHO, 1);
        exerciseDao.save(exercise1);
        
        // Crear rutina
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("Rutina Test");
        routineParams.setDuration(60L);
        routineParams.setExercises(new ArrayList<Long>() {{add(exercise1.getId());}});
        routineParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);
        
        // Crear training desde la rutina
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(createdRoutine.getId());
        trainingParams.setName("Training 1");
        trainingParams.setDescription("Description of training");
        trainingParams.setDuration(45L);
        trainingParams.setVisibility(true);
        
        SerieParamsDto serieParams = new SerieParamsDto();
        serieParams.setRepeticiones(10);
        serieParams.setPeso(50);
        serieParams.setNumeroSerie(0);
        
        ExerciseRoutineParamsDto exerciseRoutineParams = new ExerciseRoutineParamsDto();
        exerciseRoutineParams.setId(exercise1.getId());
        exerciseRoutineParams.setSeries(new ArrayList<SerieParamsDto>() {{add(serieParams);}});
        
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>() {{add(exerciseRoutineParams);}});
        
        mockMvc.perform(post("/api/routines/createTraining")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().isOk());

            
    }

    @Test
    public void testCreateTrainingFromRoutineWithInvalidUser() throws Exception {
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(1L);
        trainingParams.setName("Training");
        trainingParams.setDescription("Description");
        trainingParams.setDuration(30L);
        trainingParams.setVisibility(true);
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>());
        
        ObjectMapper mapper = createObjectMapper();
        
        // Sin token de autenticación (usuario inválido)
        mockMvc.perform(post("/api/routines/createTraining")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testCreateTrainingFromRoutineWithInvalidRoutine() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(999999L); // ID de rutina inexistente
        trainingParams.setName("Training");
        trainingParams.setDescription("Description");
        trainingParams.setDuration(30L);
        trainingParams.setVisibility(true);
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>());
        
        ObjectMapper mapper = createObjectMapper();
        
        mockMvc.perform(post("/api/routines/createTraining")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testCreateTrainingFromRoutineWithInvalidExercise() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        // Crear rutina sin ejercicios
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("Rutina Test");
        routineParams.setDuration(60L);
        routineParams.setExercises(new ArrayList<Long>());
        routineParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);
        
        // Intentar crear training con ejercicio inexistente
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(createdRoutine.getId());
        trainingParams.setName("Training");
        trainingParams.setDescription("Description");
        trainingParams.setDuration(30L);
        trainingParams.setVisibility(true);
        
        SerieParamsDto serieParams = new SerieParamsDto();
        serieParams.setRepeticiones(10);
        serieParams.setPeso(50);
        serieParams.setNumeroSerie(0);
        
        ExerciseRoutineParamsDto exerciseRoutineParams = new ExerciseRoutineParamsDto();
        exerciseRoutineParams.setId(999999L); // ID de ejercicio inexistente
        exerciseRoutineParams.setSeries(new ArrayList<SerieParamsDto>() {{add(serieParams);}});
        
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>() {{add(exerciseRoutineParams);}});
        
        mockMvc.perform(post("/api/routines/createTraining")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testCreateTrainingWithMultipleSeries() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        // Crear ejercicio con múltiples series
        Exercise exercise1 = new Exercise("exercise1", "description1", Exercise.grupoMuscular.PECHO, 2);
        exerciseDao.save(exercise1);
        
        // Crear rutina
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("Rutina Test");
        routineParams.setDuration(60L);
        routineParams.setExercises(new ArrayList<Long>() {{add(exercise1.getId());}});
        routineParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);
        
        // Crear training con múltiples series
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(createdRoutine.getId());
        trainingParams.setName("Training with multiple series");
        trainingParams.setDescription("Description");
        trainingParams.setDuration(50L);
        trainingParams.setVisibility(false);
        
        SerieParamsDto serie1 = new SerieParamsDto();
        serie1.setRepeticiones(10);
        serie1.setPeso(50);
        serie1.setNumeroSerie(0);
        
        SerieParamsDto serie2 = new SerieParamsDto();
        serie2.setRepeticiones(8);
        serie2.setPeso(55);
        serie2.setNumeroSerie(1);
        
        ExerciseRoutineParamsDto exerciseRoutineParams = new ExerciseRoutineParamsDto();
        exerciseRoutineParams.setId(exercise1.getId());
        exerciseRoutineParams.setSeries(new ArrayList<SerieParamsDto>() {{add(serie1); add(serie2);}});
        
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>() {{add(exerciseRoutineParams);}});
        
        mockMvc.perform(post("/api/routines/createTraining")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateTrainingWithEmptySeries() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("trainer", RoleType.TRAINER);
        
        // Crear rutina sin ejercicios
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("Rutina Test");
        routineParams.setDuration(60L);
        routineParams.setExercises(new ArrayList<Long>());
        routineParams.setIsPublic(true);
        
        ObjectMapper mapper = createObjectMapper();
        
        String routineJson = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        RoutineDto createdRoutine = mapper.readValue(routineJson, RoutineDto.class);
        
        // Crear training sin series
        TrainingParamsDto trainingParams = new TrainingParamsDto();
        trainingParams.setRoutineId(createdRoutine.getId());
        trainingParams.setName("Training without series");
        trainingParams.setDescription("Empty training");
        trainingParams.setDuration(20L);
        trainingParams.setVisibility(true);
        trainingParams.setExercises(new ArrayList<ExerciseRoutineParamsDto>());
        
        mockMvc.perform(post("/api/routines/createTraining")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(trainingParams)))
                .andExpect(status().isOk());
    }

    @Test
    public void testFollowAndUnfollowRoutine() throws Exception {
        // Crear un usuario entrenador
        AuthenticatedUserDto trainer = createAuthenticatedUser("trainer_" + System.currentTimeMillis(), RoleType.TRAINER);

        // Crear rutina pública con nombre único
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("Rutina_" + System.currentTimeMillis());
        routineParams.setDuration(90L);
        routineParams.setExercises(new ArrayList<>());
        routineParams.setIsPublic(true);

        ObjectMapper mapper = createObjectMapper();

        MvcResult result = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + trainer.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn();

        RoutineDto createdRoutine = mapper.readValue(result.getResponse().getContentAsString(), RoutineDto.class);
        Long routineId = createdRoutine.getId();

        // Crear un usuario normal
        AuthenticatedUserDto user = createAuthenticatedUser("user_" + System.currentTimeMillis(), RoleType.USER);

        // FOLLOW
        mockMvc.perform(post("/api/routines/" + routineId + "/follow")
                .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isNoContent());

        // UNFOLLOW
        mockMvc.perform(delete("/api/routines/" + routineId + "/unfollow")
                .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testGetFollowersByRoutine() throws Exception {
        // Crear un usuario entrenador
        AuthenticatedUserDto trainer = createAuthenticatedUser("trainer_" + System.currentTimeMillis(), RoleType.TRAINER);

        // Crear rutina pública con nombre único
        RoutineParamsDto routineParams = new RoutineParamsDto();
        routineParams.setName("RutinaFollowers_" + System.currentTimeMillis());
        routineParams.setDuration(60L);
        routineParams.setExercises(new ArrayList<>());
        routineParams.setIsPublic(true);

        ObjectMapper mapper = createObjectMapper();

        MvcResult result = mockMvc.perform(post("/api/routines/createRoutine")
                .header("Authorization", "Bearer " + trainer.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(routineParams)))
                .andExpect(status().isOk())
                .andReturn();

        RoutineDto createdRoutine = mapper.readValue(result.getResponse().getContentAsString(), RoutineDto.class);
        Long routineId = createdRoutine.getId();

        // Crear un usuario que seguirá la rutina
        AuthenticatedUserDto user = createAuthenticatedUser("user_" + System.currentTimeMillis(), RoleType.USER);

        mockMvc.perform(post("/api/routines/" + routineId + "/follow")
                .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isNoContent());

        // Consultar seguidores con el entrenador
        mockMvc.perform(get("/api/routines/" + routineId + "/followers")
                .header("Authorization", "Bearer " + trainer.getServiceToken())
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].userName").value(user.getUserDto().getUserName()))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }
}