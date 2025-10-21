package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IconDao extends JpaRepository<Icon, Long> {
    Icon findByName(String name);
}
