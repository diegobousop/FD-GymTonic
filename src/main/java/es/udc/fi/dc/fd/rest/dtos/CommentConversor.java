package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import es.udc.fi.dc.fd.model.entities.Comment;

public class CommentConversor {

    public static final CommentDto toCommentDto(Comment params){
        return new CommentDto(params.getId(), params.getMensaje(), params.getFecha(), params.getTraining().getId(), params.getUser().getId());
    }

    public static List<CommentDto> toCommentDtos(List<Comment> comments) {
        return comments.stream().map(r -> toCommentDto(r)).toList();
    }
}
