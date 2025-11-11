package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.BlockUserDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.BlockUser;
import es.udc.fi.dc.fd.model.services.exceptions.AlreadyBlockException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.SelfBlockException;

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
	private BlockUserDao blockUserDao;

	@Autowired
	private AvatarDao avatarDao;

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

		if (userDao.existsByEmail(user.getEmail())) {
			throw new DuplicateInstanceException("project.entities.user", user.getEmail());
		}


		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);
		user.setFollowers(new ArrayList<Users>());
		user.setFollowing(new ArrayList<Users>());
		user.setBlockedUsers(new ArrayList<Users>());
		user.setWhoBlockUs(new ArrayList<Users>());
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
	public Users login(String userName, String password) throws LoginUserBlockedException ,IncorrectLoginException {

		Optional<Users> user = userDao.findByUserName(userName);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}

		if(user.get().getBanned())
			throw new LoginUserBlockedException();

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
	 * @param avatarName the avatar name
	 * @param cardNumber the card number
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	public Users updateProfile(Long id, String firstName, String lastName, String email, String avatarName, String cardNumber,
		 int height, float weight, String gender, String birthDate)
			throws InstanceNotFoundException {

		Users user = permissionChecker.checkUser(id);

		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setEmail(email);
		user.setHeight(height);
		user.setWeight(weight);
		if(gender != null && !gender.isEmpty()) user.setGender(Users.Gender.valueOf(gender));
		if(birthDate != null && !birthDate.isEmpty()) user.setBirthDate(toLocalDate(birthDate));

		// Actualizar premium y tarjeta
		if(cardNumber != null && !cardNumber.isEmpty()) {
			user.setBankCard(cardNumber);
			user.setPremium(true);
		} 
		else {
			user.setBankCard(null);
			user.setPremium(false);
		}

		Optional<Avatar> avatar = avatarDao.findByName(avatarName);
		if (!avatar.isPresent()) {
			throw new InstanceNotFoundException("project.entities.avatar", avatarName);
		}

		if (user.getAvatar() == null || !user.getAvatar().getId().equals(avatar.get().getId())) {
            user.setAvatar(avatar.get());
        }

		userDao.save(user);

		System.out.println("USER SERVICE: " + user);

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
	 * @throws SelfBlockException the user cant block him self
	 */
	@Override
	public void banUser(Long idBlocker, Long idBlocked) throws SelfBlockException, AlreadyBlockException, PermissionException, InstanceNotFoundException, SelfBlockException{

		if (!userDao.existsById(idBlocked)) 
			throw new InstanceNotFoundException("project.entities.users", idBlocked);

		if (!userDao.existsById(idBlocker)) 
			throw new InstanceNotFoundException("project.entities.users", idBlocker);
			
		Users user = userDao.findById(idBlocked).get();
		Users blocker = userDao.findById(idBlocker).get();
		Users blocked = userDao.findById(idBlocked).get();
		if (user.getBanned())
			throw new AlreadyBlockException();

		
		if (blocker.getRole() != RoleType.ADMIN)
			throw new PermissionException("project.entities.BlockUser", idBlocker);

		if(idBlocker == idBlocked)
			throw new SelfBlockException();

		// Remove blocked user from all users who have them as a follower
		// Iterate through all users that the blocked user is following
		if (blocked.getFollowing() != null && !blocked.getFollowing().isEmpty()) {
			// Create a copy of the list to avoid ConcurrentModificationException
			java.util.List<Users> followingCopy = new ArrayList<>(blocked.getFollowing());
			for (Users followed : followingCopy) {
				if (followed.getFollowers() != null && followed.getFollowers().contains(blocked)) {
					followed.getFollowers().remove(blocked);
					userDao.save(followed);
				}
			}
			// Clear the blocked user's following list
			blocked.getFollowing().clear();
			userDao.save(blocked);
		}
		
		blocked.setBanned(Boolean.valueOf(true));
		
		userDao.save(blocked);
	}

	@Override
	public BlockUser blockUser(Long idBlocker, Long idBlocked) throws AlreadyBlockException, SelfBlockException, PermissionException, InstanceNotFoundException{
		if (!userDao.existsById(idBlocked)) 
			throw new InstanceNotFoundException("project.entities.users", idBlocked);

		if (!userDao.existsById(idBlocker)) 
			throw new InstanceNotFoundException("project.entities.users", idBlocker);

		if(blockUserDao.existsByIdBlockerAndIdBlocked(idBlocker, idBlocked)){
			throw new AlreadyBlockException();
		}

		if(userDao.findById(idBlocked).get().getRole() == RoleType.ADMIN)
			throw new PermissionException("project.entities.BlockUser", idBlocked);

		if(idBlocker == idBlocked)
			throw new SelfBlockException();


		Users blocker = permissionChecker.checkUser(idBlocker);
		Users blocked = permissionChecker.checkUser(idBlocked);

		//los admins no pueden ser bloqueados ni bloquear
		if (blocked.getRole() == RoleType.ADMIN)
			throw new PermissionException("project.entites.BlockUser", idBlocked);
		
		if (blocker.getRole() == RoleType.ADMIN)
			throw new PermissionException("project.entites.BlockUser", idBlocker);

		if(blocker.getFollowers().contains(blocked)){
			//el usuario que bloqueado sigue al que le bloquea
			blocker.getFollowers().remove(blocked); 
			blocked.getFollowing().remove(blocker);
		}

		if(blocked.getFollowers().contains(blocker)){
			//el usuario que bloquea sigue al bloqueado
			blocked.getFollowers().remove(blocker);
			blocker.getFollowing().remove(blocked);
		}

		if (blocker.getBlockedUsers() == null) {
			blocked.setBlockedUsers(new ArrayList<Users>());
		}

		if (blocked.getWhoBlockUs() == null) {
			blocker.setWhoBlockUs(new ArrayList<Users>());
		}

		blocker.getBlockedUsers().add(blocked);
		blocked.getWhoBlockUs().add(blocker);

		userDao.save(blocked);
		userDao.save(blocker);

		return blockUserDao.getByIdBlockerAndIdBlocked(idBlocker, idBlocked);
	}

	@Override
	public List<Users> getBlocked(Long id) throws InstanceNotFoundException{
		Users user = permissionChecker.checkUser(id);

		return user.getBlockedUsers();
	}



	@Override
	public Users getUserById(Long id) throws InstanceNotFoundException {
		if (!userDao.existsById(id)) throw new InstanceNotFoundException("project.entities.user", id);
		return userDao.findById(id).get();
	}

	@Override
	public Block<Users> getAllUser(int page, int size){

		Pageable pageable = PageRequest.of(page, size);

		Slice<Users> slice = userDao.findAllByOrderByIdAsc(pageable);

		Block<Users> block = new Block<>(slice.getContent(), slice.hasNext());

		return block;
	}

	@Override
	public boolean followUser(Long followerId, Long followedId) throws InstanceNotFoundException, PermissionException {
		Users newFollower = permissionChecker.checkUser(followerId);
		Users followed = permissionChecker.checkUser(followedId);

		// Admins cannot be followed unless the follower is also an admin
		if (followed.getRole() == RoleType.ADMIN && newFollower.getRole() != RoleType.ADMIN) {
			throw new PermissionException("project.entities.users", followedId);
		}

		// Cannot follow someone who has been banned (system-wide block)
		if (followed.getBanned() != null && followed.getBanned()) {
			throw new PermissionException("project.entities.users", followedId);
		}

		if(followed.getFollowers()==null) {
			followed.setFollowers(new ArrayList<Users>());
		}
		if(newFollower.getFollowing()==null) {
			newFollower.setFollowing(new ArrayList<Users>());
		}

		if (followed.getFollowers().contains(newFollower) || followerId.equals(followedId)) {
			return false; // Already following or trying to follow myself
		}

		if((blockUserDao.existsByIdBlockerAndIdBlocked(followerId, followedId)) || (blockUserDao.existsByIdBlockerAndIdBlocked(followedId, followerId)))
			return false; //si bloqueas a un usuario no lo puedes seguir, si un usuario te bloquea no lo puedes seguir

		followed.getFollowers().add(newFollower);
		newFollower.getFollowing().add(followed);
		userDao.save(followed);
		return true;
	}

	@Override
	public boolean unfollowUser(Long followerId, Long followedId) throws InstanceNotFoundException {
		Users follower = permissionChecker.checkUser(followerId);
		Users followed = permissionChecker.checkUser(followedId);

		if (!follower.getFollowing().contains(followed) || followerId.equals(followedId)) {
			return false; // Not following or Not "unfollow" myself
		}

		follower.getFollowing().remove(followed);
		userDao.save(follower);

		followed.getFollowers().remove(follower);
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

		//Si no tiene seguidores se devuelve una lista vacía
		if(user.getFollowers() == null) {
			return new Block<Users>(new ArrayList<Users>(), false);
		}

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

		//Si no tiene seguidos se devuelve una lista vacía
		if(user.getFollowing() == null) {
			return new Block<Users>(new ArrayList<Users>(), false);
		}

		Slice<Users> slice = user.getFollowing().stream()
				.skip(page * size)
				.limit(size)
				.collect(java.util.stream.Collectors.collectingAndThen(
						java.util.stream.Collectors.toList(),
						list -> new org.springframework.data.domain.SliceImpl<>(list, pageable, list.size() == size)
				));
		return new Block<>(slice.getContent(), slice.hasNext());
	}

	@Override
	public int getFollowersCount(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		if(user.getFollowers() == null) {
			return 0;
		}
		return user.getFollowers().size();
	}

	@Override
	public int getFollowingCount(Long userId) throws InstanceNotFoundException {
		Users user = permissionChecker.checkUser(userId);
		if(user.getFollowing() == null) {
			return 0;
		}
		return user.getFollowing().size();
	}

	// Pasa de un String con formato "dd-MM-yyyy" a LocalDate
	private LocalDate toLocalDate(String birthDate) {
		String [] parts = birthDate.split("-");
		int day = Integer.parseInt(parts[0]);
		int month = Integer.parseInt(parts[1]);
		int year = Integer.parseInt(parts[2]);
		return LocalDate.of(year, month, day);
	}

	@Override
	public List<String> getGenders() {
		return Arrays.asList(Gender.values()).stream()
				.map(Gender::name)
				.collect(Collectors.toList());
	}

}
