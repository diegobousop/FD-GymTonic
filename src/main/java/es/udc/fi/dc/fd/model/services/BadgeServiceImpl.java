package es.udc.fi.dc.fd.model.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Badge;
import es.udc.fi.dc.fd.model.entities.BadgeDao;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.TrainingDao;
import es.udc.fi.dc.fd.model.entities.UserBadge;
import es.udc.fi.dc.fd.model.entities.UserBadgeDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.UserDao;

@Service
@Transactional
public class BadgeServiceImpl implements BadgeService {

    @Autowired
    private BadgeDao badgeDao;

    @Autowired
    private UserBadgeDao userBadgeDao;

    @Autowired
    private TrainingDao trainingDao;

    @Autowired
    private UserDao userDao;

    @Override
    @Transactional(readOnly = true)
    public List<UserBadge> getEarnedBadges(Long userId) throws InstanceNotFoundException {
        Users user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        return userBadgeDao.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Badge> getMissingBadges(Long userId) throws InstanceNotFoundException {
        if (!userDao.existsById(userId)) {
            throw new InstanceNotFoundException("project.entities.user", userId);
        }
        return badgeDao.findMissingBadgesByUser(userId);
    }

    @Override
    public void checkWorkoutsBadges(Long userId) throws InstanceNotFoundException {
        Users user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        
        long workoutCount = trainingDao.findAllByUserIdOrderByCreationDateDesc(userId).size();

        if (workoutCount >= 1) assignBadge(user, "WORKOUT_1");
        if (workoutCount >= 10) assignBadge(user, "WORKOUT_10");
        if (workoutCount >= 100) assignBadge(user, "WORKOUT_100");
    }

    @Override
    public void checkFollowersBadges(Long userId) throws InstanceNotFoundException {
        Users user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        
        int followerCount = user.getFollowers().size();

        if (followerCount >= 1) assignBadge(user, "FOLLOWER_1");
        if (followerCount >= 10) assignBadge(user, "FOLLOWER_10");
        if (followerCount >= 100) assignBadge(user, "FOLLOWER_100");
    }

    @Override
    public void checkConsistencyBadges(Long userId) throws InstanceNotFoundException {
        Users user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        List<Training> trainings = trainingDao.findAllByUserIdOrderByCreationDateDesc(userId);

        if (trainings.isEmpty()) return;

        int maxConsecutiveDays = calculateMaxConsecutiveDays(trainings);
        
        if (maxConsecutiveDays >= 5) assignBadge(user, "CONSECUTIVE_DAYS_5");
        if (maxConsecutiveDays >= 10) assignBadge(user, "CONSECUTIVE_DAYS_10");

        int maxConsecutiveWeeks = calculateMaxConsecutiveWeeks(trainings);

        if (maxConsecutiveWeeks >= 1) assignBadge(user, "CONSECUTIVE_WEEKS_1");
        if (maxConsecutiveWeeks >= 10) assignBadge(user, "CONSECUTIVE_WEEKS_10");
        if (maxConsecutiveWeeks >= 100) assignBadge(user, "CONSECUTIVE_WEEKS_100");
    }

    private void assignBadge(Users user, String badgeName) {
        Optional<Badge> badgeOpt = badgeDao.findByName(badgeName);
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            if (!userBadgeDao.existsByUserAndBadge(user, badge)) {
                userBadgeDao.save(new UserBadge(user, badge));
            }
        }
    }

    private int calculateMaxConsecutiveDays(List<Training> trainings) {
        if (trainings.isEmpty()) return 0;
        
        List<LocalDate> dates = trainings.stream()
                .map(t -> t.getCreationDate().toLocalDate())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());
        
        if (dates.isEmpty()) return 0;

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 0; i < dates.size() - 1; i++) {
            LocalDate d1 = dates.get(i);
            LocalDate d2 = dates.get(i+1);

            if (ChronoUnit.DAYS.between(d2, d1) == 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        return maxStreak;
    }
    
    private int calculateMaxConsecutiveWeeks(List<Training> trainings) {
        if (trainings.isEmpty()) return 0;

        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        List<LocalDate> weekStarts = trainings.stream()
                .map(t -> t.getCreationDate().toLocalDate().with(weekFields.dayOfWeek(), 1)) 
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        if (weekStarts.isEmpty()) return 0;

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 0; i < weekStarts.size() - 1; i++) {
            LocalDate w1 = weekStarts.get(i);
            LocalDate w2 = weekStarts.get(i+1);
            
            if (ChronoUnit.WEEKS.between(w2, w1) == 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        return maxStreak;
    }
}


