package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;

public class RoutineConversor {

    public static RoutineDto toRoutineDto(Routine routine) {
        RoutineDto routineDto = new RoutineDto(routine.getId(), routine.getName(),
                ExerciseConversor.toExerciseDtos(routine.getExercises()), routine.getCreator(), routine.getDuration(),
                routine.getModificationDate());
        return routineDto;
    }

    public static Routine toRoutine(RoutineDto routineDto) {
        Routine routine = new Routine(routineDto.getId(), routineDto.getName(),
         ExerciseConversor.toExercises(routineDto.getExercises()), routineDto.getCreator(), routineDto.getDuration(), routineDto.getModificationDate()); 
        return routine;
    }
}
