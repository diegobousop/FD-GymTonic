package es.udc.fi.dc.fd.rest.controllers;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.services.ImageService;
import es.udc.fi.dc.fd.rest.dtos.AvatarConversor;
import es.udc.fi.dc.fd.rest.dtos.AvatarDto;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.ImageConversor;
import es.udc.fi.dc.fd.rest.dtos.ImageDto;


@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @GetMapping("/getAllAvatars")
    public BlockDto<AvatarDto> getAllAvatars(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "4") int size) {
        Block<Avatar> returned = imageService.getAllAvatars(page, size);
        return new BlockDto<AvatarDto>(AvatarConversor.toAvatarDtos(returned.getItems()), returned.getExistMoreItems());
    }
    
    @GetMapping("/getByName/{name}")
    public ImageDto getImageByName(@PathVariable String name) {
        return ImageConversor.toImageDto(imageService.findByName(name));
    }

    @GetMapping("/getAllBackgrounds")
    public List<ImageDto> getAllBackgrounds() {
         // Solo cargamos las 3 imagenes que se utilizan en la página principal

        return ImageConversor.toImageDtos(imageService.findAllBackgrounds(PageRequest.of(0, 3)));
    }
}
