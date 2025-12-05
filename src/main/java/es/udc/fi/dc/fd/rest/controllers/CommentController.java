package es.udc.fi.dc.fd.rest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Comment;
import es.udc.fi.dc.fd.model.services.CommentService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.CommentConversor;
import es.udc.fi.dc.fd.rest.dtos.CommentDto;
import es.udc.fi.dc.fd.rest.dtos.CommentParamsDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;
    
    @PostMapping("/addComment")
    public CommentDto addComment(@RequestAttribute Long userId, @Valid @RequestBody CommentParamsDto params ) throws InstanceNotFoundException {
        return CommentConversor.toCommentDto(commentService.addComment(params.getTrainingId(), userId, params.getMensaje()));
    }

    @GetMapping("/getComments/{trainingId}")
    public BlockDto<CommentDto> getComments(
            @PathVariable Long trainingId,
            @RequestAttribute Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentService.getComments(trainingId, pageable);
        
        return new BlockDto<>(CommentConversor.toCommentDtos(commentPage.getContent()),
                            commentPage.hasNext());
    }
    
    @DeleteMapping("/deleteComment/{commentId}")
    public void deleteRoutine(
            @PathVariable Long commentId,
            @RequestParam Long trainingId,
            @RequestAttribute Long userId) 
        throws InstanceNotFoundException, PermissionException {
        commentService.deleteComment(commentId, trainingId, userId);
    }
}
