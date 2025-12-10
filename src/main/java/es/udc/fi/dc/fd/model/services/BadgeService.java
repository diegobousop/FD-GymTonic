package es.udc.fi.dc.fd.model.services;

import java.util.List;
import es.udc.fi.dc.fd.model.entities.Badge;
import es.udc.fi.dc.fd.model.entities.UserBadge;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

public interface BadgeService {
    List<UserBadge> getEarnedBadges(Long userId) throws InstanceNotFoundException;
    List<Badge> getMissingBadges(Long userId) throws InstanceNotFoundException;
    
    void checkWorkoutsBadges(Long userId) throws InstanceNotFoundException;
    void checkFollowersBadges(Long userId) throws InstanceNotFoundException;
    void checkConsistencyBadges(Long userId) throws InstanceNotFoundException;
    void checkDailyStreaks() throws InstanceNotFoundException;
    void checkWeeklyStreaks() throws InstanceNotFoundException;
}


