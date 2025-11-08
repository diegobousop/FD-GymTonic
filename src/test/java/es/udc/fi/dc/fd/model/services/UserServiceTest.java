package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import jakarta.transaction.Transactional;


import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.SelfBlockException;

import java.time.LocalDate;
import java.util.Optional;

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
	public void testBlockUser() throws SelfBlockException ,AlreadyBlockException, InstanceNotFoundException, PermissionException, DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.ADMIN, Gender.OTHER);
		userService.signUp(user, Users.RoleType.ADMIN);

		Users userTest = createUser("userTest", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(userTest, Users.RoleType.USER);

		userService.blockUser(user.getId(), userTest.getId());
		assertTrue(userTest.getBlocked());
	}

	@Test
	public void testBlockUserBlocked() throws SelfBlockException, AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.ADMIN, Gender.OTHER);
		userService.signUp(user, Users.RoleType.ADMIN);

		userService.blockUser(user.getId(), 1L);
		assertThrows(AlreadyBlockException.class, () -> {
			userService.blockUser(user.getId(), 1L);
		});
	}

	@Test 
	public void testBlockByUser() throws AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);

		Users userTest = createUser("userTest", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(userTest, Users.RoleType.USER);


		assertThrows(PermissionException.class, () -> {
			userService.blockUser(user.getId(), userTest.getId());
		});
	}

	@Test 
	public void testBlockNullUser() throws AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user", Users.RoleType.USER, Gender.OTHER);
		userService.signUp(user, Users.RoleType.USER);


		assertThrows(InstanceNotFoundException.class, () -> {
			userService.blockUser(user.getId(), 500L);
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
        assertEquals(3, result.getItems().size());
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

		assertEquals(user2.getFollowers().size(), 1);
		assertEquals(user2.getFollowers().get(0), user1);
		assertEquals(user1.getFollowing().size(), 1);
		assertEquals(user1.getFollowing().get(0), user2);

	}

	@Test
	public void testUnfollowUser() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
		Users user1 = createUser("manolo", Users.RoleType.USER, Gender.OTHER);
		Users user2 = createUser("entrenadoh", Users.RoleType.TRAINER, Gender.OTHER);
		userService.signUp(user1, Users.RoleType.USER);
		userService.signUp(user2, Users.RoleType.TRAINER);

		assertTrue(userService.followUser(user1.getId(), user2.getId()));
		assertEquals(user2.getFollowers().size(), 1);
		assertEquals(user2.getFollowers().get(0), user1);
		assertEquals(user1.getFollowing().size(), 1);
		assertEquals(user1.getFollowing().get(0), user2);

		assertTrue(userService.unfollowUser(user1.getId(), user2.getId()));

		assertEquals(user2.getFollowers().size(), 0);
		assertEquals(user1.getFollowing().size(), 0);
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
	public void testGetFollowersCountNoUser() throws DuplicateInstanceException {
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
		userService.blockUser(admin.getId(), user2.getId());

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

		
		userService.blockUser(admin.getId(), follower.getId());
		
		
		blocker = userService.getUserById(blocker.getId());
		boolean containsFollower = blocker.getFollowers() != null && 
			blocker.getFollowers().stream().anyMatch(u -> u.getId().equals(follower.getId()));
		assertFalse(containsFollower);
		assertEquals(0, userService.getFollowersCount(blocker.getId()));
	}
}
