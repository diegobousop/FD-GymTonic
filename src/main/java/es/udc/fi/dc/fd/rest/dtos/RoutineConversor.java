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
            routine.getIsPublic()
        );
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
        return routines.stream().map(RoutineConversor::toRoutineDto).toList();
    }

    public static List<RoutineDto> toRoutineDtos(List<Routine> routines, Long currentUserId, RoutineFollowDao routineFollowDao) {
        return routines.stream()
                .map(r -> toRoutineDto(r, currentUserId, routineFollowDao))
                .toList();
    }

    public static TrainingDetailsDto toTrainingDetailsDto(
            Training training,
            List<ExerciseRoutineDto> exercises,
            Routine routine) {

        TrainingDetailsDto dto = new TrainingDetailsDto();

        dto.setId(training.getId());
        dto.setName(training.getName());
        dto.setDescription(training.getDescription());
        dto.setDuration(training.getDuration());
        dto.setCreationDate(training.getCreationDate());
        dto.setCreatorId(training.getUser().getId());
        dto.setCreatorUserName(training.getUser().getUserName());
        dto.setCreatorAvatarBase64(
            training.getUser().getAvatar() != null ? training.getUser().getAvatar().getAvatarBase64() : null
        );
        dto.setRoutineId(routine.getId());
        dto.setRoutineName(routine.getName());
        dto.setExercises(exercises);
        dto.setPublic(training.getIsPublic());

        return dto;
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
