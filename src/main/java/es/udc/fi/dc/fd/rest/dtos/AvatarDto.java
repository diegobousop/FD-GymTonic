package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AvatarDto {

    private String name;
    private String avatarBase64;

    public AvatarDto() {}

    public AvatarDto(String name, String avatarBase64) {
        this.name = name;
        this.avatarBase64 = avatarBase64;
    }

    @NotNull(groups = { UserDto.UpdateValidations.class })
    @Size(min = 1, max = 60, groups = { UserDto.UpdateValidations.class })
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarBase64() {
        return avatarBase64;
    }

    public void setAvatarBase64(String avatarBase64) {
        this.avatarBase64 = avatarBase64;
    }
}
