package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
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

    @Override
    public List<SearchSuggestionDto> findSuggestions(String text, int limitPerType) {
        return findSuggestions(text, limitPerType, null);
    }

    @Override
    public List<SearchSuggestionDto> findSuggestions(String text, int limitPerType, Long searcherUserId) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<SearchSuggestionDto> suggestions = new ArrayList<>();

        // Filter admin users from suggestions unless searcher is admin
        boolean isSearcherAdmin = false;
        if (searcherUserId != null) {
            Optional<Users> searcher = userDao.findById(searcherUserId);
            isSearcherAdmin = searcher.isPresent() && searcher.get().getRole() == RoleType.ADMIN;
        }

        final boolean showAdmins = isSearcherAdmin;
        suggestions.addAll(searchDao.findUserSuggestions(text, limitPerType * 2).stream()
                .filter(r -> {
                    if (!showAdmins) {
                        Long userId = (Long) r[0];
                        Optional<Users> user = userDao.findById(userId);
                        return user.isPresent() && user.get().getRole() != RoleType.ADMIN;
                    }
                    return true;
                })
                .limit(limitPerType)
                .map(r -> new SearchSuggestionDto((Long) r[0], "user", (String) r[1]))
				.toList());

        suggestions.addAll(searchDao.findRoutineSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "routine", (String) r[1]))
				.toList());

        suggestions.addAll(searchDao.findExerciseSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "exercise", (String) r[1]))
				.toList());

        return suggestions;
    }

    @Override
    public Map<String, List<SearchFullDto>> findFullResults(String text, String trainerName, String muscleGroup, int limit, String difficulty, Long searcherUserId) {
        if (text == null || text.isBlank()) {
            return Map.of(
                    "users", List.of(),
                    "routines", List.of(),
                    "exercises", List.of()
            );
        }

        String safeText = text.toLowerCase();
        String safeTrainer = trainerName == null ? "" : trainerName.toLowerCase();
        String safeMuscle = muscleGroup == null ? "" : muscleGroup.toUpperCase();
        String safeDifficulty = difficulty == null ? "" : difficulty.toUpperCase();

        boolean noTrainer = safeTrainer.isBlank();
        boolean noMuscle = safeMuscle.isBlank();
        boolean noDifficulty = safeDifficulty.isBlank();

        Map<String, List<SearchFullDto>> resultMap = new HashMap<>();

        // Check if searcher is admin
        boolean isSearcherAdmin = false;
        if (searcherUserId != null) {
            Optional<Users> searcher = userDao.findById(searcherUserId);
            isSearcherAdmin = searcher.isPresent() && searcher.get().getRole() == RoleType.ADMIN;
        }

        final boolean showAdmins = isSearcherAdmin;
        
        // Usuarios - filter out admins unless searcher is admin
        List<SearchFullDto> users = searchDao.findUsersDetailed(safeText, limit * 2).stream()
                .filter(u -> showAdmins || u.getRole() != RoleType.ADMIN)
                .limit(limit)
                .map(u -> SearchFullDto.fromUser(
                        u.getId(),
                        u.getUserName(),
                        u.getAvatar() != null ? u.getAvatar().getAvatarBase64() : null,
                        u.getRole()
                ))
                .toList();
        resultMap.put("users", users);

        List<SearchFullDto> routines = searchDao.findRoutinesDetailed(safeText, limit).stream()
                .filter(r -> noTrainer || r.getCreator().getUserName().toLowerCase().contains(safeTrainer))
                .map(r -> {
                    // Mapeo de ejercicios a SearchExerciseForRoutineDto
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
        resultMap.put("routines", routines);

        List<SearchFullDto> exercises = searchDao.findExercisesDetailed(safeText, limit).stream()
                .filter(e -> noMuscle || e.getGrupoMuscular().name().equalsIgnoreCase(safeMuscle))
                .filter(e -> noDifficulty || e.getDifficulty().name().equalsIgnoreCase(safeDifficulty))
                .map(e -> SearchFullDto.fromExercise(
                        e.getId(),
                        e.getExerciseName(),
                        e.getGrupoMuscular().toString()
                ))
                .toList();
        resultMap.put("exercises", exercises);

        return resultMap;
    }
}
