package es.udc.fi.dc.fd.model.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.SearchDao;
import es.udc.fi.dc.fd.rest.dtos.SearchExerciseForRoutineDto;
import es.udc.fi.dc.fd.rest.dtos.SearchFullDto;
import es.udc.fi.dc.fd.rest.dtos.SearchSuggestionDto;

@Service
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {

    private final SearchDao searchDao;

    public SearchServiceImpl(SearchDao searchDao) {
        this.searchDao = searchDao;
    }

    @Override
    public List<SearchSuggestionDto> findSuggestions(String text, int limitPerType) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<SearchSuggestionDto> suggestions = new ArrayList<>();

        suggestions.addAll(searchDao.findUserSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "user", (String) r[1]))
                .collect(Collectors.toList()));

        suggestions.addAll(searchDao.findRoutineSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "routine", (String) r[1]))
                .collect(Collectors.toList()));

        suggestions.addAll(searchDao.findExerciseSuggestions(text, limitPerType).stream()
                .map(r -> new SearchSuggestionDto((Long) r[0], "exercise", (String) r[1]))
                .collect(Collectors.toList()));

        return suggestions;
    }

    @Override
    public Map<String, List<SearchFullDto>> findFullResults(String text, String trainerName,
                                                            String muscleGroup, String difficulty,
                                                            int limit) {

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

        List<SearchFullDto> users = searchDao.findUsersDetailed(safeText, limit).stream()
                .map(u -> SearchFullDto.fromUser(
                        u.getId(),
                        u.getUserName(),
                        u.getAvatar() != null ? u.getAvatar().getAvatarBase64() : null
                ))
                .collect(Collectors.toList());
        resultMap.put("users", users);

        List<SearchFullDto> routines = searchDao.findRoutinesDetailed(safeText, limit).stream()
                .filter(r -> noTrainer || r.getCreator().getUserName().toLowerCase().contains(safeTrainer))
                .map(r -> {
                    List<SearchExerciseForRoutineDto> exercises = r.getExercises().stream()
                            .map(e -> new SearchExerciseForRoutineDto(
                                    e.getExerciseName(),
                                    e.getNumeroSeries()
                            ))
                            .collect(Collectors.toList());

                    return SearchFullDto.fromRoutine(
                            r.getId(),
                            r.getName(),
                            r.getCreator().getUserName(),
                            r.getDuration() != null ? r.getDuration().intValue() : null,
                            exercises
                    );
                })
                .collect(Collectors.toList());
        resultMap.put("routines", routines);

        List<SearchFullDto> exercises = searchDao.findExercisesDetailed(safeText, limit).stream()
                .filter(e -> noMuscle || e.getGrupoMuscular().name().equalsIgnoreCase(safeMuscle))
                .filter(e -> noDifficulty || e.getDifficulty().name().equalsIgnoreCase(safeDifficulty))
                .map(e -> SearchFullDto.fromExercise(
                        e.getId(),
                        e.getExerciseName(),
                        e.getGrupoMuscular().toString()
                ))
                .collect(Collectors.toList());
        resultMap.put("exercises", exercises);

        return resultMap;
    }
}
