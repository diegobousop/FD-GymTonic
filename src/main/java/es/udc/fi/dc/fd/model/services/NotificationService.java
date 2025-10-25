package es.udc.fi.dc.fd.model.services;

import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;

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

}
