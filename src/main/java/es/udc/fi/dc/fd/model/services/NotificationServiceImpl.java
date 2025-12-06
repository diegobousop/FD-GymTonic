package es.udc.fi.dc.fd.model.services;

import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.Users;


@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationDao notificationDao;
	@Autowired
	private PermissionChecker permissionChecker;


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
        Users trainer = permissionChecker.checkUser(trainerId);

        String message = "Nueva rutina: '" + routine.getName() + "', añadida por " + trainer.getUserName();

        for (Users follower : trainer.getFollowers()) {
            Notification notification = new Notification(follower, trainer, routine, null, message, false, LocalDateTime.now().withNano(0));
            notificationDao.save(notification);
        }
    
    }

    @Override
    public void notifyRoutineLike(Long userId, Routine routine) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        Users trainer = routine.getCreator();

        // No notificar si el usuario le da like a su propia rutina
        if (user.getId().equals(trainer.getId())) {
            return;
        }

        String message = user.getUserName() + " le dio like a tu rutina: " + routine.getName();

        
        Notification notification = new Notification(trainer, user, routine, null, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }

    @Override
    public void notifyRoutineFollow(Long userId, Routine routine) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        Users trainer = routine.getCreator();

        // No notificar si el usuario sigue su propia rutina
        if (user.getId().equals(trainer.getId())) {
            return;
        }

        String message = user.getUserName() + " empezó a seguir tu rutina: " + routine.getName();

        Notification notification = new Notification(trainer, user, routine, null, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }

    @Override
    public void notifyNewFollower(Long followerId, Long trainerId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(followerId);

        Users trainer = permissionChecker.checkUser(trainerId);

        String message = user.getUserName() + " empezó a seguirte";

        Notification notification = new Notification(trainer, user, null, null, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }

    @Override
    public void notifyFollowRequest(Long senderId, Long receiverId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(senderId);

        Users receiver = permissionChecker.checkUser(receiverId);

        String message = user.getUserName() + " quiere seguirte";

        Notification notification = new Notification(receiver, user, null, null, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }

    @Override
    public int getUnreadCount(Long userId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);
        return notificationDao.countByReceiverAndIsReadFalse(user);
    }

    @Override
    public void notifyTrainingLike(Long userId, Training training) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        Users trainer = training.getUser();

        // No notificar si el usuario le da like a su propio entrenamiento
        if (user.getId().equals(trainer.getId())) {
            return;
        }

        String message = user.getUserName() + " le dio like a tu entrenamiento: " + training.getName();

        Notification notification = new Notification(trainer, user, null, training, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }

    @Override
    public void notifyTrainingComment(Long userId, Training training) throws InstanceNotFoundException {
    Users user = permissionChecker.checkUser(userId);

        Users trainer = training.getUser();

        // No notificar si el usuario comenta en su propio entrenamiento
        if (user.getId().equals(trainer.getId())) {
            return;
        }

        String message = user.getUserName() + " ha comentado en tu entrenamiento: " + training.getName();

        Notification notification = new Notification(trainer, user, null, training, message, false, LocalDateTime.now().withNano(0));
        notificationDao.save(notification);
    }
}
