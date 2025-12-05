package es.udc.fi.dc.fd.rest.dtos;

public class BadgeDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String earnedDate;

    public BadgeDto() {}

    public BadgeDto(Long id, String name, String description, String icon, String earnedDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.earnedDate = earnedDate;
    }

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getEarnedDate() {
        return earnedDate;
    }

    public void setEarnedDate(String earnedDate) {
        this.earnedDate = earnedDate;
    }
}


