package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Badge;
import es.udc.fi.dc.fd.model.entities.BadgeDao;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.TrainingDao;
import es.udc.fi.dc.fd.model.entities.UserBadge;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.Gender;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class BadgeServiceTest {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TrainingDao trainingDao;

    @Autowired
    private BadgeDao badgeDao;

    @Autowired
    private AvatarDao avatarDao;

    private Users createUser(String userName) {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        Users user = new Users(userName, "password", "firstName", "lastName", userName + "@test.com", avatar.orElse(null));
        user.setRole(RoleType.TRAINER);
        user.setGender(Gender.FEMALE);
        user.setHeight(170);
        user.setWeight(60);
        user.setBirthDate(LocalDate.now());
        return userDao.save(user);
    }

    private void createTraining(Users user, LocalDateTime date) {
        Training training = new Training("Training", "Description", date, true, user, 60L);
        trainingDao.save(training);
    }

    @Test
    public void testGetEarnedBadgesInitial() throws InstanceNotFoundException {
        Users user = createUser("userBadge1");
        List<UserBadge> badges = badgeService.getEarnedBadges(user.getId());
        assertTrue(badges.isEmpty());
    }

    @Test
    public void testGetMissingBadgesInitial() throws InstanceNotFoundException {
        Users user = createUser("userBadge2");
        List<Badge> badges = badgeService.getMissingBadges(user.getId());
        assertFalse(badges.isEmpty());
    }

    @Test
    public void testCheckWorkoutsBadges() throws InstanceNotFoundException {
        Users user = createUser("userBadge3");

        // No workouts
        badgeService.checkWorkoutsBadges(user.getId());
        assertTrue(badgeService.getEarnedBadges(user.getId()).isEmpty());

        // 1 workout
        createTraining(user, LocalDateTime.now());
        badgeService.checkWorkoutsBadges(user.getId());
        List<UserBadge> badges = badgeService.getEarnedBadges(user.getId());
        assertEquals(1, badges.size());
        assertEquals("WORKOUT_1", badges.get(0).getBadge().getName());

        // 9 more workouts (total 10)
        for (int i = 0; i < 9; i++) {
            createTraining(user, LocalDateTime.now());
        }
        badgeService.checkWorkoutsBadges(user.getId());
        badges = badgeService.getEarnedBadges(user.getId());
        assertEquals(2, badges.size()); // WORKOUT_1 and WORKOUT_10
    }

    @Test
    public void testCheckFollowersBadges() throws InstanceNotFoundException {
        Users user = createUser("userBadge4");
        Users follower = createUser("follower1");

        // 0 followers
        badgeService.checkFollowersBadges(user.getId());
        assertTrue(badgeService.getEarnedBadges(user.getId()).isEmpty());

        // 1 follower
        if (user.getFollowers() == null) {
            user.setFollowers(new ArrayList<>());
        }
        user.getFollowers().add(follower);
        userDao.save(user);
        
        badgeService.checkFollowersBadges(user.getId());
        List<UserBadge> badges = badgeService.getEarnedBadges(user.getId());
        assertEquals(1, badges.size());
        assertEquals("FOLLOWER_1", badges.get(0).getBadge().getName());
    }

    @Test
    public void testCheckConsistencyBadgesDays() throws InstanceNotFoundException {
        Users user = createUser("userBadge5");
        LocalDateTime now = LocalDateTime.now();

        // 5 consecutive days
        for (int i = 0; i < 5; i++) {
            createTraining(user, now.minusDays(i));
        }

        badgeService.checkConsistencyBadges(user.getId());
        List<UserBadge> badges = badgeService.getEarnedBadges(user.getId());
        
        boolean hasBadge = badges.stream().anyMatch(b -> b.getBadge().getName().equals("CONSECUTIVE_DAYS_5"));
        assertTrue(hasBadge);
    }

    @Test
    public void testCheckConsistencyBadgesWeeks() throws InstanceNotFoundException {
        Users user = createUser("userBadge6");
        LocalDateTime now = LocalDateTime.now();

        // 1 week (just need 2 trainings in consecutive weeks? No, logic is "consecutive weeks")
        // Week 1
        createTraining(user, now);
        // Week 2 (previous week)
        createTraining(user, now.minusWeeks(1));

        badgeService.checkConsistencyBadges(user.getId());
        List<UserBadge> badges = badgeService.getEarnedBadges(user.getId());
        
        boolean hasBadge = badges.stream().anyMatch(b -> b.getBadge().getName().equals("CONSECUTIVE_WEEKS_1"));
        assertTrue(hasBadge);
    }

    @Test
    public void testCheckDailyStreaks() throws InstanceNotFoundException {
        badgeService.checkDailyStreaks();
    }
}
