package es.udc.fi.dc.fd.rest.dtos;
import java.util.List;

import es.udc.fi.dc.fd.model.entities.Avatar;

public class AvatarConversor {
    public static AvatarDto toAvatarDto(Avatar avatar) {
        return new AvatarDto(avatar.getName(), avatar.getAvatarBase64());
    }
    public static List<AvatarDto> toAvatarDtos(List<Avatar> avatarBlock) {
        return avatarBlock.stream().map(AvatarConversor::toAvatarDto).toList();
    }
}
