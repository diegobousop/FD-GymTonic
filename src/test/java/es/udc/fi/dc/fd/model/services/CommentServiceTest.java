package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.*;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CommentServiceTest {
    @Autowired
    private CommentService commentService;
    @Autowired
    private UserService userService;
    @Autowired
    private RoutineService routineService;
    @Autowired
    private CommentDao commentDao;
    @Autowired
    private ExerciseDao exerciseDao;
    private static final String PASSWORD = "12345";
    protected Users user;
    protected Training training;
    private final Pageable pageable = PageRequest.of(0, 5);

    @Before
    public void setup() throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException, LoginUserBlockedException, IncorrectLoginException {

        user = userService.login("admin1", PASSWORD);

        training = createTraining("training1", user);
    }

    private Training createTraining(String name, Users creator) throws DuplicateInstanceException, InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {

        Exercise exercise1 = exerciseDao.save(new Exercise(
                "exercise1", "description1", grupoMuscular.PECHO, 1));

        List<Long> exercises = new ArrayList<>();
        exercises.add(exercise1.getId());

        Routine routine = routineService.createRoutine(
                creator.getId(),
                "routine1",
                exercises,
                60L,
                true
        );

        List<Serie> series = routineService.getDefaultRoutineSeries(
                routine.getId(), exercise1.getId());

        return routineService.createTrainingFromRoutine(
                creator.getId(),
                name,
                "Description of training",
                45L,
                true,
                series,
                routine.getId()
        );
    }

    @Test
    public void testAddCommentSuccess() throws Exception {

        Comment comment = commentService.addComment(
                training.getId(),
                user.getId(),
                "Hola mundo"
        );

        Optional<Comment> retrieved = commentDao.findById(comment.getId());

        assertTrue(retrieved.isPresent());
        assertEquals("Hola mundo", retrieved.get().getMensaje());
        assertEquals(user.getId(), retrieved.get().getUser().getId());
        assertEquals(training.getId(), retrieved.get().getTraining().getId());
        assertTrue(comment.getFecha().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testAddCommentUserNotFound() throws Exception {

        commentService.addComment(
                training.getId(),
                99L,   // usuario inexistente
                "mensaje"
        );
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testAddCommentTrainingNotFound() throws Exception {

        commentService.addComment(
                99L,   // entrenamiento inexistente
                user.getId(),
                "mensaje"
        );
    }

    @Test
    public void testGetCommentSuccess() throws Exception {

        Comment comment = commentService.addComment(
                training.getId(),
                user.getId(),
                "Comentario de prueba"
        );

        Comment retrieved = commentService.getComment(comment.getId());

        assertNotNull(retrieved);
        assertEquals(comment.getId(), retrieved.getId());
        assertEquals("Comentario de prueba", retrieved.getMensaje());
        assertEquals(user.getId(), retrieved.getUser().getId());
        assertEquals(training.getId(), retrieved.getTraining().getId());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testGetCommentNotFound() throws Exception {

        commentService.getComment(999999L); // ID inexistente
    }

    @Test
    public void testGetCommentsSuccess() throws Exception {

        commentService.addComment(training.getId(), user.getId(), "Mensaje 1");
        commentService.addComment(training.getId(), user.getId(), "Mensaje 2");

        Page<Comment> comments = commentService.getComments(training.getId(), pageable);

        assertNotNull(comments);
        assertEquals(2, comments.getContent().size());
        assertEquals(training.getId(), comments.getContent().get(0).getTraining().getId());
        assertEquals(training.getId(), comments.getContent().get(1).getTraining().getId());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testGetCommentsTrainingNotFound() throws Exception {

        commentService.getComments(999999L, pageable); // training inexistente
    }

    @Test
    public void testDeleteCommentAsAdmin() throws Exception {

        Comment comment = commentService.addComment(training.getId(), user.getId(), "Hola");

        commentService.deleteComment(comment.getId(), training.getId(), user.getId());

        assertFalse(commentDao.findById(comment.getId()).isPresent());
    }

    @Test
    public void testDeleteCommentAsTrainingCreator() throws Exception {

        Comment comment = commentService.addComment(training.getId(), user.getId(), "Hola");

        commentService.deleteComment(comment.getId(), training.getId(), user.getId());

        assertFalse(commentDao.findById(comment.getId()).isPresent());
    }

    @Test
    public void testDeleteCommentAsCommentOwner() throws Exception {

        Users owner = new Users("owner", PASSWORD, "Name", "Surname",
                "owner@owner.com", null);
        owner.setRole(RoleType.USER);
        owner.setGender(Gender.MALE);
        owner.setHeight(180);
        owner.setWeight(75);
        owner.setBirthDate(LocalDate.now());
        userService.signUp(owner, RoleType.USER);

        Comment comment = commentService.addComment(training.getId(), owner.getId(), "Comentario mío");

        commentService.deleteComment(comment.getId(), training.getId(), owner.getId());

        assertFalse(commentDao.findById(comment.getId()).isPresent());
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testDeleteCommentNotFound() throws Exception {

        commentService.deleteComment(999999L, training.getId(), user.getId()); // comentario inexistente
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testDeleteCommentTrainingNotFound() throws Exception {

        Comment comment = commentService.addComment(training.getId(), user.getId(), "Hola");

        commentService.deleteComment(comment.getId(), 999999L, user.getId()); // training inexistente
    }

    @Test(expected = PermissionException.class)
    public void testDeleteCommentWithoutPermission() throws Exception {

        Users other = new Users("other", PASSWORD, "Name", "Surname",
                "other@other.com", null);
        other.setRole(RoleType.USER);
        other.setGender(Gender.MALE);
        other.setHeight(180);
        other.setWeight(75);
        other.setBirthDate(LocalDate.now());
        userService.signUp(other, RoleType.USER);

        Comment comment = commentService.addComment(training.getId(), user.getId(), "Hola");

        commentService.deleteComment(comment.getId(), training.getId(), other.getId());
    }

}
