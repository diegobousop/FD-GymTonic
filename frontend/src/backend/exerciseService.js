import{
    fetchConfig,
    appFetch,
}from "./appFetch";

export const addExercise = (name, descripcion, grupoMuscular, onSuccess, onErrors) => {
    appFetch(
        "/exercise/addExercise",
        fetchConfig("POST", {name, descripcion, grupoMuscular}),
        (addExercise) => onSuccess(addExercise),
        onErrors
    );
};

export const getAllExercises = ({ page, size }, onSuccess, onErrors) => {
    appFetch(
        `/exercise/getExercises?page=${page}&size=${size}`,
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
