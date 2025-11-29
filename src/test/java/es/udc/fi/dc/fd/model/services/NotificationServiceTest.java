package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;

import java.time.Duration;
import static org.awaitility.Awaitility.await;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

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
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
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

    private final String PASSWORD = "12345";
    private final String TRAINER_USERNAME = "trainer1";

	private Users createUser(String userName, RoleType role, Gender gender) {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user =  new Users(userName, PASSWORD, "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
        user.setRole(role);
        user.setGender(gender);
        user.setHeight(190);
        user.setWeight(80);
        user.setBirthDate(LocalDate.now());
		return user;
	}


    private Routine createRoutine(String name, Users creator) {
        return new Routine(name, new ArrayList<RoutineExercise>(), creator,(long) 90, LocalDateTime.now().withNano(0), true);
    }


    @Test
    public void testNotifyFollowers() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo", RoleType.TRAINER, Gender.MALE);
        userService.signUp(user1, RoleType.TRAINER);

        Users user2 = createUser("pepe", RoleType.USER, Gender.OTHER);
        userService.signUp(user2, RoleType.USER);

        Users user3 = createUser("mariloli", RoleType.USER, Gender.FEMALE);
        userService.signUp(user3, RoleType.USER);

        Users trainer1 = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Test", trainer1);

        userService.followUser(user1.getId(), trainer1.getId());
        userService.followUser(user2.getId(), trainer1.getId());

        routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        Block<Notification> notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        Block<Notification> notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assertEquals(1, notificationsUser1.getItems().size());
        assertEquals(1, notificationsUser2.getItems().size());
        assertEquals(0, notificationsUser3.getItems().size());
    }   

    @Test
    public void testMarkAsReadAndUnread() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo", RoleType.TRAINER, Gender.MALE);
        userService.signUp(user1, RoleType.TRAINER);

        Users trainer1 = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Test", trainer1);

        userService.followUser(user1.getId(), trainer1.getId());

        routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        assertEquals(1, notificationsUser1.getItems().size());
        Notification notification = notificationsUser1.getItems().get(0);
        assertEquals(false, notification.getIsRead());

        notification = notificationService.markAsRead(notification.getId());
        assertEquals(true, notification.getIsRead());

        notification = notificationService.markAsUnread(notification.getId());
        assertEquals(false, notification.getIsRead());
    }

        @Test
    public void testNotifyFollowersByModifyingRoutine() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo", RoleType.TRAINER, Gender.MALE);
        userService.signUp(user1, RoleType.TRAINER);

        Users user2 = createUser("pepe", RoleType.USER, Gender.MALE);
        userService.signUp(user2, RoleType.USER);

        Users user3 = createUser("mariloli", RoleType.USER, Gender.FEMALE);
        userService.signUp(user3, RoleType.USER);

        Users trainer1 = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Test", trainer1);
        routine.setIsPublic(false);

        userService.followUser(user1.getId(), trainer1.getId());
        userService.followUser(user2.getId(), trainer1.getId());

        routine = routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());

        PageRequest pageable = PageRequest.of(0, 10);

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        Block<Notification> notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        Block<Notification> notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assertEquals(0, notificationsUser1.getItems().size());
        assertEquals(0, notificationsUser2.getItems().size());
        assertEquals(0, notificationsUser3.getItems().size());

        routineService.modifyRoutine(routine.getId(), trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);

        notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        notificationsUser2 = notificationService.getAllNotifications(user2.getId(),  pageable);
        notificationsUser3 = notificationService.getAllNotifications(user3.getId(),  pageable);
        assertEquals(1, notificationsUser1.getItems().size());
        assertEquals(1, notificationsUser2.getItems().size());
        assertEquals(0, notificationsUser3.getItems().size());
    }  

    @Test
    public void testNotifyRoutineLike() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user = createUser("testUser1", RoleType.USER, Gender.MALE);
        userService.signUp(user, RoleType.USER);

        Users trainer = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Like Test", trainer);
        routine = routineService.createRoutine(trainer.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);

        PageRequest pageable = PageRequest.of(0, 10);

        // Simular que el usuario da like a la rutina
        notificationService.notifyRoutineLike(user.getId(), routine);

        // Verificar que el entrenador recibe la notificación
        Block<Notification> notificationsTrainer = notificationService.getAllNotifications(trainer.getId(), pageable);
        assertEquals(1, notificationsTrainer.getItems().size());
        
        Notification notification = notificationsTrainer.getItems().get(0);
        assertEquals(trainer.getId(), notification.getReceiver().getId());
        assertEquals(user.getId(), notification.getSender().getId());
        assertEquals(routine.getId(), notification.getRoutine().getId());
        assertEquals(user.getUserName() + " le dio like a tu rutina: " + routine.getName(), notification.getMessage());
    }

    @Test
    public void testNotifyRoutineFollow() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user = createUser("testUser1", RoleType.USER, Gender.FEMALE);
        userService.signUp(user, RoleType.USER);

        Users trainer = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Follow Test", trainer);
        routine = routineService.createRoutine(trainer.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), true);

        PageRequest pageable = PageRequest.of(0, 10);

        // Simular que el usuario sigue la rutina
        notificationService.notifyRoutineFollow(user.getId(), routine);

        // Verificar que el entrenador recibe la notificación
        Block<Notification> notificationsTrainer = notificationService.getAllNotifications(trainer.getId(), pageable);
        assertEquals(1, notificationsTrainer.getItems().size());
        
        Notification notification = notificationsTrainer.getItems().get(0);
        assertEquals(trainer.getId(), notification.getReceiver().getId());
        assertEquals(user.getId(), notification.getSender().getId());
        assertEquals(routine.getId(), notification.getRoutine().getId());
        assertEquals(user.getUserName() + " empezó a seguir tu rutina: " + routine.getName() , notification.getMessage());
    }

    @Test
    public void testNotifyNewFollower() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException {
        Users follower = createUser("follower1", RoleType.USER, Gender.OTHER);
        userService.signUp(follower, RoleType.USER);

        Users trainer = userService.login(TRAINER_USERNAME, PASSWORD);

        PageRequest pageable = PageRequest.of(0, 10);

        // Simular que el usuario sigue al entrenador
        notificationService.notifyNewFollower(follower.getId(), trainer.getId());

        // Verificar que el entrenador recibe la notificación
        Block<Notification> notificationsTrainer = notificationService.getAllNotifications(trainer.getId(), pageable);
        assertEquals(1, notificationsTrainer.getItems().size());
        
        Notification notification = notificationsTrainer.getItems().get(0);
        assertEquals(trainer.getId(), notification.getReceiver().getId());
        assertEquals(follower.getId(), notification.getSender().getId());
        assertEquals(null, notification.getRoutine());
        assertEquals(follower.getUserName() + " empezó a seguirte", notification.getMessage());
    }

    @Test
    public void testNotifyFollowRequest() throws DuplicateInstanceException,
     InstanceNotFoundException {
        Users sender = createUser("sender1", RoleType.USER, Gender.MALE);
        userService.signUp(sender, RoleType.USER);

        Users receiver = createUser("receiver1", RoleType.USER, Gender.FEMALE);
        userService.signUp(receiver, RoleType.USER);

        PageRequest pageable = PageRequest.of(0, 10);

        // Simular que sender envía solicitud a receiver
        notificationService.notifyFollowRequest(sender.getId(), receiver.getId());

        // Verificar que el receiver recibe la notificación
        Block<Notification> notificationsReceiver = notificationService.getAllNotifications(receiver.getId(), pageable);
        assertEquals(1, notificationsReceiver.getItems().size());
        
        Notification notification = notificationsReceiver.getItems().get(0);
        assertEquals(receiver.getId(), notification.getReceiver().getId());
        assertEquals(sender.getId(), notification.getSender().getId());
        assertEquals(null, notification.getRoutine());
        assertEquals(sender.getUserName() + " quiere seguirte", notification.getMessage());
    }

    @Test 
    public void testNotifyLikeRoutine() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException {
        Users user1 = createUser("manolo", RoleType.USER, Gender.MALE);
        userService.signUp(user1, RoleType.USER);
        
        Users trainer1 = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Test", trainer1);

        routine = routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());
        routineService.likeRoutine(user1.getId(), routine.getId());
    }

    @Test
    public void testGetDifferentNotifications() throws LoginUserBlockedException, DuplicateInstanceException, IncorrectLoginException,
     InstanceNotFoundException, InvalidRoutineNameException, InvalidRoutineDurationException, PermissionException, RoutineLimitReachedException, RoutineExerciseLimitReachedException, InterruptedException {
        Users user1 = createUser("manolo", RoleType.USER, Gender.MALE);
        userService.signUp(user1, RoleType.USER);
     
        Users trainer1 = userService.login(TRAINER_USERNAME, PASSWORD);
        Routine routine = createRoutine("Rutina Test", trainer1);

        userService.followUser(user1.getId(), trainer1.getId());
        await().pollDelay(Duration.ofSeconds(1)).until(() -> true);
        routine = routineService.createRoutine(trainer1.getId(), routine.getName(), new ArrayList<Long>(), routine.getDuration(), routine.getIsPublic());
        await().pollDelay(Duration.ofSeconds(1)).until(() -> true);
        routineService.likeRoutine(user1.getId(), routine.getId());
        await().pollDelay(Duration.ofSeconds(1)).until(() -> true);
        routineService.followRoutine(user1.getId(), routine.getId());

        PageRequest pageable = PageRequest.of(0, 10);
        Block<Notification> notificationsTrainer1 = notificationService.getAllNotifications(trainer1.getId(),  pageable);
        assertEquals(3, notificationsTrainer1.getItems().size());
        assertEquals("manolo empezó a seguir tu rutina: Rutina Test", notificationsTrainer1.getItems().get(0).getMessage());
        assertEquals("manolo le dio like a tu rutina: Rutina Test", notificationsTrainer1.getItems().get(1).getMessage());
        assertEquals("manolo empezó a seguirte", notificationsTrainer1.getItems().get(2).getMessage());

        Block<Notification> notificationsUser1 = notificationService.getAllNotifications(user1.getId(),  pageable);
        assertEquals(1, notificationsUser1.getItems().size());
        assertEquals("Nueva rutina: 'Rutina Test', añadida por trainer1", notificationsUser1.getItems().get(0).getMessage());

    }


}
