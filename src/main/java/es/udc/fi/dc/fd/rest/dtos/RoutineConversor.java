package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineFollowDao;
import es.udc.fi.dc.fd.model.entities.Training;


public class RoutineConversor {

    // Método adaptado al nuevo modelo con RoutineExercise
    public static RoutineDto toRoutineDto(Routine routine) {
        return new RoutineDto(
            routine.getId(), 
            routine.getName(),
            // Convertimos cada RoutineExercise a ExerciseDto
            ExerciseConversor.toExerciseDtosFromRoutineExercises(routine.getRoutineExercises()),
            routine.getCreator().getUserName(), 
            routine.getCreator().getAvatar() != null ? routine.getCreator().getAvatar().getAvatarBase64() : null,
            routine.getDuration(),
            routine.getModificationDate(), 
            routine.getIsPublic());
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
        return routines.stream().map(r -> toRoutineDto(r)).toList();
    }

    // Lista de RoutineDto con isFollowing
    public static List<RoutineDto> toRoutineDtos(List<Routine> routines, Long currentUserId, RoutineFollowDao routineFollowDao) {
        return routines.stream()
                .map(r -> toRoutineDto(r, currentUserId, routineFollowDao))
                .toList();
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
                .toList();
        return new CalendarStatsDto(trainingDtos);
    }
}
