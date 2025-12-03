package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingLikeDao extends JpaRepository<TrainingLike, TrainingLikeId> {

    boolean existsByIdUserIdAndIdTrainingId(Long userId, Long trainingId);

    Page<TrainingLike> findByIdTrainingId(Long trainingId, Pageable pageable);

    Page<TrainingLike> findByIdUserId(Long userId, Pageable pageable);

    void deleteByIdUserIdAndIdTrainingId(Long userId, Long trainingId);

    long countByIdTrainingId(Long trainingId);

}
