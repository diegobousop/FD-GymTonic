package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

        mockMvc.perform(post("/api/exercise/addExercise").header("Authorization", "Bearer " + trainer.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

        //Se loguea el admin
        LoginParamsDto loginParams2 = new LoginParamsDto();
        loginParams2.setUserName("admin1");
        loginParams2.setPassword("12345");

        AuthenticatedUserDto admin = userController.login(loginParams2);
        
        //El admin valida el ejercicio correctamente
        mockMvc.perform(post("/api/exercise/validateExercise/6").header("Authorization", "Bearer " + admin.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON));

        //Al volver a intentar validar muestra el error
        mockMvc.perform(post("/api/exercise/validateExercise/6").header("Authorization", "Bearer " + admin.getServiceToken())
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





}
