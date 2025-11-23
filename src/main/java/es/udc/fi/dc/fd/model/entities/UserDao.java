package es.udc.fi.dc.fd.model.entities;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;



/**
 * The Interface UserDao.
 */
public interface UserDao extends JpaRepository<Users, Long> {

	/**
	 * Exists by user name.
	 *
	 * @param userName the user name
	 * @return true, if successful
	 */
	boolean existsByUserName(String userName);


	boolean existsByEmail(String email);

	/**
	 * Find by user name.
	 *
	 * @param userName the user name
	 * @return the optional
	 */
	Optional<Users> findByUserName(String userName);

	Slice<Users> findAllByOrderByIdAsc(Pageable pageable);


}
