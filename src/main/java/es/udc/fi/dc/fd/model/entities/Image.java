package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "Images")
public class Image {

  private Long id;
  private String name;
  private String source;

    @Id 
    @GeneratedValue
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
    public String getSource() {
        return source;
    }

    public void setSource(String base64) {
        this.source = base64;
    }
}

