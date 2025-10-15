import {
  fetchConfig,
  appFetch,
} from "./appFetch";

export const createRoutine = (name, exercises, duration, isPublic, onSuccess, onErrors) => {
  appFetch(
    "/routines/createRoutine",
    fetchConfig("POST", { name, exercises, duration, isPublic }),
    (createdRoutine) => onSuccess(createdRoutine),
    onErrors 
  );
};

export const findRoutineById = (routineId, onSuccess, onErrors) =>
  appFetch(
    `/routines/getRoutineById/${routineId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const viewAllRoutines = ({ page, size }, onSuccess, onErrors) =>
  appFetch(
    `/routines/viewAllRoutines?page=${page}&size=${size}`,
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

export const modifyRoutine = (routineId, name, exercises, duration, isPublic, onSuccess, onErrors) =>
  appFetch(
    `/routines/modifyRoutine/${routineId}`,
    fetchConfig("PUT", { name, exercises, duration, isPublic }),
    onSuccess,
    onErrors
  );

