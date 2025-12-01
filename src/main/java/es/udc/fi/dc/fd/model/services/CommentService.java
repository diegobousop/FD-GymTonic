package es.udc.fi.dc.fd.model.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Comment;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface CommentService {

    public Comment addComment(Long trainingId, Long userId, String message) throws InstanceNotFoundException;

    public Comment getComment(Long commentId) throws InstanceNotFoundException;

    public Page<Comment> getComments(Long trainingId, Pageable pageable) throws InstanceNotFoundException;

    public void deleteComment(Long commentId, Long trainingId, Long userId) throws InstanceNotFoundException, PermissionException;
}
