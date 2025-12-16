package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineFollowDao;
import es.udc.fi.dc.fd.model.entities.Training;

public class RoutineConversor {

    public static RoutineDto toRoutineDto(Routine routine) {
        return new RoutineDto(
            routine.getId(),
            routine.getName(),
            ExerciseConversor.toExerciseDtosFromRoutineExercises(routine.getRoutineExercises()),
            routine.getCreator().getUserName(),
            routine.getCreator().getAvatar() != null ? routine.getCreator().getAvatar().getAvatarBase64() : null,
            routine.getDuration(),
            routine.getModificationDate(),
            routine.getIsPublic()
        );
    }

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

        if (training.getCreationDate() != null) {
            dto.setCreationDate(LocalDateTime.parse(
                training.getCreationDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            ));
        } else {
            dto.setCreationDate(null);
        }

        dto.setCreatorId(training.getUser().getId());
        dto.setCreatorUserName(training.getUser().getUserName());
        dto.setCreatorAvatarBase64(
            training.getUser().getAvatar() != null
                ? training.getUser().getAvatar().getAvatarBase64()
                : null
        );

        if (routine != null) {
            dto.setRoutineId(routine.getId());
            dto.setRoutineName(routine.getName());
            Boolean isPublicObj = routine.getIsPublic(); // variable local para evitar unboxing nulo
            dto.setRoutineIsPublic(isPublicObj != null && isPublicObj); // null se interpreta como false
        } else {
            dto.setRoutineId(null);
            dto.setRoutineName(null);
            dto.setRoutineIsPublic(false);
        }

        dto.setExercises(exercises);
        dto.setPublic(training.getIsPublic() != null && training.getIsPublic()); // también seguro si training.getIsPublic() es Boolean

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
