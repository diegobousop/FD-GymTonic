package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.BlockUserDao;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.FollowRequest;
import es.udc.fi.dc.fd.model.entities.FollowRequestDao;
import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.SerieDao;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.TrainingDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.SelfBlockException;
import jakarta.transaction.Transactional;

/**
 * The Class UserServiceTest.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

	/** The user service. */
	@Autowired
	private UserService userService;

	@Autowired
	private AvatarDao avatarDao;


	@Autowired
	private BlockUserDao blockUserDao;

	@Autowired
	private FollowRequestDao followRequestDao;

	@Autowired
	private TrainingDao trainingDao;

	@Autowired
	private SerieDao serieDao;

	@Autowired
	private ExerciseDao exerciseDao;

	private static final String PASSWORD = "12345";

	/**
	 * Creates the user.
	 *
	 * @param userName the user name
	 * @return the user
	 */
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

	/**
	 * Test sign up and login from id.
	 *
	 * @throws DuplicateInstanceException the duplicate instance exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 */
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);

		userService.signUp(user, Users.RoleType.USER);

		Users loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals(Users.RoleType.USER, user.getRole());

	}


	/**
	 * Test updating the profile.
	 *
	 * @throws InstanceNotFoundException  the instance not found exception
	 */
	@Test
	public void testUpdateProfile() throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);

		userService.signUp(user, Users.RoleType.USER);

		assertEquals("firstName",user.getFirstName());
		assertEquals( "lastName",user.getLastName());
		assertEquals("user@user.com",user.getEmail());

		userService.updateProfile(user.getId(),"prueba", "pruebez","prueba@pruebez.com", "messy", "1234567890123456",
		 180, 75.5f, "MALE","10-02-1990");

		assertEquals("prueba",user.getFirstName());
		assertEquals( "pruebez",user.getLastName());
		assertEquals("prueba@pruebez.com",user.getEmail());
		assertEquals("messy",user.getAvatar().getName());

		assertThrows(InstanceNotFoundException.class, () -> userService.updateProfile(user.getId()+1, "fallo","fallez","fallo@fallez.com", "messy987", "1234567890123456",
		 180, 75, "MALE","1990-05-15"));
	}

	public void testUpdateProfileChangePremium() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);

		user = userService.updateProfile(user.getId(),"prueba", "pruebez","prueba@pruebez.com", "messy", "1234567890123456",
		 180, 75.5f, "MALE","1990-05-15");

		assertTrue(user.getPremium());

	}

    @Test
    public void testChangePassword() throws LoginUserBlockedException ,DuplicateInstanceException, InstanceNotFoundException, IncorrectPasswordException, IncorrectLoginException {

        Users user = createUser("userChange", Users.RoleType.USER, Gender.OTHER);
        userService.signUp(user, Users.RoleType.USER);

        Users loggedInUser = userService.loginFromId(user.getId());
        assertEquals(user, loggedInUser);

        String newPassword = "Changed";
        userService.changePassword(user.getId(), PASSWORD, newPassword);

        Assertions.assertThrows(IncorrectLoginException.class, () -> {
            userService.login(user.getUserName(), PASSWORD);
        });

        Users loggedInWithNew = userService.login(user.getUserName(), newPassword);
        assertEquals(user, loggedInWithNew);
    }
	@Test
	public void testGetUserbyId() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);
		assertEquals(user.getUserName(), userService.getUserById(user.getId()).getUserName());

	}

	@Test
	public void FailedTestGetUserbyId() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);
		assertThrows(InstanceNotFoundException.class, () -> {userService.getUserById(user.getId()+1);});

	}

	@Test

	public void testBanUser() throws SelfBlockException ,AlreadyBlockException, InstanceNotFoundException, PermissionException, DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.ADMIN, Gender.OTHER);

		userService.signUp(user, Users.RoleType.ADMIN);

		Users userTest = createUser("userTest", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(userTest, Users.RoleType.USER);

		userService.banUser(user.getId(), userTest.getId());
		assertTrue(userTest.getBanned());
	}

	@Test
	public void testBanUserBlocked() throws SelfBlockException, AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.ADMIN, Gender.OTHER);
		userService.signUp(user, Users.RoleType.ADMIN);

		userService.banUser(user.getId(), 1L);
		assertThrows(AlreadyBlockException.class, () -> {
			userService.banUser(user.getId(), 1L);
		});
	}

	@Test 
	public void testBanByUser() throws InstanceNotFoundException, DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);

		Users userTest = createUser("userTest", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(userTest, Users.RoleType.USER);


		assertThrows(PermissionException.class, () -> {
			userService.banUser(user.getId(), userTest.getId());
		});
	}

	@Test 
	public void testBanNullUser() throws InstanceNotFoundException, DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);


		assertThrows(InstanceNotFoundException.class, () -> {
			userService.banUser(user.getId(), 500L);
		});
	}

	@Test
	public void testGetAllUser() {

		Avatar avatar = new Avatar();

        Users admin = new Users("admin1", "pass", "Admin", "User", "admin1@admin.com", avatar);
        admin.setId(1L);
        admin.setRole(RoleType.ADMIN);

        Users trainer = new Users("trainer1", "pass", "Trainer", "User", "trainer1@trainer.com", avatar);
        trainer.setId(2L);
        trainer.setRole(RoleType.TRAINER);

        Users user = new Users("user1", "pass", "User", "User", "User1@user.com", avatar);
        user.setId(3L);
        user.setRole(RoleType.USER);

		Block<Users> result = userService.getAllUser(0, 5);

		assertNotNull(result);
        assertEquals(4, result.getItems().size());
        assertEquals("admin1", result.getItems().get(0).getUserName());
        assertEquals(RoleType.ADMIN, result.getItems().get(0).getRole());
        assertEquals("trainer1", result.getItems().get(1).getUserName());
        assertEquals(RoleType.TRAINER, result.getItems().get(1).getRole());
        assertEquals("user1", result.getItems().get(2).getUserName());
        assertEquals(RoleType.USER, result.getItems().get(2).getRole());
	}

	@Test
	public void testFollowUser() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));

		assertEquals(1, user2.getFollowers().size());
		assertEquals(user2.getFollowers().get(0), user1);
		assertEquals(1, user1.getFollowing().size());
		assertEquals(user1.getFollowing().get(0), user2);

	}

	@Test
	public void testUnfollowUser() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertEquals(1, user2.getFollowers().size());
		assertEquals(user2.getFollowers().get(0), user1);
		assertEquals(1, user1.getFollowing().size());
		assertEquals(user1.getFollowing().get(0), user2);

		assertTrue(userService.unfollowUser(user1.getId(), user2.getId()));

		assertEquals(0, user2.getFollowers().size());
		assertEquals(0, user1.getFollowing().size());
	}

	@Test
	public void testFollowAlreadyFollowing() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertFalse(userService.followUser(user1.getId(), user2.getId()));

	}

	@Test
	public void testUnfollowAlreadyFollowing() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));

		assertTrue(userService.unfollowUser(user1.getId(), user2.getId()));
		assertFalse(userService.unfollowUser(user1.getId(), user2.getId()));

	}

	@Test
	public void testGetFollowers() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertFalse(userService.followUser(user1.getId(), user2.getId()));

		Block<Users> followers = userService.getFollowers(user2.getId(), 0,5);

		assertEquals(user1, followers.getItems().get(0));

	}

	@Test
	public void testGetFollowing() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertFalse(userService.followUser(user1.getId(), user2.getId()));

		Block<Users> following = userService.getFollowing(user1.getId(), 0,5);

		assertEquals(user2, following.getItems().get(0));
	}


	@Test 
	public void testBlockUser() throws AlreadyBlockException, SelfBlockException, PermissionException, InstanceNotFoundException{
		userService.blockUser(2L, 3L);
		assertTrue(blockUserDao.existsByIdBlockerAndIdBlocked(2L, 3L));
	}

	@Test
	public void testCheckFollowesAfterBlock() throws DuplicateInstanceException, AlreadyBlockException, SelfBlockException, PermissionException, InstanceNotFoundException{
		Users user1 = createUser("manolo", RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", RoleType.USER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);
		if(userService.followUser(user1.getId(), user2.getId())){
			userService.blockUser(user1.getId(), user2.getId());
			assertEquals(0, user2.getFollowers().size());
			assertEquals(0, user1.getFollowing().size());
		}else{
            fail();
		}
}

	@Test
	public void testGetFollowersCount() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {

		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		// Sin seguidores
		assertEquals(0, userService.getFollowersCount(user2.getId()));

		// Agregar seguidores
		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertEquals(1, userService.getFollowersCount(user2.getId()));

		// Agregar otro seguidor
		Users user3 = createUser("user3", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user3, Users.RoleType.USER);
		assertTrue(userService.followUser(user3.getId(), user2.getId()));
		assertEquals(2, userService.getFollowersCount(user2.getId()));

	}

	@Test
	public void testGetFollowersCountNoUser() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);

		assertThrows(InstanceNotFoundException.class, () -> {
			userService.getFollowersCount(user.getId() + 999);
		});
	}

	@Test
	public void testFollowAdminAsNonAdmin() throws DuplicateInstanceException, InstanceNotFoundException {
		Users admin = createUser("admin", Users.RoleType.ADMIN, Gender.OTHER);
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(admin, Users.RoleType.ADMIN);
		userService.signUp(user, Users.RoleType.USER);

		assertThrows(PermissionException.class, () -> {
			userService.followUser(user.getId(), admin.getId());
		});
	}

	@Test
	public void testFollowAdminAsAdmin() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users admin1 = createUser("admin1Follow" + System.currentTimeMillis(), Users.RoleType.ADMIN, Gender.OTHER);
		Users admin2 = createUser("admin2Follow" + System.currentTimeMillis(), Users.RoleType.ADMIN, Gender.OTHER);
		userService.signUp(admin1, Users.RoleType.ADMIN);
		userService.signUp(admin2, Users.RoleType.ADMIN);

		// Admin puede seguir a otro admin
		assertTrue(userService.followUser(admin1.getId(), admin2.getId()));
		assertEquals(1, admin2.getFollowers().size());
		assertEquals(admin1, admin2.getFollowers().get(0));
	}

	@Test
	public void testFollowBlockedUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException, AlreadyBlockException, SelfBlockException {
		Users admin = createUser("adminBlock" + System.currentTimeMillis(), Users.RoleType.ADMIN, Gender.OTHER);
		Users user1 = createUser("user1Block" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("user2Block" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(admin, Users.RoleType.ADMIN);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.USER);

		// user1 sigue a user2
		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertEquals(1, userService.getFollowersCount(user2.getId()));

		// Admin bloquea a user2
		userService.banUser(admin.getId(), user2.getId());

		userService.unfollowUser(user1.getId(), user2.getId());

		// Intentar seguir a un usuario bloqueado debe fallar
		assertThrows(PermissionException.class, () -> {
			userService.followUser(user1.getId(), user2.getId());
		});
	}

	@Test
	public void testBlockUserRemovesFromFollowers() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException, AlreadyBlockException, SelfBlockException {
		Users admin = createUser("adminRemove" + System.currentTimeMillis(), Users.RoleType.ADMIN, Gender.OTHER);
		Users blocker = createUser("blockerRemove" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users follower = createUser("followerRemove" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(admin, Users.RoleType.ADMIN);
		userService.signUp(blocker, Users.RoleType.USER);
		userService.signUp(follower, Users.RoleType.USER);

		
		assertTrue(userService.followUser(follower.getId(), blocker.getId()));
		
		blocker = userService.getUserById(blocker.getId());
		assertEquals(1, userService.getFollowersCount(blocker.getId()));
		assertTrue(blocker.getFollowers().stream().anyMatch(u -> u.getId().equals(follower.getId())));

		
		userService.banUser(admin.getId(), follower.getId());
		
		
		blocker = userService.getUserById(blocker.getId());
		boolean containsFollower = blocker.getFollowers() != null && 
			blocker.getFollowers().stream().anyMatch(u -> u.getId().equals(follower.getId()));
		assertFalse(containsFollower);
		assertEquals(0, userService.getFollowersCount(blocker.getId()));
	}
	@Test
	public void testSendFollowRequestOk() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);

		FollowRequest followRequest=userService.sendFollowRequest(sender.getId(), receiver.getId());
		assertEquals(followRequest,followRequestDao.findBySenderIdAndReceiverId(sender.getId(), receiver.getId()).get());

	}
	@Test
	public void testSendFollowRequestFailed() throws DuplicateInstanceException, InstanceNotFoundException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);
		assertThrows(PermissionException.class, () -> {
			userService.sendFollowRequest(sender.getId(), sender.getId());
		});
	}
	@Test
	public void testSendFollowRequestFailedNull() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);
		FollowRequest followRequest=userService.sendFollowRequest(sender.getId(), receiver.getId());
		assertEquals(followRequest,followRequestDao.findBySenderIdAndReceiverId(sender.getId(), receiver.getId()).get());
		FollowRequest followRequest2=userService.sendFollowRequest(sender.getId(), receiver.getId());
        assertNull(followRequest2);
	}
	@Test
	public void testacceptFollowRequestOk() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException{
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);

		FollowRequest followRequest=userService.sendFollowRequest(sender.getId(), receiver.getId());
		assertEquals(followRequest,followRequestDao.findBySenderIdAndReceiverId(sender.getId(), receiver.getId()).get());
		boolean aux=userService.acceptFollowRequest(followRequest.getId());
		assertTrue(aux);
	}

	@Test
	public void testacceptFollowRequestFailed() throws DuplicateInstanceException, InstanceNotFoundException{
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);

		assertThrows(InstanceNotFoundException.class, () -> {userService.acceptFollowRequest(300L);});
	}
	@Test
	public void  rejectFollowRequestOk() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);

		FollowRequest followRequest=userService.sendFollowRequest(sender.getId(), receiver.getId());
		assertEquals(followRequest,followRequestDao.findBySenderIdAndReceiverId(sender.getId(), receiver.getId()).get());
		userService.rejectFollowRequest(followRequest.getId());
		assertFalse(followRequestDao.existsBySenderIdAndReceiverId(sender.getId(), receiver.getId()));
	}

	@Test
	public void  rejectFollowRequestFailed() throws DuplicateInstanceException, InstanceNotFoundException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);

		userService.signUp(sender, Users.RoleType.USER);

		assertThrows(InstanceNotFoundException.class, () -> {userService.rejectFollowRequest(300L);});
	}
	@Test
	public void getFollowRequests_Ok() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users sender = createUser("UserPrueba1" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(sender, Users.RoleType.USER);
		userService.signUp(receiver, Users.RoleType.USER);

		FollowRequest followRequest=userService.sendFollowRequest(sender.getId(), receiver.getId());
		assertEquals(followRequest,followRequestDao.findBySenderIdAndReceiverId(sender.getId(), receiver.getId()).get());
		assertEquals(followRequest,userService.getFollowRequests(receiver.getId()).get(0));
	}
	@Test
	public void getFollowRequests_FailedTest() {
		Users receiver = createUser("UserPrueba2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		assertThrows(InstanceNotFoundException.class, () ->{userService.getFollowRequests(receiver.getId());});

	}

	@Test
	public void testGetExerciseStats() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users profileUser = createUser("profileUser" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users requesterUser = createUser("requesterUser" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(profileUser, Users.RoleType.USER);
		userService.signUp(requesterUser, Users.RoleType.USER);

		userService.followUser(requesterUser.getId(), profileUser.getId());

		Exercise exercise = new Exercise("Bench Press", "Chest exercise", Exercise.grupoMuscular.PECHO, 3);
		exerciseDao.save(exercise);

		LocalDateTime now = LocalDateTime.now();
		Training training = new Training("Training 1", "Desc", now, true, profileUser, 60L);
		trainingDao.save(training);

		Serie serie = new Serie(10, 100, 1);
		serie.setExercise(exercise);
		serie.setTraining(training);
		serieDao.save(serie);

		Map<Serie, LocalDate> stats = userService.getExerciseStats(profileUser.getId(), requesterUser.getId(), 0, "YEAR");

		assertNotNull(stats);
		assertFalse(stats.isEmpty());
		assertTrue(stats.containsKey(serie));
		assertEquals(now.toLocalDate(), stats.get(serie));
	}

	@Test
	public void testGetExerciseStatsPermissionDenied() throws DuplicateInstanceException, InstanceNotFoundException {
		Users profileUser = createUser("profileUser2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		Users requesterUser = createUser("requesterUser2" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(profileUser, Users.RoleType.USER);
		userService.signUp(requesterUser, Users.RoleType.USER);

		assertThrows(PermissionException.class, () -> {
			userService.getExerciseStats(profileUser.getId(), requesterUser.getId(), 0, "YEAR");
		});
	}

	@Test
	public void testGetExerciseStatsWithPeriod() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users profileUser = createUser("profileUser3" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(profileUser, Users.RoleType.USER);

		Exercise exercise = new Exercise("Squat", "Leg exercise", Exercise.grupoMuscular.PIERNA, 3);
		exerciseDao.save(exercise);

		LocalDateTime now = LocalDateTime.now();
		Training training = new Training("Training 2", "Desc", now, true, profileUser, 60L);
		trainingDao.save(training);

		Serie serie = new Serie(12, 120, 1);
		serie.setExercise(exercise);
		serie.setTraining(training);
		serieDao.save(serie);

		Map<Serie, LocalDate> stats = userService.getExerciseStats(profileUser.getId(), profileUser.getId(), 0, "MONTH");

		assertNotNull(stats);
		assertFalse(stats.isEmpty());
		assertTrue(stats.containsKey(serie));
	}

	@Test
	public void testGetExerciseStatsWeek() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users profileUser = createUser("profileUserWeek" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(profileUser, Users.RoleType.USER);

		Exercise exercise = new Exercise("Deadlift", "Back exercise", Exercise.grupoMuscular.ESPALDA, 3);
		exerciseDao.save(exercise);

		// Training within the week
		LocalDateTime now = LocalDateTime.now();
		Training trainingRecent = new Training("Training Recent", "Desc", now, true, profileUser, 60L);
		trainingDao.save(trainingRecent);

		Serie serieRecent = new Serie(5, 150, 1);
		serieRecent.setExercise(exercise);
		serieRecent.setTraining(trainingRecent);
		serieDao.save(serieRecent);

		// Training older than a week (e.g., 2 weeks ago)
		LocalDateTime oldDate = now.minusWeeks(2);
		Training trainingOld = new Training("Training Old", "Desc", oldDate, true, profileUser, 60L);
		trainingDao.save(trainingOld);

		Serie serieOld = new Serie(5, 150, 1);
		serieOld.setExercise(exercise);
		serieOld.setTraining(trainingOld);
		serieDao.save(serieOld);

		Map<Serie, LocalDate> stats = userService.getExerciseStats(profileUser.getId(), profileUser.getId(), 0, "WEEK");

		assertNotNull(stats);
		assertEquals(1, stats.size());
		assertTrue(stats.containsKey(serieRecent));
		assertFalse(stats.containsKey(serieOld));
	}

	@Test
	public void testGetExerciseStatsSignificantData() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
		Users profileUser = createUser("profileUserSig" + System.currentTimeMillis(), Users.RoleType.USER, Gender.OTHER);
		userService.signUp(profileUser, Users.RoleType.USER);

		Exercise exercise = new Exercise("Pull Up", "Back exercise", Exercise.grupoMuscular.ESPALDA, 3);
		exerciseDao.save(exercise);

		LocalDateTime now = LocalDateTime.now();
		Training training = new Training("Training Sig", "Desc", now, true, profileUser, 60L);
		trainingDao.save(training);

		// Serie with enough reps (e.g., 10)
		Serie serieHighReps = new Serie(10, 0, 1);
		serieHighReps.setExercise(exercise);
		serieHighReps.setTraining(training);
		serieDao.save(serieHighReps);

		// Serie with low reps (e.g., 5)
		Serie serieLowReps = new Serie(5, 0, 2);
		serieLowReps.setExercise(exercise);
		serieLowReps.setTraining(training);
		serieDao.save(serieLowReps);

		// Request stats with numReps = 10
		Map<Serie, LocalDate> stats = userService.getExerciseStats(profileUser.getId(), profileUser.getId(), 10, "YEAR");

		assertNotNull(stats);
		assertEquals(1, stats.size());
		assertTrue(stats.containsKey(serieHighReps));
		assertFalse(stats.containsKey(serieLowReps));
	}
}
