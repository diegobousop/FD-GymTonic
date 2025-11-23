package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;


public interface BlockUserDao extends JpaRepository<BlockUser, Long>{
    boolean existsByIdBlockerAndIdBlocked(Long idBlocker, Long idBlocked);

    BlockUser getByIdBlockerAndIdBlocked(Long idBlocker, Long idBlocked);
}
