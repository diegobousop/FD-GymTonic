package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import java.util.stream.Collectors;
import es.udc.fi.dc.fd.model.entities.Badge;
import es.udc.fi.dc.fd.model.entities.UserBadge;

public class BadgeConversor {
    
    public static BadgeDto toBadgeDto(Badge badge) {
        return new BadgeDto(badge.getId(), badge.getName(), badge.getDescription(), badge.getIcon(), null);
    }

    public static BadgeDto toBadgeDto(UserBadge userBadge) {
        return new BadgeDto(userBadge.getBadge().getId(), userBadge.getBadge().getName(), userBadge.getBadge().getDescription(), userBadge.getBadge().getIcon(), userBadge.getEarnedDate().toString());
    }

    public static List<BadgeDto> toBadgeDtos(List<Badge> badges) {
        return badges.stream().map(BadgeConversor::toBadgeDto).collect(Collectors.toList());
    }
    
    public static List<BadgeDto> toBadgeDtosFromUserBadges(List<UserBadge> userBadges) {
        return userBadges.stream().map(BadgeConversor::toBadgeDto).collect(Collectors.toList());
    }
}


