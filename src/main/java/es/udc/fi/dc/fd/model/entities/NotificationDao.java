package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDao extends JpaRepository<Notification, Long> {
    Slice<Notification> findByReceiverOrderByDateDesc(Users receiver, Pageable pageable);
}

