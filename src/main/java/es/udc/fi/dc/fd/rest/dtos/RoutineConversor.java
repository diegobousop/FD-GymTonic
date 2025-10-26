package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineFollowDao;

public class RoutineConversor {

    // Método original
    public static RoutineDto toRoutineDto(Routine routine) {
        RoutineDto routineDto = new RoutineDto(
            routine.getId(),
            routine.getName(),
            ExerciseConversor.toExerciseDtos(routine.getExercises()),
            routine.getCreator().getUserName(),
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
            ExerciseConversor.toExerciseDtos(routine.getExercises()),
            routine.getCreator().getUserName(),
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
}
