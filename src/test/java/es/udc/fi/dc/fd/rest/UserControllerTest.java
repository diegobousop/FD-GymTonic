package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import es.udc.fi.dc.fd.rest.dtos.UserDto;
import es.udc.fi.dc.fd.rest.dtos.UserRegisterParamsDto;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ChangePasswordParamsDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.AvatarDto;

/**
 * The Class UserControllerTest.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserControllerTest {
	
	/** The Constant PASSWORD. */
	private final static String PASSWORD = "password";

	/** The mock mvc. */
	@Autowired
	private MockMvc mockMvc;

	/** The password encoder. */
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	/** The user dao. */
	@Autowired
	private UserDao userDao;

	@Autowired
	private AvatarDao avatarDao;

	/** The user controller. */
	@Autowired
	private UserController userController;

	/**
	 * Creates the authenticated user.
	 *
	 * @param userName the user name
	 * @param roleType the role type
	 * @return the authenticated user dto
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	private AuthenticatedUserDto createAuthenticatedUser(String userName, RoleType roleType)
			throws LoginUserBlockedException ,IncorrectLoginException {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, PASSWORD, "newUser", "user", "user@test.com", avatar.orElse(null));

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);
		user.setGender(Users.Gender.OTHER);
		user.setHeight(180);
		user.setWeight(75.0f);
		user.setBirthDate(LocalDate.now().minusYears(25));

		userDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserName());
		loginParams.setPassword(PASSWORD);

		return userController.login(loginParams);

	}

	/*
	 * Creates a userDto
	 * 
	 */
	private UserDto createUserDto(String userName, RoleType roleType, Gender gender) {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, PASSWORD, "newUser", "user", "user@test.com", avatar.orElse(null));
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);
		user.setHeight(150);
		user.setWeight(50.0f);
		user.setGender(gender);
		user.setBirthDate(LocalDate.of(1990, 1, 1));

		userDao.save(user);
		return new UserDto(user.getId(), user.getUserName(), user.getFirstName(), user.getLastName(),
				user.getEmail(), user.getRole().toString(),
				new AvatarDto(user.getAvatar().getName(), user.getAvatar().getAvatarBase64()), user.getBlocked(),
				user.getBankCard(), user.getPremium(), user.getHeight(), user.getWeight(),
				user.getGender().toString(),
				user.getBirthDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
	}

	/**
	 * Test post login ok.
	 *
	 * @throws Exception the exception
	 */
	@Test
	public void testPostLogin_Ok() throws Exception {

		AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.USER);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserDto().getUserName());
		loginParams.setPassword(PASSWORD);

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(post("/api/users/login").header("Authorization", "Bearer " + user.getServiceToken())
				.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(loginParams)))
				.andExpect(status().isOk());

	}

	@Test
	public void testPostChangePassword_Ok() throws Exception {

		AuthenticatedUserDto user = createAuthenticatedUser("userChangeCtrl", RoleType.USER);
		Long userId = user.getUserDto().getId();

		ChangePasswordParamsDto changePasswordParams = new ChangePasswordParamsDto();
		changePasswordParams.setOldPassword(PASSWORD);
		changePasswordParams.setNewPassword("NewPass123");

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(post("/api/users/" + userId + "/changePassword")
				.header("Authorization", "Bearer " + user.getServiceToken())
				.requestAttr("userId", userId)
				.contentType(MediaType.APPLICATION_JSON)
				.content(mapper.writeValueAsBytes(changePasswordParams)))
				.andExpect(status().isNoContent());

		LoginParamsDto oldLogin = new LoginParamsDto();
		oldLogin.setUserName(user.getUserDto().getUserName());
		oldLogin.setPassword(PASSWORD);

		mockMvc.perform(post("/api/users/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(mapper.writeValueAsBytes(oldLogin)))
				.andExpect(status().isNotFound());

		LoginParamsDto newLogin = new LoginParamsDto();
		newLogin.setUserName(user.getUserDto().getUserName());
		newLogin.setPassword("NewPass123");

		mockMvc.perform(post("/api/users/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(mapper.writeValueAsBytes(newLogin)))
				.andExpect(status().isOk());
	}

	@Test
	public void testUpdateProfile_Ok() throws Exception {
		// Crear usuario autenticado
		AuthenticatedUserDto user = createAuthenticatedUser("admin", RoleType.USER);
		Long userId = user.getUserDto().getId();

		// Crear DTO de usuario con datos actualizados con tarjeta para ser PREMIUM
		UserDto userDto = createUserDto("nuevoNombre", RoleType.TRAINER,Gender.FEMALE);

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(put("/api/users/{id}", userId)
						.header("Authorization", "Bearer " + user.getServiceToken())
						.requestAttr("userId", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsBytes(userDto)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.firstName").value(userDto.getFirstName()))
				.andExpect(jsonPath("$.lastName").value(userDto.getLastName()))
				.andExpect(jsonPath("$.email").value(userDto.getEmail()))
				.andExpect(jsonPath("$.avatar.name").value(userDto.getAvatar().getName()))
				.andExpect(jsonPath("$.avatar.avatarBase64").value(userDto.getAvatar().getAvatarBase64()));
	}

	@Test
	public void testUpdateProfile_PermissionException() throws Exception {

		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		Long differentUserId = userId + 1;

		UserDto userDto = createUserDto("nuevoNombre", RoleType.TRAINER,Gender.FEMALE);
		userDto.setId(differentUserId);

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(put("/api/users/{id}", differentUserId)
						.header("Authorization", "Bearer " + user.getServiceToken())
						.requestAttr("userId", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsBytes(userDto)))
				.andExpect(status().isForbidden());
	}

	@Test
	public void testUpdateProfile_ValidationError() throws Exception {
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		Optional<Avatar> avatar = avatarDao.findByName("default");

		UserDto userDto = createUserDto("nuevoNombre", RoleType.TRAINER,Gender.FEMALE);
		userDto.setFirstName(""); // Invalid first name

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(put("/api/users/{id}", userId)
						.header("Authorization", "Bearer " + user.getServiceToken())
						.requestAttr("userId", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsBytes(userDto)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testUpdateProfile_PremiumStatus() throws Exception {

		//Registrar sin cardNumber, no debe ser premium
		UserRegisterParamsDto registerParams = new UserRegisterParamsDto("paco","12345","Paco",
		"Gomez","paco@paco.com","USER", 175.0f, 70.0f, "MALE", "15-05-1990");
		AuthenticatedUserDto user = userController.signUp(registerParams).getBody();

		//Actualizamos el usuario con un cardNumber, debe ser premium
		UserDto userDto = user.getUserDto();
		userDto.setFirstName("manolo");
		userDto.setCardNumber("1234567890123456");
		userDto.setPremium(false);

		ObjectMapper mapper = new ObjectMapper();
		mockMvc.perform(put("/api/users/{id}", userDto.getId())
						.header("Authorization", "Bearer " + user.getServiceToken())
						.requestAttr("userId", userDto.getId())	
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsBytes(userDto)))
				.andExpect(status().isOk());
	
		Users updatedUser = userDao.getById(userDto.getId());
		assertEquals(true, updatedUser.getPremium());


	}

	@Test
	public void testGetUserbyId() throws Exception {
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		mockMvc.perform(get("/api/users/{id}", userId)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId).contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk());
	}

	@Test
	public void failedTestGetUserbyId() throws Exception {
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		mockMvc.perform(get("/api/users/{id}", userId+1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId).contentType(MediaType.APPLICATION_JSON)
		).andExpect(status().isOk());
	}

	@Test
	public void testBlockUser() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.ADMIN);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		
		mockMvc.perform(post("/api/users/block/{id}", 1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId)
		).andExpect(status().isOk());
	}

	@Test
	public void testBlockUserAlreadyBlocked() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.ADMIN);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		
		mockMvc.perform(post("/api/users/block/{id}", 1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId)
		).andExpect(status().isOk());

		mockMvc.perform(post("/api/users/block/{id}", 1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId)
		).andExpect(status().isBadRequest());
	}

	@Test
	public void testBlockNullUser() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.ADMIN);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		
		mockMvc.perform(post("/api/users/block/{id}", 500)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId)
		).andExpect(status().isNotFound());
	}

	@Test
	public void testBlockByUser() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		new ObjectMapper();
		
		mockMvc.perform(post("/api/users/block/{id}", 1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId)
		).andExpect(status().isForbidden());
	}


	@Test
	public void testGetAllUsers() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.ADMIN);

		mockMvc.perform(get("/api/users/getUsers", 1)
				.header("Authorization", "Bearer " + user.getServiceToken())
		).andExpect(status().isOk());
	}

	@Test
	public void testFollowUser() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();

		AuthenticatedUserDto trainer2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);
		Long trainer2Id = trainer2.getUserDto().getId();

		mockMvc.perform(post("/api/users/follow/{id}", trainer2Id)
            .content("")
            .contentType(MediaType.APPLICATION_JSON)
			.header("Authorization", "Bearer " + user.getServiceToken())
			.requestAttr("userId", userId)
		).andExpect(status().isOk());

		// Comprobar que la relación de seguimiento se establece
		Users follower = userDao.getById(userId);
		Users followed = userDao.getById(trainer2Id);
		assertEquals(follower.getFollowing().get(0), followed);
	}

	@Test
	public void testGetFollowersWithNoFollowers() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();

		AuthenticatedUserDto trainer2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);
		Long trainer2Id = trainer2.getUserDto().getId();

		mockMvc.perform(get("/api/users/followers")
				.header("Authorization", "Bearer " + trainer2.getServiceToken())
		).andExpect(status().isOk());

		// Comprobar que los followers se devuelven correctamente
		Users trainer = userDao.getById(trainer2Id);
		assertNull(trainer.getFollowers());
	}	

	@Test
	public void testGetFollowersWithFollowers() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();

		AuthenticatedUserDto trainer2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);
		Long trainer2Id = trainer2.getUserDto().getId();

		mockMvc.perform(post("/api/users/follow/{id}", trainer2Id)
				.header("Authorization", "Bearer " + user.getServiceToken())
				.requestAttr("userId", userId)
		).andExpect(status().isOk());

		mockMvc.perform(get("/api/users/followers")
				.header("Authorization", "Bearer " + trainer2.getServiceToken())
		).andExpect(status().isOk());

		// Comprobar que los followers se devuelven correctamente
		Users trainer = userDao.getById(trainer2Id);
		assertEquals(trainer.getFollowers().get(0), userDao.getById(userId));
	}	


	@Test
	public void testGetFollowingWithNoFollowing() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();

		AuthenticatedUserDto trainer2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);
		Long trainer2Id = trainer2.getUserDto().getId();

		mockMvc.perform(get("/api/users/following")
				.header("Authorization", "Bearer " + user.getServiceToken())
		).andExpect(status().isOk());

		//Comprobar que el following se devuelve correctamente
		assertNull(userDao.getById(userId).getFollowing());
	}

	@Test
	public void testGetFollowingWithFollowing() throws Exception{
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();

		AuthenticatedUserDto trainer2 = createAuthenticatedUser("trainer2", RoleType.TRAINER);
		Long trainer2Id = trainer2.getUserDto().getId();

		mockMvc.perform(post("/api/users/follow/{id}", trainer2Id)
				.header("Authorization", "Bearer " + user.getServiceToken())
				.requestAttr("userId", userId)
		).andExpect(status().isOk());

		mockMvc.perform(get("/api/users/following")
				.header("Authorization", "Bearer " + user.getServiceToken())
		).andExpect(status().isOk());

		//Comprobar que el following se devuelve correctamente
		assertEquals(userDao.getById(userId).getFollowing().get(0), userDao.getById(trainer2Id));
	}
}
