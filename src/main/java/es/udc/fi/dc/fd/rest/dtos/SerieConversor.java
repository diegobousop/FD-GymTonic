package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Serie;

import java.util.List;

public class SerieConversor {

    public static final Serie toSerie(SerieDto serieDto){
        return new Serie(serieDto.getRepeticiones(), serieDto.getPeso(),serieDto.getNumeroSerie(),serieDto.getExercise());
    }


    public static final SerieDto toSerieDto(Serie serie){
        return new SerieDto(serie.getId(), serie.getNumeroSerie(), serie.getRepeticiones(), serie.getPeso(),serie.getExercise());
    }

    public static final List<SerieDto> toSerieDtos(List<Serie> serieList){
        return serieList.stream().map(SerieConversor::toSerieDto).toList();
    }

    public static final List<Serie> toSeries(List<SerieDto> serieDtos){
        return serieDtos.stream().map(SerieConversor::toSerie).toList();
    }

}
