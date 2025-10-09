package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import es.udc.fi.dc.fd.model.entities.Exercise;




public class ExerciseConversor {

    public static final Exercise toExercise(ExerciseDto exerciseDto){
        return new Exercise(exerciseDto.getName(), exerciseDto.getDescripcion(), exerciseDto.getGrupoMuscular(), exerciseDto.getNumeroRepeticiones());
    }

    public static final ExerciseDto toExerciseDto(Exercise exercise){
        return new ExerciseDto(exercise.getId(), exercise.getExerciseName(), exercise.getExerciseDescription(), exercise.getGrupoMuscular(), exercise.getNumeroSeries());
    }

    public static final List<ExerciseDto> toExerciseDtos(List<Exercise> exercises){
        return exercises.stream().map(ExerciseConversor::toExerciseDto).toList();
    }

    public static final List<Exercise> toExercises(List<ExerciseDto> exerciseDtos){
        return exerciseDtos.stream().map(ExerciseConversor::toExercise).toList();
    }
    
}
