package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.BlockUser;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.BlockUserDao;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

/**
 * The Class UserServiceImpl.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

	/** The permission checker. */
	@Autowired
	private PermissionChecker permissionChecker;

	/** The password encoder. */
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	/** The user dao. */
	@Autowired
	private UserDao userDao;

	@Autowired
	private AvatarDao avatarDao;

	@Autowired 
	private BlockUserDao blockUserDao;

	/**
	 * Sign up.
	 *
	 * @param user the user
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	@Override
	public void signUp(Users user, Users.RoleType roleType) throws DuplicateInstanceException {

		if (userDao.existsByUserName(user.getUserName())) {
			throw new DuplicateInstanceException("project.entities.user", user.getUserName());
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);
		user.setFollowers(new ArrayList<Users>());
		user.setFollowing(new ArrayList<Users>());
		if(user.getAvatar() == null) user.setAvatar(avatarDao.findByName("default").get());

		userDao.save(user);

	}

	/**
	 * Login.
	 *
	 * @param userName the user name
	 * @param password the password
	 * @return the user
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Users login(String userName, String password) throws IncorrectLoginException {

		Optional<Users> user = userDao.findByUserName(userName);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(userName, password);
		}

		return user.get();

	}

	/**
	 * Login from id.
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	@Transactional(readOnly = true)
	public Users loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	/**
	 * Update profile.
	 *
	 * @param id        the id
	 * @param firstName the first name
	 * @param lastName  the last name
	 * @param email     the email
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	public Users updateProfile(Long id, String firstName, String lastName, String email, String avatarName)
			throws InstanceNotFoundException {

		Users user = permissionChecker.checkUser(id);

		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setEmail(email);

		Optional<Avatar> avatar = avatarDao.findByName(avatarName);
		if (!avatar.isPresent()) {
			throw new InstanceNotFoundException("project.entities.avatar", avatarName);
		}

		if (user.getAvatar() == null || !user.getAvatar().getId().equals(avatar.get().getId())) {
            user.setAvatar(avatar.get());
        }

		userDao.save(user);

		return user;
	}

	/**
	 * Change password.
	 *
	 * @param id          the id
	 * @param oldPassword the old password
	 * @param newPassword the new password
	 * @throws InstanceNotFoundException  the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	@Override
	public void changePassword(Long id, String oldPassword, String newPassword)
			throws InstanceNotFoundException, IncorrectPasswordException {

		Users user = permissionChecker.checkUser(id);

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		}
		
		user.setPassword(passwordEncoder.encode(newPassword));
		userDao.save(user);

	}

	/**
	 * Block a User
	 * @param idBlocker id who blocks
	 * @param idBlocked id of user being blocked
	 * @throws AlreadyBlockException the user was already blocked
	 */
	@Override
	public void blockUser(Long idBlocker, Long idBlocked) throws AlreadyBlockException, PermissionException, InstanceNotFoundException{
		if (blockUserDao.existsByIdBlockerAndIdBlocked(idBlocker, idBlocked))
			throw new AlreadyBlockException();

		if (userDao.findById(idBlocked).isEmpty()) 
			throw new InstanceNotFoundException("project.entities.users", idBlocked);
		
		if (userDao.getById(idBlocker).getRole() != RoleType.ADMIN)
			throw new PermissionException("project.entities.BlockUser", idBlocker);
		
		
		BlockUser block = new BlockUser(idBlocker, idBlocked);

		blockUserDao.save(block);
	}

	@Override
	public Users getUserById(Long id) throws InstanceNotFoundException {
		if (!userDao.existsById(id)) throw new InstanceNotFoundException("project.entities.user", id);
		return userDao.findById(id).get();
	}

	@Override
	public boolean checkUserIsBlocked(Long idBlocker, Long idBlocked) throws AlreadyBlockException{
		return blockUserDao.existsByIdBlockerAndIdBlocked(idBlocker, idBlocked);
	}

	@Override
	public Block<Users> getAllUser(int page, int size){

		Pageable pageable = PageRequest.of(page, size);

		Slice<Users> slice = userDao.findAllByOrderByIdAsc(pageable);

		Block<Users> block = new Block<>(slice.getContent(), slice.hasNext());

		return block;
	}

	@Override
	public boolean followUser(Long followerId, Long followedId) throws InstanceNotFoundException {
		Users newFollower = permissionChecker.checkUser(followerId);
		Users followed = permissionChecker.checkUser(followedId);

		if (followed.getFollowers().contains(newFollower) || followerId.equals(followedId)) {
			return false; // Already following or trying to follow myself
		}

		followed.getFollowers().add(newFollower);
		userDao.save(followed);
		return true;
	}

	@Override
	public boolean unfollowUser(Long followerId, Long followedId) throws InstanceNotFoundException {
		Users follower = permissionChecker.checkUser(followerId);
		Users followed = permissionChecker.checkUser(followedId);

		if (!follower.getFollowers().contains(followed) || followerId.equals(followedId)) {
			return false; // Not following or Not follow myself
		}

		follower.getFollowing().remove(followed);
		userDao.save(follower);

		followed.getFollowers().add(follower);
		userDao.save(followed);
		return true;
	}

	/**
	 * Get followers of a user
	 * @param id the userId 
	 * @return list of followers
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	public Block<Users> getFollowers(Long userId, int page, int size) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		Pageable pageable = PageRequest.of(page, size);
		Slice<Users> slice = user.getFollowers().stream()
				.skip(page * size)
				.limit(size)
				.collect(java.util.stream.Collectors.collectingAndThen(
						java.util.stream.Collectors.toList(),
						list -> new org.springframework.data.domain.SliceImpl<>(list, pageable, list.size() == size)
				));
		return new Block<>(slice.getContent(), slice.hasNext());
	}
	/**
	 * Get following of a user
	 * @param userId the userId
	 * @return list of following
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	public Block<Users> getFollowing(Long userId, int page, int size) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		Pageable pageable = PageRequest.of(page, size);
		Slice<Users> slice = user.getFollowing().stream()
				.skip(page * size)
				.limit(size)
				.collect(java.util.stream.Collectors.collectingAndThen(
						java.util.stream.Collectors.toList(),
						list -> new org.springframework.data.domain.SliceImpl<>(list, pageable, list.size() == size)
				));
		return new Block<>(slice.getContent(), slice.hasNext());
	}
}
