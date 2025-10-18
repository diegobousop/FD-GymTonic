package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.Image;
import jakarta.transaction.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ImageServiceTest {
    @Autowired
    private ImageService imageService;

    @Test
    public void testGetAllAvatars() {
        Block<Avatar> avatars = imageService.getAllAvatars(0, 10);
        assertEquals(4, avatars.getItems().size());
    }

    @Test
    public void testGetImageByName() {
        Image image = imageService.findByName("mazao");
        assertEquals("mazao", image.getName());
    }

    @Test
    public void testGetAllBackgrounds() {
        List<Image> backgrounds = imageService.findAllBackgrounds(Pageable.ofSize(3));
        assertEquals(3, backgrounds.size());
    }
}
