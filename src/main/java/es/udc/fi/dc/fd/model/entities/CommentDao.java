package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface CommentDao extends JpaRepository<Comment, Long> {
    List<Comment> findByTraining(Training training);
}
