package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import es.udc.fi.dc.fd.rest.dtos.UserDto;
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
import java.util.Optional;

import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
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
			throws IncorrectLoginException {
		Optional<Avatar> avatar = avatarDao.findByName("default");
		Users user = new Users(userName, PASSWORD, "newUser", "user", "user@test.com", avatar.orElse(null));

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);

		userDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setUserName(user.getUserName());
		loginParams.setPassword(PASSWORD);

		return userController.login(loginParams);

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
		Optional<Avatar> avatar = avatarDao.findByName("messy");

		// Crear DTO de usuario con datos actualizados
		UserDto userDto = new UserDto(userId,user.getUserDto().getUserName(),"NuevoNombre",
				"NuevoApellido","nuevoemail@test.com",user.getUserDto().getRole(), 
				new AvatarDto(avatar.get().getName(), avatar.get().getAvatarBase64()));


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
				.andExpect(jsonPath("$.avatar.name").value(avatar.get().getName()))
				.andExpect(jsonPath("$.avatar.avatarBase64").value(avatar.get().getAvatarBase64()));
	}

	@Test
	public void testUpdateProfile_PermissionException() throws Exception {

		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		Long differentUserId = userId + 1;
		Optional<Avatar> avatar = avatarDao.findByName("default");

		UserDto userDto = new UserDto(differentUserId,user.getUserDto().getUserName(),"NuevoNombre",
				"NuevoApellido","nuevoemail@test.com",user.getUserDto().getRole(), 
				new AvatarDto(avatar.get().getName(), avatar.get().getAvatarBase64()));

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

		UserDto userDto = new UserDto(userId,user.getUserDto().getUserName(),"",
				"","email-invalido",user.getUserDto().getRole(), 
				new AvatarDto(avatar.get().getName(), avatar.get().getAvatarBase64()));

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(put("/api/users/{id}", userId)
						.header("Authorization", "Bearer " + user.getServiceToken())
						.requestAttr("userId", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsBytes(userDto)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testGetUserbyId() throws Exception {
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		ObjectMapper mapper = new ObjectMapper();
		mockMvc.perform(get("/api/users/{id}", userId)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId).contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk());
	}

	@Test
	public void failedTestGetUserbyId() throws Exception {
		AuthenticatedUserDto user = createAuthenticatedUser("testuser", RoleType.USER);
		Long userId = user.getUserDto().getId();
		ObjectMapper mapper = new ObjectMapper();
		mockMvc.perform(get("/api/users/{id}", userId+1)
				.header("Authorization", "Bearer " + user.getServiceToken()).
				requestAttr("userId", userId).contentType(MediaType.APPLICATION_JSON)
		).andExpect(status().isForbidden());
	}
}
