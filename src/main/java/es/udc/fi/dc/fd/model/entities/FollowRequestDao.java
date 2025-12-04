package es.udc.fi.dc.fd.model.entities;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRequestDao extends JpaRepository<FollowRequest, Long> {

    Optional<FollowRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    List<FollowRequest> findByReceiverIdAndAcceptedFalse(Long receiverId);
    
    //obtener las solicitudes que hemos enviado
    List<FollowRequest> findBySenderIdAndAcceptedFalse(Long senderId);

    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);
}