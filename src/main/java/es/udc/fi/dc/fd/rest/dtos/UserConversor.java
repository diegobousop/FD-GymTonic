package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.rest.dtos.AvatarDto;
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
		return new UserDto(user.getId(), user.getUserName(), user.getFirstName(), user.getLastName(), user.getEmail(),
				user.getRole().toString(), new AvatarDto(user.getAvatar().getName(),
						user.getAvatar().getAvatarUrl()));
	}

	/**
	 * To user.
	 *
	 * @param userDto the user dto
	 * @return the user
	 */
	public static final Users toUser(UserDto userDto) {

		return new Users(userDto.getUserName(), userDto.getPassword(), userDto.getFirstName(), userDto.getLastName(),
				userDto.getEmail(), new Avatar(userDto.getAvatar().getName(), userDto.getAvatar().getAvatarUrl()));
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

}

