package es.udc.fi.dc.fd.rest.dtos;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.Serie;




public class ExerciseConversor {

    public static final Exercise toExercise(ExerciseDto exerciseDto){
        Exercise exercise = new Exercise(
            exerciseDto.getName(), 
            exerciseDto.getDescripcion(), 
            exerciseDto.getGrupoMuscular(), 
            exerciseDto.getNumeroSeries());
        exercise.setDifficulty(exerciseDto.getDifficulty());
        exercise.setEquipment(exerciseDto.getEquipment());
        return exercise;
    }
    public static final Exercise toExerciseId(ExerciseDto exerciseDto){
        Exercise exercise = new Exercise(
            exerciseDto.getId(), 
            exerciseDto.getName(), 
            exerciseDto.getDescripcion(), 
            exerciseDto.getGrupoMuscular(), 
            exerciseDto.getNumeroSeries());
        exercise.setDifficulty(exerciseDto.getDifficulty());
        exercise.setEquipment(exerciseDto.getEquipment());
        return exercise;
    }


    public static final ExerciseDto toExerciseDto(Exercise exercise){
        return new ExerciseDto(
            exercise.getId(), 
            exercise.getExerciseName(), 
            exercise.getExerciseDescription(), 
            exercise.getGrupoMuscular(), 
            exercise.getNumeroSeries(),
            exercise.getDifficulty(),
            exercise.getEquipment());
    }

    public static final List<ExerciseDto> toExerciseDtos(List<Exercise> exercises){
        return exercises.stream().map(ExerciseConversor::toExerciseDto).toList();
    }

    public static final List<Exercise> toExercises(List<ExerciseDto> exerciseDtos){
        return exerciseDtos.stream().map(ExerciseConversor::toExercise).toList();
    }
    
    public static final ExerciseSummaryDto toExerciseSummaryDto(Exercise exercise){
        return new ExerciseSummaryDto(
            exercise.getId(),
            exercise.getExerciseName(), 
            exercise.getExerciseDescription(), 
            exercise.getGrupoMuscular(), 
            exercise.getCreator().getUserName(), 
            new AvatarDto(exercise.getCreator().getAvatar().getName(), exercise.getCreator().getAvatar().getAvatarBase64()));
    }

    public static final List<ExerciseSummaryDto> toExerciseSummaryDtos(List<Exercise> exercises){
        return exercises.stream().map(ExerciseConversor::toExerciseSummaryDto).toList();
    }

    public static final ExerciseRoutineDto toExerciseRoutineDto(Exercise exercise, List<Serie> series, RoutineExercise routineExercise){
        return new ExerciseRoutineDto(
            exercise.getId(),
            exercise.getExerciseName(), 
            exercise.getExerciseDescription(), 
            exercise.getGrupoMuscular(), 
            exercise.getNumeroSeries(),
            exercise.getDifficulty(),
            exercise.getEquipment(),
            SerieConversor.toSerieSummaryDtos(series),
            exercise.getIcon().getIconBase64(),
            routineExercise != null ? routineExercise.getRestTime() : 0, 
            routineExercise != null ? routineExercise.getOrderInRoutine() : 0
            );
    }

    public static List<ExerciseDto> toExerciseDtosFromRoutineExercises(List<RoutineExercise> routineExercises) {
        if (routineExercises == null) return new ArrayList<>();

        return routineExercises.stream()
                .map(re -> {
                    Exercise exercise = re.getExercise();
                    return new ExerciseDto(
                        exercise.getId(),
                        exercise.getExerciseName(),
                        exercise.getExerciseDescription(),
                        exercise.getGrupoMuscular(),
                        exercise.getNumeroSeries(),
                        exercise.getDifficulty(),
                        exercise.getEquipment()
                    );
                })
                .collect(Collectors.toList());
    }

}
