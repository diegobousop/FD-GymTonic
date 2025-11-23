package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.Block;


import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.time.format.DateTimeFormatter;
import es.udc.fi.dc.fd.model.entities.Avatar;


/**
 * The Class UserConversor.
 */
public class UserConversor {

	/**
	 * Instantiates a new user conversor.
	 */
	private UserConversor() {
	}

	/**
	 * To user dto.
	 *
	 * @param user the user
	 * @return the user dto
	 */
	public static final UserDto toUserDto(Users user) {
		List<Long> idBlockedList = Optional.ofNullable(user.getBlockedUsers())
									.orElse(Collections.emptyList())
									.stream()
									.map(Users::getId)
									.toList();


		return new UserDto(user.getId(), user.getUserName(), user.getFirstName(), user.getLastName(), user.getEmail(),
		user.getRole().toString(), new AvatarDto(user.getAvatar().getName(), user.getAvatar().getAvatarBase64()), user.getBanned(), user.getBankCard(), user.getPremium(), idBlockedList,
		user.getHeight(), user.getWeight(), user.getGender().toString(), user.getBirthDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));

	}

	/**
	 * To user.
	 *
	 * @param userDto the user dto
	 * @return the user
	 */
	public static final Users toUser(UserDto userDto) {

		return new Users(userDto.getUserName(), userDto.getPassword(), userDto.getFirstName(), userDto.getLastName(),
				userDto.getEmail(), new Avatar(userDto.getAvatar().getName(), userDto.getAvatar().getAvatarBase64()));
	}

	public static final Users toUser(UserRegisterParamsDto userDto) {

		return new Users(userDto.getUserName(), userDto.getPassword(), userDto.getFirstName(), userDto.getLastName(),
				userDto.getEmail(), null);
	}

	/**
	 * To authenticated user dto.
	 *
	 * @param serviceToken the service token
	 * @param user         the user
	 * @return the authenticated user dto
	 */
	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, Users user) {

		return new AuthenticatedUserDto(serviceToken, toUserDto(user));

	}

	public static final BlockDto<UserDto> toBlockUserDto(Block<Users> users ){

		List<Users> listOfUsers = users.getItems();

		List<UserDto> listOfUserDto =  listOfUsers.stream().map(u -> toUserDto(u)).toList(); 

		return new BlockDto<>(listOfUserDto, users.getExistMoreItems());
	}

	public static final ResumeUserDto toResumeUserDto(Users user){
		String avatarBase64 = user.getAvatar() != null ? user.getAvatar().getAvatarBase64() : null;
		return new ResumeUserDto(user.getId(), user.getUserName(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole().toString(), avatarBase64);
	}

	public static final BlockDto<ResumeUserDto> toBlockResumeUserDto(Block<Users> userBlock){
		List<ResumeUserDto> list = userBlock.getItems().stream().map(u -> toResumeUserDto(u)).toList();
		return new BlockDto<>(list ,userBlock.getExistMoreItems());
	}


}