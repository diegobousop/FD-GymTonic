package es.udc.fi.dc.fd.rest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.NotificationConversor;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;




@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for a user.
     * @param userId
     * @param page
     * @param size
     * @return
     * @throws InstanceNotFoundException
     */
    @GetMapping("getNotifications")
    public BlockDto<NotificationDto> getNotifications(@RequestAttribute Long userId, 
    @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException  {

        Block<Notification> notifications = notificationService.getAllNotifications(userId, PageRequest.of(page, size));

        return new BlockDto<NotificationDto>(NotificationConversor.toNotificationDtos(notifications.getItems()), notifications.getExistMoreItems());
    }

    /**
     * Mark a notification as read.
     * @param userId
     * @param id
     * @return
     * @throws InstanceNotFoundException
     */
    @PostMapping("/read/{id}")
    public NotificationDto markAsRead(@RequestAttribute Long userId, @PathVariable Long id) 
    throws InstanceNotFoundException  {

        return NotificationConversor.toNotificationDto(notificationService.markAsRead(id));
    }
    
    /**
     * Mark a notification as unread.
     * @param userId
     * @param id
     * @return
     * @throws InstanceNotFoundException
     */
    @PostMapping("unread/{id}")
    public NotificationDto markAsUnread(@RequestAttribute Long userId, @PathVariable Long id) 
    throws InstanceNotFoundException  {

        return NotificationConversor.toNotificationDto(notificationService.markAsUnread(id));
    }
    
    
}
