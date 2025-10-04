package es.udc.fi.dc.fd.model.entities;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AvatarDao extends JpaRepository<Avatar, Long> {
    Optional<Avatar> findByName(String name);
}
