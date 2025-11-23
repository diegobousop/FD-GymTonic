package es.udc.fi.dc.fd.model.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.SearchDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.rest.dtos.SearchExerciseForRoutineDto;
import es.udc.fi.dc.fd.rest.dtos.SearchFullDto;
import es.udc.fi.dc.fd.rest.dtos.SearchSuggestionDto;

@Service
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {

    private final SearchDao searchDao;
    private final UserDao userDao;

    public SearchServiceImpl(SearchDao searchDao, UserDao userDao) {
        this.searchDao = searchDao;
        this.userDao = userDao;
    }

    // ----------------------------------------------------------------------
    //  FIND SUGGESTIONS
    // ----------------------------------------------------------------------

    @Override
    public List<SearchSuggestionDto> findSuggestions(String text, int limitPerType) {
        return findSuggestions(text, limitPerType, null);
    }

    @Override
    public List<SearchSuggestionDto> findSuggestions(String text, int limitPerType, Long searcherUserId) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        boolean isSearcherAdmin = isAdmin(searcherUserId);

        List<SearchSuggestionDto> users = searchDao.findUserSuggestions(text, limitPerType * 2).stream()
                .filter(r -> {
                    if (!isSearcherAdmin) {
                        Long userId = (Long) r[0];
                        Optional<Users> user = userDao.findById(userId);
                        return user.isPresent() && user.get().getRole() != RoleType.ADMIN;
                    }
                    return true;
                })
                .limit(limitPerType)
                .map(r -> new SearchSuggestionDto((Long) r[0], "user", (String) r[1]))
                .toList();

        List<SearchSuggestionDto> routines = searchDao.findRoutineSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "routine", (String) r[1]))
                .toList();

        List<SearchSuggestionDto> exercises = searchDao.findExerciseSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "exercise", (String) r[1]))
                .toList();

        List<SearchSuggestionDto> combined = new java.util.ArrayList<>();
        combined.addAll(users);
        combined.addAll(routines);
        combined.addAll(exercises);

        return combined;
    }

    // ----------------------------------------------------------------------
    //  FIND FULL RESULTS
    // ----------------------------------------------------------------------

    @Override
    public Map<String, List<SearchFullDto>> findFullResults(
            String text, String trainerName, String muscleGroup,
            int limit, String difficulty, String equipment, Long searcherUserId) {

        if (text == null || text.isBlank()) {
            return emptyResults();
        }

        String safeText = text.toLowerCase();
        String safeTrainer = trainerName == null ? "" : trainerName.toLowerCase();
        String safeMuscle = muscleGroup == null ? "" : muscleGroup.toUpperCase();
        String safeDifficulty = difficulty == null ? "" : difficulty.toUpperCase();
        String safeEquipment = equipment == null ? "" : equipment.toUpperCase();

        boolean isAdmin = isAdmin(searcherUserId);

        Map<String, List<SearchFullDto>> result = new HashMap<>();
        result.put("users", findUsers(safeText, limit, isAdmin));
        result.put("routines", findRoutines(safeText, safeTrainer, limit));
        result.put("exercises", findExercises(safeText, safeMuscle, safeDifficulty, safeEquipment, limit));

        return result;
    }

    // ----------------------------------------------------------------------
    //  MÉTODOS PRIVADOS
    // ----------------------------------------------------------------------

    private boolean isAdmin(Long userId) {
        if (userId == null) return false;
        return userDao.findById(userId)
                .map(u -> u.getRole() == RoleType.ADMIN)
                .orElse(false);
    }

    private Map<String, List<SearchFullDto>> emptyResults() {
        return Map.of(
                "users", List.of(),
                "routines", List.of(),
                "exercises", List.of()
        );
    }

    // USERS -------------------------------------------------------------

    private List<SearchFullDto> findUsers(String text, int limit, boolean showAdmins) {
        return searchDao.findUsersDetailed(text, limit * 2).stream()
                .filter(u -> showAdmins || u.getRole() != RoleType.ADMIN)
                .limit(limit)
                .map(u -> SearchFullDto.fromUser(
                        u.getId(),
                        u.getUserName(),
                        u.getAvatar() != null ? u.getAvatar().getAvatarBase64() : null,
                        u.getRole()
                ))
                .toList();
    }

    // ROUTINES ----------------------------------------------------------

    private List<SearchFullDto> findRoutines(String text, String trainer, int limit) {
        boolean noTrainer = trainer.isBlank();

        return searchDao.findRoutinesDetailedIncludingExercise(text, limit).stream()
                .filter(r -> noTrainer || r.getCreator().getUserName().toLowerCase().contains(trainer))
                .map(r -> {
                    List<SearchExerciseForRoutineDto> exercises = r.getRoutineExercises().stream()
                            .map(e -> new SearchExerciseForRoutineDto(
                                    e.getExercise().getExerciseName(),
                                    e.getExercise().getNumeroSeries()
                            ))
                            .toList();

                    return SearchFullDto.fromRoutine(
                            r.getId(),
                            r.getName(),
                            r.getCreator().getUserName(),
                            r.getDuration() != null ? r.getDuration().intValue() : null,
                            exercises
                    );
                })
                .toList();
    }

    // EXERCISES ---------------------------------------------------------

    private List<SearchFullDto> findExercises(
            String text, String muscle, String difficulty, String equipment, int limit) {

        boolean noMuscle = muscle.isBlank();
        boolean noDifficulty = difficulty.isBlank();
        boolean noEquipment = equipment.isBlank();

        return searchDao.findExercisesDetailed(text, limit).stream()
                .filter(e -> noMuscle || e.getGrupoMuscular().name().equalsIgnoreCase(muscle))
                .filter(e -> noDifficulty || e.getDifficulty().name().equalsIgnoreCase(difficulty))
                .filter(e -> noEquipment || e.getEquipment().name().equalsIgnoreCase(equipment))
                .map(e -> SearchFullDto.fromExercise(
                        e.getId(),
                        e.getExerciseName(),
                        e.getGrupoMuscular().toString(),
                        e.getEquipment().toString()
                ))
                .toList();
    }
}
