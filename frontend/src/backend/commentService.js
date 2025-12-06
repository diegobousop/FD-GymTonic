import { fetchConfig, appFetch } from "./appFetch";

export const addComment = (trainingId, mensaje, onSuccess, onErrors) => {
  appFetch(
    "/comment/addComment",
    fetchConfig("POST", { trainingId, mensaje}),
    onSuccess,
    onErrors
  );
};

export const getComments = (trainingId, { page, size }, onSuccess, onErrors) =>
  appFetch(
    `/comment/getComments/${trainingId}?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

  export const deleteComment = (commentId, trainingId, onSuccess, onErrors) =>
  appFetch(
    `/comment/deleteComment/${commentId}?trainingId=${trainingId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );