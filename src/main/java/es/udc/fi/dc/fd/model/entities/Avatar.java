package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Avatar {

    private Long id;

    private String name;

    private String avatarUrl;

    public Avatar() {
        this.name = "default";
        this.avatarUrl = "https://ik.imagekit.io/940wz34p7/icon1.png?updatedAt=1758634852371";
    }

    public Avatar(String name, String avatarUrl) {
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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