import { appFetch, fetchConfig } from "./appFetch.js";

const BASE_PATH = "/search";

export const getSearchSuggestions = (query, onSuccess, onErrors) => {
  const encodedQuery = encodeURIComponent(query);
  return appFetch(
    `${BASE_PATH}/suggestions?text=${encodedQuery}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const searchResults = (params, onSuccess, onErrors) => {
  // Construir query params
  const queryParams = new URLSearchParams();
  if (params.text) queryParams.append("text", params.text);
  if (params.trainerName) queryParams.append("trainerName", params.trainerName);
  if (params.muscleGroup) queryParams.append("muscleGroup", params.muscleGroup);
  if (params.difficulty) queryParams.append("difficulty", params.difficulty);
  if (params.limit) queryParams.append("limit", params.limit);

  return appFetch(
    `${BASE_PATH}/full?${queryParams.toString()}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};