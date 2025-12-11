package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Comment;
import es.udc.fi.dc.fd.model.entities.CommentDao;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.TrainingDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CommentServiceImpl implements CommentService {

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    public CommentDao commentDao;

    @Autowired
    public UserDao userDao;

    @Autowired
    public TrainingDao trainingDao;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Comment addComment(Long trainingId, Long userId, String message) throws InstanceNotFoundException {

        Optional<Users> creator = userDao.findById(userId);

        if(creator.isEmpty()){
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        Optional<Training> training = trainingDao.findById(trainingId);

        if(training.isEmpty()){
            throw new InstanceNotFoundException("project.entities.training", trainingId);
        }

        Comment comment = new Comment();
        comment.setTraining(training.get());
        comment.setUser(creator.get());
        comment.setMensaje(message);
        comment.setFecha(LocalDateTime.now());

        notificationService.notifyTrainingComment(userId, training.get());

        return commentDao.save(comment);
    }

    @Override
    public Comment getComment(Long commentId) throws InstanceNotFoundException {
        Optional<Comment> optionalComment = commentDao.findById(commentId);
        if (optionalComment.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.comment", commentId);
        }
                        
        return optionalComment.get();
    }

    @Override
    public Page<Comment> getComments(Long trainingId, Pageable pageable) throws InstanceNotFoundException {
        Optional<Training> training = trainingDao.findById(trainingId);

        if(training.isEmpty()){
            throw new InstanceNotFoundException("project.entities.training", trainingId);
        }
        return commentDao.findByTraining(training.get(), pageable);
    }

    @Override
    public void deleteComment(Long commentId, Long trainingId, Long userId) throws InstanceNotFoundException, PermissionException{
        Users creator = permissionChecker.checkUser(userId);

        // Obtiene el comentario
        Optional<Comment> optionalComment = commentDao.findById(commentId);
        if (optionalComment.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.comment", commentId);
        }
        Comment comment = optionalComment.get();

        // Obtiene el entrenamiento
        Optional<Training> optionalTraining = trainingDao.findById(trainingId);
        if (optionalTraining.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.training", trainingId);
        }

        // Comprueba que el usuario es admin o es el creador del comentario
        if (!creator.getRole().equals(Users.RoleType.ADMIN) && 
            !comment.getUser().getId().equals(creator.getId())) {
            throw new PermissionException("project.entities.comment", commentId);
        }
        
        commentDao.delete(comment);
    }
}
