package es.udc.fi.dc.fd.rest.dtos.user;

import es.udc.fi.dc.fd.model.entities.Serie;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.rest.dtos.ImageDto;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class StatsConversor {
    private StatsConversor() {}
    public static final List<UserStatsDto> toUserStatsDto(Map<Serie, LocalDate> statsMap, String period) {
        if (statsMap == null || statsMap.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        Long userId = extractUserId(statsMap);
        Map<String, Integer> globalMaxByExercise = computeGlobalMaxByExercise(statsMap);
        List<ImageDto> muscleGroupImages = buildMuscleGroupImages(statsMap);

        Map<LocalDate, List<Serie>> byDate = groupByDate(statsMap);
        List<LocalDate> sortedDates = byDate.keySet().stream().sorted().toList();

        List<ExercisesStatsDto> perDateExerciseStats = buildPerDateExerciseStats(sortedDates, byDate, globalMaxByExercise);
        List<MuscularGroupsStatsDto> perDateMuscleStats = buildPerDateMuscleStats(sortedDates, byDate);

        LocalDate startDate = sortedDates.isEmpty() ? null : sortedDates.get(0);
        PeriodExerciseStatsDto periodExercise = new PeriodExerciseStatsDto(startDate, perDateExerciseStats);
        PeriodMuscularGroupStatsDto periodMuscles = new PeriodMuscularGroupStatsDto(startDate, perDateMuscleStats);

        UserStatsDto dto = new UserStatsDto(userId, period, muscleGroupImages, java.util.List.of(periodExercise), java.util.List.of(periodMuscles));
        return java.util.List.of(dto);
    }

    private static Long extractUserId(Map<Serie, LocalDate> statsMap) {
        return statsMap.keySet().stream()
                .map(Serie::getTraining)
                .filter(Objects::nonNull)
                .map(Training::getUser)
                .filter(Objects::nonNull)
                .map(es.udc.fi.dc.fd.model.entities.Users::getId)
                .findFirst()
                .orElse(null);
    }

    private static Map<String, Integer> computeGlobalMaxByExercise(Map<Serie, LocalDate> statsMap) {
        Map<String, Integer> globalMaxByExercise = new HashMap<>();
        for (Serie s : statsMap.keySet()) {
            Exercise ex = s.getExercise();
            if (ex == null || ex.getExerciseName() == null) {
                continue;
            }
            String name = ex.getExerciseName();
            int weight = s.getPeso();
            Integer prev = globalMaxByExercise.get(name);
            if (prev == null || weight > prev) {
                globalMaxByExercise.put(name, weight);
            }
        }
        return globalMaxByExercise;
    }

    private static List<ImageDto> buildMuscleGroupImages(Map<Serie, LocalDate> statsMap) {
        Map<String, String> muscleGroupImagesMap = new HashMap<>();
        for (Serie s : statsMap.keySet()) {
            Exercise ex = s.getExercise();
            if (ex == null) {
                continue;
            }
            if (ex.getGrupoMuscular() != null && ex.getIcon() != null && ex.getIcon().getIconBase64() != null) {
                muscleGroupImagesMap.putIfAbsent(ex.getGrupoMuscular().name(), ex.getIcon().getIconBase64());
            }
        }
        return muscleGroupImagesMap.entrySet().stream()
                .map(e -> new ImageDto(e.getKey(), e.getValue()))
                .toList();
    }

    private static Map<LocalDate, List<Serie>> groupByDate(Map<Serie, LocalDate> statsMap) {
        return statsMap.entrySet().stream()
                .collect(Collectors.groupingBy(Map.Entry::getValue,
                        Collectors.mapping(Map.Entry::getKey, Collectors.toList())));
    }

    private static List<ExercisesStatsDto> buildPerDateExerciseStats(List<LocalDate> sortedDates,
                                                                     Map<LocalDate, List<Serie>> byDate,
                                                                     Map<String, Integer> globalMaxByExercise) {
        List<ExercisesStatsDto> perDateExerciseStats = new ArrayList<>();
        for (LocalDate date : sortedDates) {
            List<Serie> seriesOfDay = byDate.get(date);
            Map<String, Integer> weights = new HashMap<>();
            Map<String, String> exerciseGroups = new HashMap<>();
            populateExerciseDayStats(seriesOfDay, weights, exerciseGroups);
            Map<String, Boolean> isPR = computeIsPR(weights, globalMaxByExercise);
            perDateExerciseStats.add(new ExercisesStatsDto(date, weights, exerciseGroups, isPR));
        }
        return perDateExerciseStats;
    }

    private static void populateExerciseDayStats(List<Serie> seriesOfDay,
                                                 Map<String, Integer> weights,
                                                 Map<String, String> exerciseGroups) {
        for (Serie s : seriesOfDay) {
            Exercise ex = s.getExercise();
            if (ex == null || ex.getExerciseName() == null) {
                continue;
            }
            String name = ex.getExerciseName();
            int weight = s.getPeso();
            Integer prev = weights.get(name);
            if (prev == null || weight > prev) {
                weights.put(name, weight);
            }
            if (ex.getGrupoMuscular() != null) {
                exerciseGroups.put(name, ex.getGrupoMuscular().name());
            }
        }
    }

    private static Map<String, Boolean> computeIsPR(Map<String, Integer> weights,
                                                    Map<String, Integer> globalMaxByExercise) {
        Map<String, Boolean> isPR = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> e : weights.entrySet()) {
            Integer globalMax = globalMaxByExercise.get(e.getKey());
            isPR.put(e.getKey(), globalMax != null && e.getValue() != null && e.getValue().intValue() == globalMax.intValue());
        }
        return isPR;
    }

    private static List<MuscularGroupsStatsDto> buildPerDateMuscleStats(List<LocalDate> sortedDates,
                                                                        Map<LocalDate, List<Serie>> byDate) {
        List<MuscularGroupsStatsDto> perDateMuscleStats = new ArrayList<>();
        for (LocalDate date : sortedDates) {
            List<Serie> seriesOfDay = byDate.get(date);
            Map<String, Integer> counts = new HashMap<>();
            for (Serie s : seriesOfDay) {
                Exercise ex = s.getExercise();
                if (ex == null || ex.getGrupoMuscular() == null) continue;
                String group = ex.getGrupoMuscular().name();
                counts.put(group, counts.getOrDefault(group, 0) + 1);
            }
            perDateMuscleStats.add(new MuscularGroupsStatsDto(date, counts));
        }
        return perDateMuscleStats;
    }
}
