package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class BlockedByUserDto {
    
    private Long id;
    private Long idBlocked;
    private Long idBlocker;
    private LocalDateTime date;

    public BlockedByUserDto(Long id, Long idBlocked, Long idBlocker, LocalDateTime date){
        this.idBlocked = idBlocked;
        this.idBlocker = idBlocker;
        this.date = date;
        this.id = id;
    }

    // Getters
    
    public Long getId() {
        return id;
    }

    public Long getIdBlocked() {
        return idBlocked;
    }

    public Long getIdBlocker() {
        return idBlocker;
    }

    public LocalDateTime getDate() {
        return date;
    }

    // Setters
    
    public void setId(Long id) {
        this.id = id;
    }

    public void setIdBlocked(Long idBlocked) {
        this.idBlocked = idBlocked;
    }

    public void setIdBlocker(Long idBlocker) {
        this.idBlocker = idBlocker;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}