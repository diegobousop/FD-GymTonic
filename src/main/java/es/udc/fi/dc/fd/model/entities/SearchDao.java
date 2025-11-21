package es.udc.fi.dc.fd.model.entities;

import java.util.List;

public interface SearchDao {

    List<Object[]> findUserSuggestions(String text, int limit);
    List<Object[]> findRoutineSuggestions(String text, int limit);
    List<Object[]> findExerciseSuggestions(String text, int limit);

    List<Users> findUsersDetailed(String text, int limit);
    List<Routine> findRoutinesDetailed(String text, int limit);
    List<Routine> findRoutinesDetailedIncludingExercise(String text, int limit);
    List<Exercise> findExercisesDetailed(String text, int limit);
}
