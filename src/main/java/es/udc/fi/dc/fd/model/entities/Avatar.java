package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Avatar {

    private Long id;

    private String name;

    private String avatarBase64; // Campo para almacenar la imagen en base64

    public Avatar() {}

    public Avatar(String name, String avatarBase64) {
        this.name = name;
        this.avatarBase64 = avatarBase64;
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

    @Lob
    @Column(name = "avatarBase64", columnDefinition = "MEDIUMTEXT")
    public String getAvatarBase64() {
        return avatarBase64;
    }

    public void setAvatarBase64(String avatarBase64) {
        this.avatarBase64 = avatarBase64;
    }
}