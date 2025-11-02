package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.h2.mvstore.Page;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineDurationException;
import es.udc.fi.dc.fd.model.services.exceptions.InvalidRoutineNameException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineExerciseLimitReachedException;
import es.udc.fi.dc.fd.model.services.exceptions.RoutineLimitReachedException;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class NotificationServiceTest {

    @Autowired 
    private NotificationService notificationService;
    @Autowired
    private RoutineService routineService;
    @Autowired
    private UserService userService;
    @Autowired
    private AvatarDao avatarDao;

    private Users createUser(String userName) {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        return new Users(userName, "12345", "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
    }

    private Routine createRoutine(String name, Users creator) {
        return new Routine(name, new ArrayList<Exercise>(), creator,(long) 90, LocalDateTime.now().withNano(0), true);
    }


    @Test
    public void testNotifyFollowers() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo");
        userService.signUp(user1, RoleType.TRAINER);

        Users user2 = createUser("pepe");
        userService.signUp(user2, RoleType.USER);

        Users user3 = createUser("mariloli");
        userService.signUp(user3, RoleType.USER);

        Users trainer1 = userService.login("trainer1", "12345");
        Routine routine = createRoutine("Rutina Test", trainer1);

        userService.followUser(user1.getId(), trainer1.getId());
        userService.followUser(user2.getId(), trainer1.getId());

        routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        Block<Notification> notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        Block<Notification> notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assert(notificationsUser1.getItems().size() == 1);
        assert(notificationsUser2.getItems().size() == 1);
        assert(notificationsUser3.getItems().size() == 0);
    }   

    @Test
    public void testMarkAsReadAndUnread() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo");
        userService.signUp(user1, RoleType.TRAINER);

        Users trainer1 = userService.login("trainer1", "12345");
        Routine routine = createRoutine("Rutina Test", trainer1);

        userService.followUser(user1.getId(), trainer1.getId());

        routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        assert(notificationsUser1.getItems().size() == 1);
        Notification notification = notificationsUser1.getItems().get(0);
        assert(!notification.getIsRead());

        notification = notificationService.markAsRead(notification.getId());
        assert(notification.getIsRead());

        notification = notificationService.markAsUnread(notification.getId());
        assert(!notification.getIsRead());
    }

        @Test
    public void testNotifyFollowersByModifyingRoutine() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo");
        userService.signUp(user1, RoleType.TRAINER);

        Users user2 = createUser("pepe");
        userService.signUp(user2, RoleType.USER);

        Users user3 = createUser("mariloli");
        userService.signUp(user3, RoleType.USER);

        Users trainer1 = userService.login("trainer1", "12345");
        Routine routine = createRoutine("Rutina Test", trainer1);
        routine.setIsPublic(false);

        userService.followUser(user1.getId(), trainer1.getId());
        userService.followUser(user2.getId(), trainer1.getId());

        routine = routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        Block<Notification> notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        Block<Notification> notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assert(notificationsUser1.getItems().size() == 0);
        assert(notificationsUser2.getItems().size() == 0);
        assert(notificationsUser3.getItems().size() == 0);

        routineService.modifyRoutine(routine.getId(), trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);

        notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assert(notificationsUser1.getItems().size() == 1);
        assert(notificationsUser2.getItems().size() == 1);
        assert(notificationsUser3.getItems().size() == 0);
    }  

}
