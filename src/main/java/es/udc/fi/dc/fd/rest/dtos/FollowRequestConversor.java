package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import es.udc.fi.dc.fd.model.entities.FollowRequest;

public class FollowRequestConversor {
    private FollowRequestConversor(){}

    public static FollowRequestDto toFollowRequestDto(FollowRequest request) {
        if(request != null){
            return new FollowRequestDto(
                    request.getId(),
                    request.getSender().getId(),
                    request.getSender().getUserName(),
                    request.getReceiver().getId(),
                    request.getReceiver().getUserName(),
                    request.getCreatedAt(),
                    request.isAccepted()
            );
        }else{
            return null;
        }
    }

    public static List<FollowRequestDto> toFollowRequestDtos(List<FollowRequest> requests) {
        return requests.stream()
                .map(FollowRequestConversor::toFollowRequestDto).toList();
    }
}
