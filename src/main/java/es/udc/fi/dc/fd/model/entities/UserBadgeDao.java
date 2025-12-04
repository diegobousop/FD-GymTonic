package es.udc.fi.dc.fd.model.entities;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeDao extends JpaRepository<UserBadge, UserBadgeId> {
    List<UserBadge> findByUser(Users user);
    boolean existsByUserAndBadge(Users user, Badge badge);
}


