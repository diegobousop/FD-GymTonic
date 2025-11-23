package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Routine;

public class RoutineDetailsConversor {
    public static RoutineDetailsDto toRoutineDetailsDto(Routine routine, List<ExerciseRoutineDto> exerciseRoutineDtos) {
        return new RoutineDetailsDto(
            routine.getId(),
            routine.getName(),
            exerciseRoutineDtos,
            routine.getCreator().getUserName(),
            routine.getCreator().getAvatar().getAvatarBase64(),
            routine.getDuration(),
            routine.getModificationDate(),
            routine.getIsPublic()
            );
    }
}
