package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AvatarDto {

    private String name;
    private String avatarUrl;

    public AvatarDto() {}

    public AvatarDto(String name, String avatarUrl) {
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    @NotNull(groups = { UserDto.UpdateValidations.class })
    @Size(min = 1, max = 60, groups = { UserDto.UpdateValidations.class })
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
