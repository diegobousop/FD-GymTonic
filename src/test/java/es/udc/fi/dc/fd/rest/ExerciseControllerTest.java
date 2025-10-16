package es.udc.fi.dc.fd.rest;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import es.udc.fi.dc.fd.model.entities.Users;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;

import org.springframework.test.web.servlet.ResultActions;

/**
 * The Class UserControllerTest.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ExerciseControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }



    @Test
    public void addExerciseSuccessTest() throws Exception{
        
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

    }

    @Test
    public void addExerciseIsForbiddenTest() throws Exception{
        
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("user1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isForbidden());

    }

    @Test
    public void validateExerciseSuccessTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);
        
        //El admin valida el ejercicio
        mockMvc.perform(post("/api/exercise/validateExercise/" + response.andReturn().getResponse().getContentAsString()).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    }

    @Test
    public void validateExerciseAlreadyValidatedExceptionTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);
        
        String exerciseId = response.andReturn().getResponse().getContentAsString();
        
        //El admin valida el ejercicio correctamente
        mockMvc.perform(post("/api/exercise/validateExercise/" + exerciseId).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON));

        //Al volver a intentar validar muestra el error
        mockMvc.perform(post("/api/exercise/validateExercise/" + exerciseId).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());

    }

    @Test
    public void validateExerciseInstanceNotFoundExceptionTest() throws Exception{
        
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);

        //El admin valida el ejercicio
        mockMvc.perform(post("/api/exercise/validateExercise/700").header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    }

    @Test
    public void validateExercisePermissionExceptionTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        //El trainer añade un ejercicio
        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //El trainer intenta validar el ejercicio pero no tiene permisos
        mockMvc.perform(post("/api/exercise/validateExercise/" + response.andReturn().getResponse().getContentAsString()).header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden());

    }

    @Test
    public void declineExerciseSuccessTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);
        
        //El admin rechaza el ejercicio
        mockMvc.perform(post("/api/exercise/declineExercise/" + response.andReturn().getResponse().getContentAsString()).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    }

    @Test
    public void declineExerciseAlreadyValidatedExceptionTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test 2", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);
        
        String exerciseId = response.andReturn().getResponse().getContentAsString();
        
        //El admin valida el ejercicio correctamente
        mockMvc.perform(post("/api/exercise/validateExercise/" + exerciseId).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON));

        //Al intentar rechazar un ejercicio ya validado muestra el error
        mockMvc.perform(post("/api/exercise/declineExercise/" + exerciseId).header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());

    }

    @Test
    public void declineExerciseInstanceNotFoundExceptionTest() throws Exception{
        
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);

        //El admin intenta rechazar un ejercicio que no existe
        mockMvc.perform(post("/api/exercise/declineExercise/700").header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    }

    @Test
    public void declineExercisePermissionExceptionTest() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        //El trainer añade un ejercicio
        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //El trainer intenta rechazar el ejercicio pero no tiene permisos
        mockMvc.perform(post("/api/exercise/declineExercise/" + response.andReturn().getResponse().getContentAsString()).header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden());

    }

    @Test
    public void declineExercisePermissionException2Test() throws Exception{

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto trainer = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA,1);

		ObjectMapper mapper = new ObjectMapper();

        //El trainer añade un ejercicio
        ResultActions response = mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea un usuario normal
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("user1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams2);

        //El usuario intenta rechazar el ejercicio pero no tiene permisos
        mockMvc.perform(post("/api/exercise/declineExercise/" + response.andReturn().getResponse().getContentAsString()).header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden());

    }


    @Test
    public void testCreateSerie_Ok() throws Exception {
        // Crear usuario autenticado
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        // Crear ExerciseDto de ejemplo
        ExerciseDto exerciseDto = new ExerciseDto();
        exerciseDto.setId(2L);
        exerciseDto.setName("Squat");
        exerciseDto.setNumeroSeries(4);
        exerciseDto.setGrupoMuscular(Exercise.grupoMuscular.PIERNA);


        // Mockear el comportamiento del servicio


        ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/exercise/Series" )
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsBytes(exerciseDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(4)))
                .andExpect(jsonPath("$.items[0].repeticiones").value(20))
                .andExpect(jsonPath("$.items[0].peso").value(10))
                .andExpect(jsonPath("$.items[1].repeticiones").value(20))
                .andExpect(jsonPath("$.items[1].peso").value(10))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }
    @Test
    public void testCreateSerieWithNumber_Ok() throws Exception {
        // Crear usuario autenticado
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        // Crear ExerciseDto de ejemplo
        ExerciseDto exerciseDto = new ExerciseDto();
        exerciseDto.setId(2L);
        exerciseDto.setName("Squat");
        exerciseDto.setNumeroSeries(4);
        exerciseDto.setGrupoMuscular(Exercise.grupoMuscular.PIERNA);


        // Mockear el comportamiento del servicio


        ObjectMapper mapper = createObjectMapper();

        mockMvc.perform(post("/api/exercise/Series?numSeries=3" )
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsBytes(exerciseDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(3)))
                .andExpect(jsonPath("$.items[0].repeticiones").value(20))
                .andExpect(jsonPath("$.items[0].peso").value(10))
                .andExpect(jsonPath("$.items[1].repeticiones").value(20))
                .andExpect(jsonPath("$.items[1].peso").value(10))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }
    @Test
    public void testGetSerie_Ok() throws Exception {
        // Crear usuario autenticado
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);

        mockMvc.perform(get("/api/exercise/Series?serieId=" + 1 )
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.numeroSerie").value(1))
                .andExpect(jsonPath("$.repeticiones").value(20))
                .andExpect(jsonPath("$.peso").value(100));
    }


    @Test
    public void testModifySerie_Ok() throws Exception {
        // Crear usuario autenticado
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        mockMvc.perform(put("/api/exercise/Series")
                        .param("serieId", "1")
                        .param("repeticiones", "25")
                        .param("peso", "120")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // Verificamos que el DTO devuelto tenga los nuevos valores
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.numeroSerie").value(1))
                .andExpect(jsonPath("$.repeticiones").value(25))
                .andExpect(jsonPath("$.peso").value(120));
    }


    @Test
    public void testGetSerieByExercise_Ok() throws Exception {
        // Crear usuario autenticado
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        mockMvc.perform(get("/api/exercise/exerciseSeries?id=" + 1)
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // Verificamos que el DTO devuelto tenga los nuevos valores
                .andExpect(jsonPath("$.items", hasSize(4)))
                .andExpect(jsonPath("$.items[0].repeticiones").value(20))
                .andExpect(jsonPath("$.items[0].peso").value(100))
                .andExpect(jsonPath("$.items[1].repeticiones").value(30))
                .andExpect(jsonPath("$.items[1].peso").value(150))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }
}
