package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class BlockUser {

    private Long id;
    private Long idBlocker;
    private Long idBlocked;
    private LocalDateTime dateBlock;

    public BlockUser() {}

    public BlockUser(Long idBlocker, Long idBlocked) {
        this.idBlocker = idBlocker;
        this.idBlocked = idBlocked;
        this.dateBlock = LocalDateTime.now().withNano(0);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdBlocker() {
        return idBlocker;
    }

    public void setIdBlocker(Long idBlocker) {
        this.idBlocker = idBlocker;
    }

    public Long getIdBlocked() {
        return idBlocked;
    }

    public void setIdBlocked(Long idBlocked) {
        this.idBlocked = idBlocked;
    }
    
    public LocalDateTime getDateBlock(){return dateBlock;}

    public void setDateBlock(LocalDateTime dateBlock) {
        this.dateBlock = dateBlock;
    }
}
