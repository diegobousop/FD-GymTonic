import{
    fetchConfig,
    appFetch,
}from "./appFetch";

export const addExercise = (name, descripcion, grupoMuscular,numeroSeries, onSuccess, onErrors) => {
    appFetch(
        "/exercise/addExercise",
        fetchConfig("POST", {name, descripcion, grupoMuscular, numeroSeries}),
        (addExercise) => onSuccess(addExercise),
        onErrors
    );
};

export const getAllExercises = (page, onSuccess, onErrors) => {
    appFetch(
        `/exercise/getExercises?page=${page}`,
        fetchConfig("GET"),
        (exercises) => onSuccess(exercises),
        onErrors
    );
}
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
export const createSerie = (exercise, numSeries, onSuccess, onErrors) =>
    appFetch(
        `/exercise/Series?numSeries=${numSeries}`,
        fetchConfig("POST", exercise),
        onSuccess,
        onErrors
    );
export const getSerieByExercise = (exerciseId, onSuccess, onErrors) =>
    appFetch(`/exercise/exerciseSeries`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );