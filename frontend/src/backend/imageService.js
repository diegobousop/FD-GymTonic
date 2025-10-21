import{
    fetchConfig,
    appFetch,
}from "./appFetch";

export const getAllBackgrounds = (onSuccess, onErrors) => {
    appFetch(
        `/images/getAllBackgrounds`,
        fetchConfig("GET"),
        (response) => onSuccess(response),
        onErrors
    )
};

export const getImageByName = (imageName, onSuccess, onErrors) => {
    appFetch(
        `/images/getByName/${imageName}`,
        fetchConfig("GET"),
        (response) => onSuccess(response),
        onErrors
    )
};

export const getAllAvatars = (page,size,onSuccess, onErrors) => {
    appFetch(
        `/images/getAllAvatars?page=${page}&size=${size}`,
        fetchConfig("GET"),
        (response) => onSuccess(response),
        onErrors
    )
};