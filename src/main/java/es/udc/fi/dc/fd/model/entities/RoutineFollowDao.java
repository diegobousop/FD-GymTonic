package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineFollowDao extends JpaRepository<RoutineFollow, RoutineFollowId> {

    boolean existsByUserIdAndRoutineId(Long userId, Long routineId);

    Page<RoutineFollow> findByRoutineId(Long routineId, Pageable pageable);

    Page<RoutineFollow> findByUserId(Long userId, Pageable pageable);

    void deleteByUserIdAndRoutineId(Long userId, Long routineId);
}
