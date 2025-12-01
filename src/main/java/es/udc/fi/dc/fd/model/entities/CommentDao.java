package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CommentDao extends JpaRepository<Comment, Long> {
    Page<Comment> findByTraining(Training training, Pageable pageable);
}
