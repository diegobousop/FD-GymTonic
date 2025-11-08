package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.SelfBlockException;
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
	Users login(String userName, String password) throws LoginUserBlockedException ,IncorrectLoginException;
	
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
	 * @param avatarName the avatar name
	 * @param cardNumber the card number
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Users updateProfile(Long id, String firstName, String lastName, String email, String avatarName, String cardNumber) throws InstanceNotFoundException;
	
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
	void blockUser(Long idBlocker, Long idBlocked) throws AlreadyBlockException, SelfBlockException,PermissionException, InstanceNotFoundException;	

	Block<Users> getAllUser (int page, int size);

	/**
	 * Follow a user
	 * @param idFollower id of the follower
	 * @param idFollowed id of the user to follow
	 * @return true if the user was followed, false if already following
	 * @throws InstanceNotFoundException the instance not found exception
	 * @throws PermissionException the permission exception (if trying to follow an admin without being admin)
	 */
	boolean followUser(Long idFollower, Long idFollowed) throws InstanceNotFoundException, PermissionException;

	/**
	 * Unfollow a user
	 * @param idFollower id of the follower
	 * @param idFollowed id of the user to unfollow
	 * @return true if the user was unfollowed, false if not following
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	boolean unfollowUser(Long idFollower, Long idFollowed) throws InstanceNotFoundException;

	/**
	 * Get followers of a user
	 * @param id the id
	 * @return list of followers
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Block<Users> getFollowers(Long id, int page, int size) throws InstanceNotFoundException;

	/**
	 * Get following of a user
	 * @param id the id
	 * @return list of following
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	Block<Users> getFollowing(Long id, int page, int size) throws InstanceNotFoundException;

	/**
	 * Get followers count of a user
	 * @param id the userId
	 * @return count of followers
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	int getFollowersCount(Long id) throws InstanceNotFoundException;

}
