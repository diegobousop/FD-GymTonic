package es.udc.fi.dc.fd.rest;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.NotificationController;
import es.udc.fi.dc.fd.rest.controllers.RoutineController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class NotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;
    @Autowired
    private UserService userService;
    @Autowired
    private RoutineService routineService;

    @Autowired
    private NotificationController notificationController;
    @Autowired
    private NotificationService notificationService;


    @Autowired
    private AvatarDao avatarDao;
    @Autowired
    private UserDao userDao;

    @Autowired
	private BCryptPasswordEncoder passwordEncoder;


    private static final String PASSWORD = "12345";

    private AuthenticatedUserDto createAuthenticatedUser(String userName, RoleType roleType)
			throws IncorrectLoginException {
        Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, PASSWORD, "gimenez", "gimenez", "manoli@test.com", avatar.orElse(null));

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);

		userDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserName());
		loginParams.setPassword(PASSWORD);

		return userController.login(loginParams);

	}

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Test
    public void testGetNotifications() throws Exception {
        AuthenticatedUserDto follower = createAuthenticatedUser("manoli", RoleType.USER);
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword(PASSWORD);

        AuthenticatedUserDto trainer = userController.login(loginParams);

        userService.followUser(follower.getUserDto().getId(), trainer.getUserDto().getId());

        routineService.createRoutine(trainer.getUserDto().getId(),"Morning Routine", 
        new ArrayList<Long>(),(long) 120, true );

        this.mockMvc.perform(get("/api/notifications/getNotifications")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + follower.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testMarkNotificationAsRead() throws Exception {
        AuthenticatedUserDto follower = createAuthenticatedUser("manoli", RoleType.USER);
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword(PASSWORD);

        AuthenticatedUserDto trainer = userController.login(loginParams);

        userService.followUser(follower.getUserDto().getId(), trainer.getUserDto().getId());

        routineService.createRoutine(trainer.getUserDto().getId(),"Morning Routine", 
        new ArrayList<Long>(),(long) 120, true );

        List<Notification> notifications = notificationService.getAllNotifications(follower.getUserDto().getId(), PageRequest.of(0,10)).getItems();

        this.mockMvc.perform(post("/api/notifications/read/{id}", notifications.get(0).getId())
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + follower.getServiceToken()))
            .andExpect(status().isOk());

        // comprobar que está como leída
        assertEquals(true,notifications.get(0).getIsRead());
    }

    @Test
    public void testMarkNotificationAsUnread() throws Exception {
        AuthenticatedUserDto follower = createAuthenticatedUser("manoli", RoleType.USER);
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("trainer1");
        loginParams.setPassword(PASSWORD);

        AuthenticatedUserDto trainer = userController.login(loginParams);

        userService.followUser(follower.getUserDto().getId(), trainer.getUserDto().getId());

        routineService.createRoutine(trainer.getUserDto().getId(),"Morning Routine", 
        new ArrayList<Long>(),(long) 120, true );

        List<Notification> notifications = notificationService.getAllNotifications(follower.getUserDto().getId(), PageRequest.of(0,10)).getItems();

        this.mockMvc.perform(post("/api/notifications/read/{id}", notifications.get(0).getId())
            .content("")
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + follower.getServiceToken()))
            .andExpect(status().isOk());

        // comprobar que está como leída
        notifications = notificationService.getAllNotifications(follower.getUserDto().getId(), PageRequest.of(0,10)).getItems();
        assertEquals(true,notifications.get(0).getIsRead());

        this.mockMvc.perform(post("/api/notifications/unread/{id}", notifications.get(0).getId())
            .content("")
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + follower.getServiceToken()))
            .andExpect(status().isOk());

        // comprobar que está como no leída
        notifications = notificationService.getAllNotifications(follower.getUserDto().getId(), PageRequest.of(0,10)).getItems();
        assertEquals(false,notifications.get(0).getIsRead());
    }
}
