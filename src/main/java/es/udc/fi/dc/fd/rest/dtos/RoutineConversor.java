package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Routine;

public class RoutineConversor {

    public static RoutineDto toRoutineDto(Routine routine) {
        RoutineDto routineDto = new RoutineDto(routine.getId(), routine.getName(),
                ExerciseConversor.toExerciseDtos(routine.getExercises()), routine.getCreator().getUserName(), routine.getDuration(),
                routine.getModificationDate(), routine.getIsPublic());
        return routineDto;
    }


    public static List<RoutineDto> toRoutineDtos(List<Routine> routines){
        return routines.stream().map(c -> toRoutineDto(c)).collect(Collectors.toList());
    }
    
}
