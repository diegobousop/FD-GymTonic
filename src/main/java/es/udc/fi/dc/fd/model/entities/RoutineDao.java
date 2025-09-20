package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineDao extends JpaRepository<Routine, Long> {
    boolean existsByNameAndCreator(String name, Users creator);
}
