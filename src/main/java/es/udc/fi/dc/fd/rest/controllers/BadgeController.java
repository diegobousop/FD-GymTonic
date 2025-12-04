package es.udc.fi.dc.fd.rest.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.BadgeService;
import es.udc.fi.dc.fd.rest.dtos.BadgeConversor;
import es.udc.fi.dc.fd.rest.dtos.BadgeDto;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @GetMapping("/earned/{userId}")
    public List<BadgeDto> getEarnedBadges(@PathVariable Long userId) throws InstanceNotFoundException {
        // Trigger checks to ensure data is up-to-date
        badgeService.checkWorkoutsBadges(userId);
        badgeService.checkFollowersBadges(userId);
        badgeService.checkConsistencyBadges(userId);
        
        return BadgeConversor.toBadgeDtosFromUserBadges(badgeService.getEarnedBadges(userId));
    }

    @GetMapping("/missing/{userId}")
    public List<BadgeDto> getMissingBadges(@PathVariable Long userId) throws InstanceNotFoundException {
        return BadgeConversor.toBadgeDtos(badgeService.getMissingBadges(userId));
    }
    
    @PostMapping("/check")
    public void checkBadges(@RequestAttribute Long userId) throws InstanceNotFoundException {
         badgeService.checkWorkoutsBadges(userId);
         badgeService.checkFollowersBadges(userId);
         badgeService.checkConsistencyBadges(userId);
    }
}


