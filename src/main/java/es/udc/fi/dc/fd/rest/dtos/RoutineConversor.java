package es.udc.fi.dc.fd.rest.dtos;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.RoutineFollowDao;
import es.udc.fi.dc.fd.model.entities.Training;


public class RoutineConversor {

    // Método adaptado al nuevo modelo con RoutineExercise
    public static RoutineDto toRoutineDto(Routine routine) {
        RoutineDto routineDto = new RoutineDto(
            routine.getId(), 
            routine.getName(),
            // Convertimos cada RoutineExercise a ExerciseDto
            ExerciseConversor.toExerciseDtosFromRoutineExercises(routine.getRoutineExercises()),
            routine.getCreator().getUserName(), 
            routine.getCreator().getAvatar() != null ? routine.getCreator().getAvatar().getAvatarBase64() : null,
            routine.getDuration(),
            routine.getModificationDate(), 
            routine.getIsPublic()
        );

        return routineDto;
    }

    // Nuevo método para incluir info de "isFollowing" para un usuario concreto
    public static RoutineDto toRoutineDto(Routine routine, Long currentUserId, RoutineFollowDao routineFollowDao) {
        RoutineDto routineDto = new RoutineDto(
            routine.getId(),
            routine.getName(),
            ExerciseConversor.toExerciseDtosFromRoutineExercises(routine.getRoutineExercises()),
            routine.getCreator().getUserName(),
            routine.getCreator().getAvatar() != null ? routine.getCreator().getAvatar().getAvatarBase64() : null,
            routine.getDuration(),
            routine.getModificationDate(),
            routine.getIsPublic()
        );

        // Determinar si el usuario sigue esta rutina
        if (currentUserId != null) {
            routineDto.setIsFollowing(routineFollowDao.existsByUserIdAndRoutineId(currentUserId, routine.getId()));
        } else {
            routineDto.setIsFollowing(false);
        }

        return routineDto;
    }

    public static List<RoutineDto> toRoutineDtos(List<Routine> routines) {
        return routines.stream().map(r -> toRoutineDto(r)).collect(Collectors.toList());
    }

    // Lista de RoutineDto con isFollowing
    public static List<RoutineDto> toRoutineDtos(List<Routine> routines, Long currentUserId, RoutineFollowDao routineFollowDao) {
        return routines.stream()
                .map(r -> toRoutineDto(r, currentUserId, routineFollowDao))
                .collect(Collectors.toList());
    }

    public static TrainingDetailsDto toTrainingDetailsDto(Training training, List<ExerciseRoutineDto> exercises, Routine routine) {
        return new TrainingDetailsDto(
            training.getId(),
            training.getName(),
            training.getDescription(),
            training.getDuration(),
            training.getCreationDate(),
            training.getUser().getId(),
            training.getUser().getUserName(),
            routine.getId(),
            routine.getName(),
            exercises,
            training.getIsPublic()
        );
    }

    public static CalendarTrainingDto toCalendarStatDto(Training training) {
        return new CalendarTrainingDto(
            training.getCreationDate().toLocalDate(),
            training.getName()
        );
    }

    public static CalendarStatsDto toCalendarStatsDto(List<Training> trainings) {
        List<CalendarTrainingDto> trainingDtos = trainings.stream()
                .map(RoutineConversor::toCalendarStatDto)
                .collect(Collectors.toList());
        return new CalendarStatsDto(trainingDtos);
    }
}
