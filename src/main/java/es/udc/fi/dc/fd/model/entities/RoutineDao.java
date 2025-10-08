package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RoutineDao extends JpaRepository<Routine, Long>, JpaSpecificationExecutor<Routine>{
    boolean existsByNameAndCreator(String name, Users creator);
}
