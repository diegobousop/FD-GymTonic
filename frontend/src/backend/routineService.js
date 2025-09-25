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

