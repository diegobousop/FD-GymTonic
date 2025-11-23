package es.udc.fi.dc.fd.rest.controllers;

import java.net.URI;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.BlockUser;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.SelfBlockException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.common.JwtInfo;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.BlockedByUserDto;
import es.udc.fi.dc.fd.rest.dtos.ChangePasswordParamsDto;
import es.udc.fi.dc.fd.rest.dtos.FollowRequestConversor;
import es.udc.fi.dc.fd.rest.dtos.FollowRequestDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.ResumeUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toAuthenticatedUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toBlockResumeUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toBlockUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUser;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDto;
import es.udc.fi.dc.fd.rest.dtos.UserDto;
import es.udc.fi.dc.fd.rest.dtos.UserRegisterParamsDto;


/**
 * The Class UserController.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

	/** The Constant INCORRECT_LOGIN_EXCEPTION_CODE. */
	private static final String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";

	/** The Constant INCORRECT_PASSWORD_EXCEPTION_CODE. */
	private static final String INCORRECT_PASS_EXCEPTION_CODE = "project.exceptions.IncorrectPasswordException";

	/** The constant ALREADY_BLOCKED_EXCEPTION_CODE. */
	private static final String ALREADY_BLOCKED_EXCEPTION = "project.exceptions.AlreadyBlockedException";

	/** The constant ALREADY_BLOCKED_EXCEPTION_CODE. */
	private static final String SELF_BLOCKED_EXCEPTION = "project.exceptions.SelfBlockedException";

	private static final String LOGIN_BLOCK_EXCEPTION = "project.exceptions.LoginBlockException";



	/** The message source. */
	@Autowired
	private MessageSource messageSource;

	/** The jwt generator. */
	@Autowired
	private JwtGenerator jwtGenerator;

	/** The user service. */
	@Autowired
	private UserService userService;

	/**
	 * Handle incorrect login exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(IncorrectLoginException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
				INCORRECT_LOGIN_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ExceptionHandler(LoginUserBlockedException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorsDto handleLoginUserBlockedException(LoginUserBlockedException exception, Locale locale){

		String errorMessage = messageSource.getMessage(LOGIN_BLOCK_EXCEPTION, null,
		LOGIN_BLOCK_EXCEPTION, locale);

		return new ErrorsDto(errorMessage);
	}


	/**
	 * Handle incorrect password exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(IncorrectPasswordException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorsDto handleIncorrectPasswordException(IncorrectPasswordException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_PASS_EXCEPTION_CODE, null,
				INCORRECT_PASS_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	/**
	 * Handle already block exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(AlreadyBlockException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorsDto handleAlreadyStartedException(AlreadyBlockException exception, Locale locale){
		String errorMessage = messageSource.getMessage(ALREADY_BLOCKED_EXCEPTION, null,
				ALREADY_BLOCKED_EXCEPTION, locale);

		return new ErrorsDto(errorMessage);
	}


	/**
	 * Handle already block exception.
	 *
	 * @param exception the exception
	 * @param locale    the locale
	 * @return the errors dto
	 */
	@ExceptionHandler(SelfBlockException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorsDto handleSelfBlockException(SelfBlockException exception, Locale locale){
		String errorMessage = messageSource.getMessage(SELF_BLOCKED_EXCEPTION, null,
		SELF_BLOCKED_EXCEPTION, locale);

		return new ErrorsDto(errorMessage);
	}

	private Gender parseGender(String genderStr) {
		if (genderStr == null) {
			return null; // or throw an exception
		}
		switch (genderStr.toUpperCase()) {
			case "MALE":
				return Gender.MALE;
			case "FEMALE":
				return Gender.FEMALE;
			default:
				return Gender.OTHER;
		}
	}

	/**
	 * Sign up.
	 *
	 * @param userDto the user dto
	 * @return the response entity
	 * @throws DuplicateInstanceException the duplicate instance exception
	 * @throws InstanceNotFoundException 
	 */
	@PostMapping("/signUp")
	public ResponseEntity<AuthenticatedUserDto> signUp(
			@Validated({ UserDto.AllValidations.class }) @RequestBody UserRegisterParamsDto userDto)
			throws DuplicateInstanceException, InstanceNotFoundException {

		Users user = toUser(userDto);
		Users.RoleType role = userDto.getRole() != null && userDto.getRole().equals("TRAINER") ? Users.RoleType.TRAINER : Users.RoleType.USER;
		Users.Gender gender = parseGender(userDto.getGender());
		user.setGender(gender);
		if (userDto.getBirthDate() != null && !userDto.getBirthDate().isEmpty()) {
			user.setBirthDate(toLocalDate(userDto.getBirthDate()));
		}
		if (userDto.getHeight() > 0) {
			user.setHeight((int) userDto.getHeight());
		}
		if (userDto.getWeight() > 0) {
			user.setWeight(userDto.getWeight());
		}

		userService.signUp(user, role);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.getId())
				.toUri();

		return ResponseEntity.created(location).body(toAuthenticatedUserDto(generateServiceToken(user), user));

	}

	/**
	 * Login.
	 *
	 * @param params the params
	 * @return the authenticated user dto
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	@PostMapping("/login")
	public AuthenticatedUserDto login(@Validated @RequestBody LoginParamsDto params) throws LoginUserBlockedException ,IncorrectLoginException {

		Users user = userService.login(params.getUserName(), params.getPassword());

		return toAuthenticatedUserDto(generateServiceToken(user), user);

	}

	/**
	 * Login from service token.
	 *
	 * @param userId       the user id
	 * @param serviceToken the service token
	 * @return the authenticated user dto
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@PostMapping("/loginFromServiceToken")
	public AuthenticatedUserDto loginFromServiceToken(@RequestAttribute Long userId,
			@RequestAttribute String serviceToken) throws InstanceNotFoundException {

		Users user = userService.loginFromId(userId);

		return toAuthenticatedUserDto(serviceToken, user);

	}

	/**
	 * Update profile.
	 *
	 * @param userId  the user id
	 * @param id      the id
	 * @param userDto the user dto
	 * @return the user dto
	 * @throws InstanceNotFoundException the instance not found exception
	 * @throws PermissionException       the permission exception
	 */
	@PutMapping("/{id}")
	public UserDto updateProfile(@RequestAttribute Long userId, @PathVariable("id") Long id,
			@Validated({ UserDto.UpdateValidations.class }) @RequestBody UserDto userDto)
			throws InstanceNotFoundException, PermissionException {

		if (!id.equals(userId)) {
			throw new PermissionException("project.entities.user", id);
		}

		return toUserDto(
				userService.updateProfile(id, userDto.getFirstName(), userDto.getLastName(), userDto.getEmail(), userDto.getAvatar().getName(), userDto.getCardNumber(),
				 userDto.getHeight(), userDto.getWeight(), userDto.getGender(), userDto.getBirthDate()));

	}

	/**
	 * Change password.
	 *
	 * @param userId the user id
	 * @param id     the id
	 * @param params the params
	 * @throws PermissionException        the permission exception
	 * @throws InstanceNotFoundException  the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	@PostMapping("/{id}/changePassword")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@RequestAttribute Long userId, @PathVariable Long id,
			@Validated @RequestBody ChangePasswordParamsDto params)
			throws PermissionException, InstanceNotFoundException, IncorrectPasswordException {

		if (!id.equals(userId)) {
			throw new PermissionException("project.entities.user", id);
		}

		userService.changePassword(id, params.getOldPassword(), params.getNewPassword());

	}

	@GetMapping("/{id}")
	public UserDto getUser(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException {
		return toUserDto(userService.getUserById(id));
	}

	@PostMapping("/ban/{id}")
	public void banUser(@RequestAttribute Long userId, @PathVariable Long id) throws SelfBlockException, AlreadyBlockException, PermissionException, InstanceNotFoundException{
		userService.banUser(userId, id);
	}

	@GetMapping("/getUsers")
	public BlockDto<UserDto> getMethodName(@RequestParam(defaultValue = "0") int page) {
		return toBlockUserDto(userService.getAllUser(page, 5));
	}

	@PostMapping("/unfollow/{id}")
	public boolean unfollowUser(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException {
		return userService.unfollowUser(userId, id);
	}

	@PostMapping("/follow/{id}")
	public boolean followUser(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException, PermissionException {
		return userService.followUser(userId, id);
	}

	@GetMapping("/followers")
	public BlockDto<ResumeUserDto> getFollowers(@RequestAttribute Long userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
		return toBlockResumeUserDto(userService.getFollowers(userId, page, size));
	}

	@GetMapping("/following")
	public BlockDto<ResumeUserDto> getFollowing(@RequestAttribute Long userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
		return toBlockResumeUserDto(userService.getFollowing(userId, page, size));
	}


	@PostMapping("/block/{id}")
	public BlockedByUserDto postBlockUser(@RequestAttribute Long userId, @PathVariable Long id)throws SelfBlockException, AlreadyBlockException, PermissionException, InstanceNotFoundException{
		BlockUser blockuser = userService.blockUser(userId, id);

		return new BlockedByUserDto(blockuser.getId(), blockuser.getIdBlocked(), blockuser.getIdBlocker(), blockuser.getDateBlock());
	}
	

	@GetMapping("/followers/count")
	public int getFollowersCount(@RequestAttribute Long userId) throws InstanceNotFoundException {
		return userService.getFollowersCount(userId);
	}

	@GetMapping("/getBlocked")
	public List<Long> getBlocked(@RequestAttribute Long userId) throws InstanceNotFoundException{
		return Optional.ofNullable(userService.getBlocked(userId))
									.orElse(Collections.emptyList())
									.stream()
									.map(Users::getId)
									.toList();
	}
	
	@GetMapping("/following/count")
	public int getFollowingCount(@RequestAttribute Long userId) throws InstanceNotFoundException {
		return userService.getFollowingCount(userId);
	}

	@GetMapping("/getGenders")
	public List<String> getGenders() {
		return userService.getGenders();
	}

	@PostMapping("/sendFollowRequest/{receiverId}")
	public FollowRequestDto sendFollowRequest(@RequestAttribute Long userId, @PathVariable Long receiverId) throws PermissionException, InstanceNotFoundException {
		return FollowRequestConversor.toFollowRequestDto(userService.sendFollowRequest(userId,receiverId));
	}

	@PostMapping("/acceptFollowRequest/{id}")
	public boolean acceptFollowRequest(@PathVariable long id) throws PermissionException, InstanceNotFoundException {
		return userService.acceptFollowRequest(id);
	}
	@DeleteMapping("/rejectFollowRequest/{id}")
	public void rejectFollowRequest(@PathVariable long id) throws InstanceNotFoundException {
		userService.rejectFollowRequest(id);
	}
	@GetMapping("/FollowRequest")
	public List<FollowRequestDto> getFollowRequest(@RequestAttribute Long userId) throws InstanceNotFoundException {
		return FollowRequestConversor.toFollowRequestDtos(userService.getFollowRequests(userId));
	}


	/**
	 * Generate service token.
	 *
	 * @param user the user
	 * @return the string
	 */
	private String generateServiceToken(Users user) {

		JwtInfo jwtInfo = new JwtInfo(user.getId(), user.getUserName(), user.getRole().toString());

		return jwtGenerator.generate(jwtInfo);

	}

	// Pasa de un String con formato "yyyy-MM-dd" a LocalDate
	private LocalDate toLocalDate(String birthDate) {
		String [] parts = birthDate.split("-");
		int day = Integer.parseInt(parts[0]);
		int month = Integer.parseInt(parts[1]);
		int year = Integer.parseInt(parts[2]);
		return LocalDate.of(year, month, day);
	}
}
