package es.udc.fi.dc.fd.model.entities;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BadgeDao extends JpaRepository<Badge, Long> {
    Optional<Badge> findByName(String name);

    @Query("SELECT b FROM Badge b WHERE b.id NOT IN (SELECT ub.badge.id FROM UserBadge ub WHERE ub.user.id = :userId)")
    List<Badge> findMissingBadgesByUser(@Param("userId") Long userId);
}


