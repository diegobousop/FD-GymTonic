package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineLikeDao extends JpaRepository<RoutineLike, RoutineLikeId> {

    boolean existsByUserIdAndRoutineId(Long userId, Long routineId);

    Page<RoutineLike> findByRoutineId(Long routineId, Pageable pageable);

    Page<RoutineLike> findByUserId(Long userId, Pageable pageable);

    void deleteByUserIdAndRoutineId(Long userId, Long routineId);

    long countByRoutineId(Long routineId);
}
