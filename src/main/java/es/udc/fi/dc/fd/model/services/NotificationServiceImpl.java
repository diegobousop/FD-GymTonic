package es.udc.fi.dc.fd.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;


@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationDao notificationDao;
	@Autowired
	private PermissionChecker permissionChecker;
    @Autowired
    private UserDao userDao;

    @Override
    public Block<Notification> getAllNotifications(Long userId, Pageable pageable) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        Slice<Notification> response = notificationDao.findByReceiverOrderByDateDesc(user, pageable);
        
        return new Block<>(response.getContent(), response.hasNext());
    }

    @Override
    public Notification markAsRead(Long messageId) throws InstanceNotFoundException {
        Optional<Notification> notification = notificationDao.findById(messageId);
        if (notification.isPresent()) {
            Notification notif = notification.get();
            notif.setIsRead(true);
            notificationDao.save(notif);
            return notif;
        }
        throw new InstanceNotFoundException("notification", notification);
    }

    @Override
    public Notification markAsUnread(Long messageId) throws InstanceNotFoundException {
        Optional<Notification> notification = notificationDao.findById(messageId);
        if (notification.isPresent()) {
            Notification notif = notification.get();
            notif.setIsRead(false);
            notificationDao.save(notif);
            return notif;
        }
        throw new InstanceNotFoundException("notification", notification);
    }

    @Override
    public void notifyFollowers(Long trainerId, Routine routine) throws InstanceNotFoundException {
        //No lanza exception porque es llamada desde createRoutine, que ya la ha comprobado
        Optional<Users> trainer = userDao.findById(trainerId);

        String message = "Nueva rutina: '" + routine.getName() + "', añadida por " + trainer.get().getUserName();

        for (Users follower : trainer.get().getFollowers()) {
            Notification notification = new Notification(follower, trainer.get(), routine, message, false, java.time.LocalDateTime.now().withNano(0));
            notificationDao.save(notification);
        }
    
    }


}
