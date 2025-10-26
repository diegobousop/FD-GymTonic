import {
  fetchConfig,
  appFetch,
} from "./appFetch";


export const getNotifications = ({ page, size }, onSuccess, onErrors) =>
  appFetch(
    `/notifications/getNotifications?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );


export const readNotification = (notificationId, onSuccess, onErrors) =>
  appFetch(
    `/notifications/read/${notificationId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );

export const unreadNotification = (notificationId, onSuccess, onErrors) =>
  appFetch(
    `/notifications/unread/${notificationId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );