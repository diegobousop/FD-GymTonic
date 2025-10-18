package es.udc.fi.dc.fd.model.services;

import java.util.List;

import org.springframework.data.domain.Pageable;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.Image;

public interface ImageService {

    Block<Avatar> getAllAvatars(int page, int size);

    Image findByName(String name);

    List<Image> findAllBackgrounds(Pageable pageable);

}
