package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "User_Badge")
public class UserBadge {

    @EmbeddedId
    private UserBadgeId id = new UserBadgeId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("badgeId")
    private Badge badge;

    private LocalDateTime earnedDate;

    public UserBadge() {}

    public UserBadge(Users user, Badge badge) {
        this.user = user;
        this.badge = badge;
        this.id = new UserBadgeId(user.getId(), badge.getId());
        this.earnedDate = LocalDateTime.now();
    }

    public UserBadgeId getId() {
        return id;
    }

    public void setId(UserBadgeId id) {
        this.id = id;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge badge) {
        this.badge = badge;
    }

    public LocalDateTime getEarnedDate() {
        return earnedDate;
    }

    public void setEarnedDate(LocalDateTime earnedDate) {
        this.earnedDate = earnedDate;
    }
}


