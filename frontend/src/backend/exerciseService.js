import{
    fetchConfig,
    appFetch,
}from "./appFetch";

export const addExercise = (name, descripcion, grupoMuscular, onSuccess, onErrors) => {
    appFetch(
        "/admin/addExercise",
        fetchConfig("POST", {name, descripcion, grupoMuscular}),
        (addExercise) => onSuccess(addExercise),
        onErrors
    );
};