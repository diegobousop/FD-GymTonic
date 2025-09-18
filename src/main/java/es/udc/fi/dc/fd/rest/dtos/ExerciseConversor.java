package es.udc.fi.dc.fd.rest.dtos;
import es.udc.fi.dc.fd.model.entities.Exercise;


public class ExerciseConversor {

    public static final Exercise toExercise(ExerciseDto exerciseDto){
        return new Exercise(exerciseDto.getName(), exerciseDto.getDescripcion(), exerciseDto.getGrupoMuscular());
    }
    
}
