package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Image;

public class ImageConversor {
    public static ImageDto toImageDto(Image image) {
        return new ImageDto(image.getName(), image.getSource());
    }

    public static List<ImageDto> toImageDtos(List<Image> images) {
        return images.stream()
                .map(ImageConversor::toImageDto)
                .toList();
    }
}
