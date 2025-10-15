package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

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
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;


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

	/**
	 * Creates the user.
	 *
	 * @param userName the user name
	 * @return the user
	 */
	private Users createUser(String userName) {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		return new Users(userName, "password", "firstName", "lastName", userName + "@" + userName + ".com", avatar.orElse(null));
	}

	/**
	 * Test sign up and login from id.
	 *
	 * @throws DuplicateInstanceException the duplicate instance exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 */
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = createUser("user");

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

		Users user = createUser("user");

		userService.signUp(user, Users.RoleType.USER);

		assertEquals("firstName",user.getFirstName());
		assertEquals( "lastName",user.getLastName());
		assertEquals("user@user.com",user.getEmail());

		userService.updateProfile(user.getId(),"prueba", "pruebez","prueba@pruebez.com", "messy");

		assertEquals("prueba",user.getFirstName());
		assertEquals( "pruebez",user.getLastName());
		assertEquals("prueba@pruebez.com",user.getEmail());
		assertEquals("messy",user.getAvatar().getName());

		assertThrows(InstanceNotFoundException.class, () -> userService.updateProfile(user.getId()+1, "fallo","fallez","fallo@fallez.com", "messy987"));
	}

    @Test
    public void testChangePassword() throws DuplicateInstanceException, InstanceNotFoundException, IncorrectPasswordException, IncorrectLoginException {

        Users user = createUser("userChange");
        userService.signUp(user, Users.RoleType.USER);

        Users loggedInUser = userService.loginFromId(user.getId());
        assertEquals(user, loggedInUser);

        String newPassword = "Changed";
        userService.changePassword(user.getId(), "password", newPassword);

        Assertions.assertThrows(IncorrectLoginException.class, () -> {
            userService.login(user.getUserName(), "password");
        });

        Users loggedInWithNew = userService.login(user.getUserName(), newPassword);
        assertEquals(user, loggedInWithNew);
    }
	@Test
	public void testGetUserbyId() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.USER);
		assertEquals(user.getUserName(), userService.getUserById(user.getId()).getUserName());

	}

	@Test
	public void FailedTestGetUserbyId() throws DuplicateInstanceException, InstanceNotFoundException {
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.USER);
		assertThrows(InstanceNotFoundException.class, () -> {userService.getUserById(user.getId()+1);});

	}

	@Test
	public void testBlockUser() throws AlreadyBlockException, InstanceNotFoundException, PermissionException, DuplicateInstanceException{
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.ADMIN);

		userService.blockUser(user.getId(), 1L);
		assertTrue(userService.checkUserIsBlocked(user.getId(), 1L));
	}

	@Test
	public void testBlockUserBlocked() throws AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.ADMIN);

		userService.blockUser(user.getId(), 1L);
		assertThrows(AlreadyBlockException.class, () -> {
			userService.blockUser(user.getId(), 1L);
		});
	}

	@Test 
	public void testBlockByUser() throws AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.USER);


		assertThrows(PermissionException.class, () -> {
			userService.blockUser(user.getId(), 1L);
		});
	}

	@Test 
	public void testBlockNullUser() throws AlreadyBlockException, InstanceNotFoundException, PermissionException,DuplicateInstanceException{
		Users user = createUser("user");
		userService.signUp(user, Users.RoleType.USER);


		assertThrows(InstanceNotFoundException.class, () -> {
			userService.blockUser(user.getId(), 500L);
		});
	}

}
