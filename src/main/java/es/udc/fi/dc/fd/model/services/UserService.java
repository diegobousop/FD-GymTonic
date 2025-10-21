package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;

/**
 * The Interface UserService.
 */
public interface UserService {
	
	/**
	 * Sign up.
	 *
	 * @param user the user
	 * @param roleType the role
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	void signUp(Users user, Users.RoleType roleType) throws DuplicateInstanceException;
	
	/**
	 * Login.
	 *
	 * @param userName the user name
	 * @param password the password
	 * @return the user
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	Users login(String userName, String password) throws IncorrectLoginException;
	
	/**
	 * Login from id.
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users loginFromId(Long id) throws InstanceNotFoundException;
	
	/**
	 * Update profile.
	 *
	 * @param id the id
	 * @param firstName the first name
	 * @param lastName the last name
	 * @param email the email
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users updateProfile(Long id, String firstName, String lastName, String email, String avatarName) throws InstanceNotFoundException;
	
	/**
	 * Change password.
	 *
	 * @param id the id
	 * @param oldPassword the old password
	 * @param newPassword the new password
	 * @throws InstanceNotFoundException the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;

	/**
	 * Change password.
	 *
	 * @param id the id
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users getUserById(Long id) throws InstanceNotFoundException;


	/**
	 * Block a User
	 * @param idBlocker id who blocks
	 * @param idBlocked id of user being blocked
	 * @throws AlreadyBlockException the user was already blocked
	 */
	void blockUser(Long idBlocker, Long idBlocked) throws AlreadyBlockException, PermissionException, InstanceNotFoundException;	
	
	
	/**
	* Check if a user is blocked 
	* @param idBlocker id who blocks
	* @param idBlocked id of user who might be block
	* @throws AlreadyBlockException the user was already blocked
	*/
	boolean checkUserIsBlocked(Long idBlocker, Long idBlocked) throws AlreadyBlockException;

	Block<Users> getAllUser (int page, int size);
}
