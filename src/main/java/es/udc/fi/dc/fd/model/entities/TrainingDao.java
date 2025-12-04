package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingDao extends JpaRepository<Training, Long> {

    Page<Training> findByUserIdOrderByCreationDateDesc(Long userId, Pageable pageable);

    List<Training> findByUserIdAndCreationDateBetween(Long userId, LocalDateTime start, LocalDateTime end);

    Page<Training> findByUserIdAndCreationDateBetweenOrderByCreationDateDesc(Long userId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Training> findByUserIdInAndIsPublicTrueOrderByCreationDateDesc(List<Long> userIds, Pageable pageable);
}