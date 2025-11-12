package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Notification;

public class NotificationConversor {
    public static NotificationDto toNotificationDto(Notification notification) {
        return new NotificationDto(notification.getId(),notification.getMessage(),notification.getIsRead(),notification.getDate().toString());
    }

    public static List<NotificationDto> toNotificationDtos(List<Notification> notifications) {
        return notifications.stream().map(c -> toNotificationDto(c)).toList();
    }
}
