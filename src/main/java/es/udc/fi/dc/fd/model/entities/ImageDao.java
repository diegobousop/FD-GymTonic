package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageDao extends JpaRepository<Image, Long> {

    boolean existsByName(String name);

    Image findByName(String name);

    Slice<Image> findAllByOrderByIdDesc(Pageable pageable);
}