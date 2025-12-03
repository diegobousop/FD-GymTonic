package es.udc.fi.dc.fd.rest;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Comment;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.services.CommentService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.CommentParamsDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

@SuppressWarnings("null")
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CommentControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private CommentService commentService;


    private AuthenticatedUserDto user;

    private Training training;

    ObjectMapper mapper;


    @Before
    public void setup() throws Exception {

        // Inicia sesion user y crea un entrenamiento base sobre el que comentar

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("admin1");
        loginParams.setPassword("12345");
        user = userController.login(loginParams);

        mapper = createObjectMapper();

        training = createTraining(user.getUserDto().getId());
    }

    private ObjectMapper createObjectMapper() {
        mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    private CommentParamsDto createCommentParamsDto(String mensaje) {
        return new CommentParamsDto(mensaje, training.getId());
    }

    private Training createTraining(Long creatorId) throws Exception {
        
        Exercise exercise1 = exerciseDao.save(new Exercise("exercise1", "description1", grupoMuscular.PECHO, 1));
        
        Routine routine = routineService.createRoutine(creatorId, "routine1", 
            new ArrayList<Long>(){{add(exercise1.getId());}}, 60L, true);
        
        List<Serie> series = routineService.getDefaultRoutineSeries(routine.getId(), exercise1.getId());
        
        return routineService.createTrainingFromRoutine(
            creatorId,
            "Training 1",
            "Description of training",
            45L,
            true,
            series,
            routine.getId()
        );
    }

    private Comment addComment(String mensaje) throws InstanceNotFoundException{
        return commentService.addComment(training.getId(), user.getUserDto().getId(), mensaje);
    }

    @Test
    public void addCommentSuccessTest() throws Exception{

        CommentParamsDto comment = createCommentParamsDto("Buen entrenamiento!");

        mockMvc.perform(
            post("/api/comment/addComment")
            .requestAttr("userId", user.getUserDto().getId())
            .header("Authorization", "Bearer " + user.getServiceToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsBytes(comment))
        ).andExpect(status().isOk());
    }

    @Test
    public void addCommentTrainingNotFoundTest() throws Exception {

        CommentParamsDto params = new CommentParamsDto("msg", 999999L);

        mockMvc.perform(
            post("/api/comment/addComment")
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params))
        ).andExpect(status().isNotFound());
    }

    @Test
    public void addCommentEmptyMessageBadRequestTest() throws Exception {

        CommentParamsDto params = new CommentParamsDto("", training.getId());

        mockMvc.perform(
            post("/api/comment/addComment")
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params))
        ).andExpect(status().isBadRequest());
    }

    @Test
    public void addCommentNullTrainingIdBadRequestTest() throws Exception {

        CommentParamsDto params = new CommentParamsDto("Texto válido", null);

        mockMvc.perform(
            post("/api/comment/addComment")
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(params))
        ).andExpect(status().isBadRequest());
    }


    @Test
    public void getCommentsTest() throws Exception {
        //Añadimos comentarios
        addComment("Comentario 1");
        addComment("Comentario 2");
        addComment("Comentario 3");

        String comments =mockMvc.perform(get("/api/comment/getComments/" + training.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.existMoreItems").isBoolean())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode after = mapper.readTree(comments);
        com.fasterxml.jackson.databind.JsonNode items = after.get("items");

        org.junit.Assert.assertEquals(3, items.size());

        com.fasterxml.jackson.databind.JsonNode primero = items.get(items.size() - 3);
        com.fasterxml.jackson.databind.JsonNode segundo = items.get(items.size() - 2);
        com.fasterxml.jackson.databind.JsonNode tercero = items.get(items.size() - 1);

        org.junit.Assert.assertEquals("Comentario 1", primero.get("mensaje").asText());
        org.junit.Assert.assertEquals("Comentario 2", segundo.get("mensaje").asText());
        org.junit.Assert.assertEquals("Comentario 3", tercero.get("mensaje").asText());
    }

    @Test
    public void getCommentsTrainingNotFoundTest() throws Exception {

        mockMvc.perform(get("/api/comment/getComments/999999")
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getCommentsEmptyListTest() throws Exception {

        mockMvc.perform(get("/api/comment/getComments/" + training.getId())
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.existMoreItems").value(false));
    }

    @Test
    public void getCommentsPaginationTest() throws Exception {

        // Crear 15 comentarios
        for (int i = 1; i <= 15; i++) {
            addComment("Comentario " + i);
        }

        mockMvc.perform(get("/api/comment/getComments/" + training.getId())
                .requestAttr("userId", user.getUserDto().getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(10))
                .andExpect(jsonPath("$.existMoreItems").value(true));
    }

    @Test
    public void getCommentsUnauthorizedTest() throws Exception {

        mockMvc.perform(get("/api/comment/getComments/" + training.getId())
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }



    @Test
    public void testDeleteCommentSuccess() throws Exception {

        Comment comment = addComment("Comentario 1");
        
        mockMvc.perform(delete("/api/comment/deleteComment/" + comment.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("trainingId", String.valueOf(training.getId()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testDeleteCommentNotFound() throws Exception {
        
        mockMvc.perform(delete("/api/comment/deleteComment/99")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("trainingId", String.valueOf(training.getId()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteCommentTrainingNotFound() throws Exception {

        Comment comment = addComment("Comentario");

        mockMvc.perform(delete("/api/comment/deleteComment/" + comment.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("trainingId", "9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteCommentNoPermission() throws Exception {

        Comment comment = addComment("Comentario 1");

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("user1");
        loginParams.setPassword("12345");
        AuthenticatedUserDto user1 = userController.login(loginParams);

        mockMvc.perform(delete("/api/comment/deleteComment/" + comment.getId())
                .header("Authorization", "Bearer " + user1.getServiceToken())
                .param("trainingId", String.valueOf(training.getId()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void deleteCommentAsAdmin() throws Exception {

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("user1");
        loginParams.setPassword("12345");
        AuthenticatedUserDto user1 = userController.login(loginParams);

        Comment comment = commentService.addComment(training.getId(), user1.getUserDto().getId(), "comentario");

        mockMvc.perform(delete("/api/comment/deleteComment/" + comment.getId())
                .header("Authorization", "Bearer " + user.getServiceToken())
                .param("trainingId", String.valueOf(training.getId()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void deleteCommentNoAuth() throws Exception {

        Comment comment = addComment("Comentario 1");

        mockMvc.perform(delete("/api/comment/deleteComment/" + comment.getId())
                .param("trainingId", String.valueOf(training.getId()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
