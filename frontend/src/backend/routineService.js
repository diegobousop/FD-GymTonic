import { fetchConfig, appFetch } from "./appFetch";

export const createRoutine = (name, exercises, duration, isPublic, onSuccess, onErrors) => {
  appFetch(
    "/routines/createRoutine",
    fetchConfig("POST", { name, exercises, duration, isPublic }),
    onSuccess,
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

export const findRoutineDetails = (routineId, onSuccess, onErrors) =>
  appFetch(
    `/routines/getRoutineDetailsById/${routineId}`,
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

export const searchRoutines = (creatorId, name, { page, size }, onSuccess, onErrors) =>
  appFetch(
    `/routines/search?creatorId=${creatorId || ""}&name=${name || ""}&page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const createTraining = (
  { routineId, name, description, duration, visibility, exercises },
  { onSuccess, onErrors } = {}
) => {
  appFetch(
    "/routines/createTraining",
    fetchConfig("POST", { routineId, name, description, duration, visibility, exercises }),
    onSuccess,
    onErrors
  );
};

export const followRoutine = (routineId, onSuccess, onErrors) => {
  appFetch(
    `/routines/${routineId}/follow`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );
};

export const unfollowRoutine = (routineId, onSuccess, onErrors) => {
  appFetch(
    `/routines/${routineId}/unfollow`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );
};

export const getFollowersByRoutine = (routineId, { page, size }, onSuccess, onErrors) => {
  appFetch(
    `/routines/${routineId}/followers?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const isFollowingRoutine = (routineId, onSuccess, onErrors) => {
  appFetch(
    `/routines/${routineId}/is-following`,
  );
};

export const getTrainingDetails = (trainingId, onSuccess, onErrors) => {
  appFetch(
    `/routines/trainings/${trainingId}/details`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
}

export const viewUserTrainings = (page, size, onSuccess, onErrors) => {
  appFetch(
    `/routines/findTrainings?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const viewDayTrainings = (page, size, day, month, year, onSuccess, onErrors) => {
  appFetch(
    `/routines/findDayTrainings?day=${day}&month=${month}&year=${year}&page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};


export const getTrainingCalendarStats = (year, onSuccess, onErrors) => {
  appFetch(
    `/routines/getTrainingCalendarStats?year=${year}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};


