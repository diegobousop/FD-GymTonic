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

import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;;;

/**
 * The Class UserControllerTest.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminControllerTest {
    

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;

    @Test
    public void testPostAddExercise() throws Exception{
        
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);
        
        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA);
        
        ExerciseDto exerciseToAdd2 = new ExerciseDto("ejercicio test 2", "ejercicio test", grupoMuscular.PIERNA);
        
		ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/api/admin/addExercise").header("Authorization", "Bearer " + user.getServiceToken())
        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(exerciseToAdd)))
        .andExpect(status().isOk());

    }
}
