package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;



import java.util.List;

public class SerieConversor {

    public static final Serie toSerie(SerieDto serieDto){
        return new Serie(serieDto.getRepeticiones(), serieDto.getPeso(),serieDto.getNumeroSerie(),serieDto.getExercise(),serieDto.getRoutine());
    }


    public static final SerieDto toSerieDto(Serie serie){
        return new SerieDto(serie.getId(), serie.getNumeroSerie(), serie.getRepeticiones(), serie.getPeso(),serie.getExercise(), serie.getRoutine());
    }

    public static final List<SerieDto> toSerieDtos(List<Serie> serieList){
        return serieList.stream().map(SerieConversor::toSerieDto).toList();
    }

    public static final List<Serie> toSeries(List<SerieDto> serieDtos){
        return serieDtos.stream().map(SerieConversor::toSerie).toList();
    }

    

    public static final List<Serie> toSerieFromSerieParamsDtoList(
        List<SerieParamsDto> serieParamsDtoList, 
        Long exerciseId, 
        Long routineId){

        return serieParamsDtoList.stream().map(serieParamsDto -> new Serie(serieParamsDto.getRepeticiones(), serieParamsDto.getPeso(), serieParamsDto.getNumeroSerie(), new Exercise(exerciseId), new Routine(routineId))).toList();
    }

    public static final List<SerieSummaryDto> toSerieSummaryDtos(List<Serie> series){
        return series.stream().map(serie -> new SerieSummaryDto(
            serie.getId(),
            serie.getNumeroSerie(),
            serie.getRepeticiones(),
            serie.getPeso()
        )).toList();
    }

}
