package es.udc.fi.dc.fd.model.services;

import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Training;

public interface NotificationService {

    /**
     * Get all notifications for a user.
     * @param userId
     * @param pageable
     * @return
     * @throws InstanceNotFoundException
     */
    public Block<Notification> getAllNotifications(Long userId, Pageable pageable) throws InstanceNotFoundException;

    /**
     * Mark a notification as read.
     * @param messageId
     * @return
     * @throws InstanceNotFoundException
     */
    public Notification markAsRead(Long messageId) throws InstanceNotFoundException;

    /**
     * Mark a notification as unread.
     * @param messageId
     * @return
     * @throws InstanceNotFoundException
     */
    public Notification markAsUnread(Long messageId) throws InstanceNotFoundException;

    /**
     * Notify all followers of a trainer about a new routine.
     * @param trainerId
     * @param routine
     * @throws InstanceNotFoundException
     */
    public void notifyFollowers(Long trainerId, Routine routine) throws InstanceNotFoundException;

    /**
     * Notify trainer when someone likes their routine.
     * @param userId User who liked the routine
     * @param routine The routineId that was liked
     * @throws InstanceNotFoundException
     */
    public void notifyRoutineLike(Long userId, Routine routine) throws InstanceNotFoundException;

    /**
     * Notify trainer when someone starts following their routine.
     * @param userId User who started following
     * @param routine The routine being followed
     * @throws InstanceNotFoundException
     */
    public void notifyRoutineFollow(Long userId, Routine routine) throws InstanceNotFoundException;

    /**
     * Notify trainer when they receive a new follower.
     * @param followerId User who started following
     * @param trainerId User being followed
     * @throws InstanceNotFoundException
     */
    public void notifyNewFollower(Long followerId, Long trainerId) throws InstanceNotFoundException;

    /**
     * Notify user when they receive a new follow request.
     * @param senderId User who sent the request
     * @param receiverId User receiving the request
     * @throws InstanceNotFoundException
     */
    public void notifyFollowRequest(Long senderId, Long receiverId) throws InstanceNotFoundException;

    /**
     * Get the count of unread notifications for a user.
     * @param userId
     * @return
     * @throws InstanceNotFoundException
    */
    public int getUnreadCount(Long userId) throws InstanceNotFoundException;

    /**
     * Notify trainer when someone likes their training.
     * @param userId User who liked the routine
     * @param training The training that was liked
     * @throws InstanceNotFoundException
     */
    public void notifyTrainingLike(Long userId, Training training) throws InstanceNotFoundException;

    /**
     * Notify trainer when someone comments their training.
     * @param userId User who commented the training
     * @param training The training that was commented
     * @throws InstanceNotFoundException
     */
    public void notifyTrainingComment(Long userId, Training training) throws InstanceNotFoundException;

    /**
     * Notify user when their streak is ending.
     * @param userId User whose streak is ending
     * @param message The message of the notification
     * @throws InstanceNotFoundException
     */
    public void notifyDailyStreakWarning(Long userId) throws InstanceNotFoundException;

    /**
     * Notify user when their streak is ending.
     * @param userId User whose streak is ending
     * @param message The message of the notification
     * @throws InstanceNotFoundException
     */
    public void notifyWeeklyStreakWarning(Long userId) throws InstanceNotFoundException;

    /**
     * Notify user when they earn a badge.
     * @param userId User who earned the badge
     * @param badgeName The name of the badge earned
     * @throws InstanceNotFoundException
     */
    public void notifyBadgeEarned(Long userId, String badgeName) throws InstanceNotFoundException;

}
