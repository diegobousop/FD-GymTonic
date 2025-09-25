import {
  fetchConfig,
  appFetch,
} from "./appFetch";

export const createRoutine = (name, exercises, duration, onSuccess, onErrors) => {
  appFetch(
    "/routines/createRoutine",
    fetchConfig("POST", { name, exercises, duration }),
    (createdRoutine) => onSuccess(createdRoutine),
    onErrors 
  );
};


export const viewAllRoutines = (onSuccess, onErrors) =>
  appFetch(
    "/routines/viewAllRoutines",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const deleteRoutine = (routineId, onSuccess, onErrors) =>
  appFetch(
    `/routines/deleteRoutine/${routineId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );

export const modifyRoutine = (routineId, name, exercises, duration, onSuccess, onErrors) =>
  appFetch(
    `/routines/modifyRoutine/${routineId}`,
    fetchConfig("PUT", { name, exercises, duration }),
    onSuccess,
    onErrors
  );

