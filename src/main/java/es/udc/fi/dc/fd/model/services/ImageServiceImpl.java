package es.udc.fi.dc.fd.model.services;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.Image;
import es.udc.fi.dc.fd.model.entities.ImageDao;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ImageServiceImpl implements ImageService {
    @Autowired
    private AvatarDao avatarDao;
    @Autowired
    private ImageDao imageDao;

    @Override
    public Block<Avatar> getAllAvatars(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Avatar> imagePage = avatarDao.findAll(pageable);

        return new Block<>(imagePage.getContent(), imagePage.hasNext());
    }

    @Override
    public Image findByName(String name) {
        return imageDao.findByName(name);
    }

    @Override
    public List<Image> findAllBackgrounds(Pageable pageable) {
        return imageDao.findAllByOrderByIdAsc(pageable).getContent();
    }


}
