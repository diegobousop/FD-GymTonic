import{
    fetchConfig,
    appFetch,
}from "./appFetch";

export const addExercise = (name, descripcion, grupoMuscular, numeroSeries, difficulty, equipment, onSuccess, onErrors) => {
    appFetch(
        "/exercise/addExercise",
        fetchConfig("POST", {name, descripcion, grupoMuscular, numeroSeries, difficulty, equipment}),
        (addExercise) => onSuccess(addExercise),
        onErrors
    );
};

export const getValidatedExercises = ({ page, size }, onSuccess, onErrors) => {
    appFetch(
        `/exercise/getValidatedExercises?page=${page}&size=${size}`,
        fetchConfig("GET"),
        (exercises) => onSuccess(exercises),
        onErrors
    );
};

export const getUnvalidatedExercises = ({ page, size }, onSuccess, onErrors) => {
    appFetch(
        `/exercise/getUnvalidatedExercises?page=${page}&size=${size}`,
        fetchConfig("GET"),
        (exercises) => onSuccess(exercises),
        onErrors
    );
};


export const validateExercise = (exerciseId, onSuccess, onErrors) => {
    appFetch(
        `/exercise/validateExercise/${exerciseId}`,
        fetchConfig("POST"),
        (response) => onSuccess(response),
        onErrors
    );
};

export const declineExercise = (exerciseId, onSuccess, onErrors) => {
    appFetch(
        `/exercise/declineExercise/${exerciseId}`,
        fetchConfig("POST"),
        (response) => onSuccess(response),
        onErrors
    );
    };
export const getSerie = (serieId,onSuccess,onErrors)=>
    appFetch(
        `/exercise/Series?serieId=${serieId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
export const modifySerie = (serieId, repeticiones, peso, onSuccess, onErrors) =>
    appFetch(`/exercise/Series`,
        fetchConfig("PUT",{serieId,repeticiones,peso}),
        onSuccess,
        onErrors
    );
export const createSerie = (exercise, numSeries,routineId, onSuccess, onErrors) =>
    appFetch(
        `/exercise/Series?numSeries=${numSeries}&routineId=${routineId}`,
        fetchConfig("POST", exercise),
        onSuccess,
        onErrors
    );
export const getSerieByExercise = (exerciseId,routineId, onSuccess, onErrors) =>
    appFetch(`/exercise/exerciseSeries?exerciseId=${exerciseId}&routineId=${routineId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );