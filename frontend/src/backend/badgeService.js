import {fetchConfig, appFetch} from './appFetch';

export const getEarnedBadges = (userId, onSuccess, onErrors) =>
    appFetch(`/badges/earned/${userId}`, fetchConfig('GET'), onSuccess, onErrors);

export const getMissingBadges = (userId, onSuccess, onErrors) =>
    appFetch(`/badges/missing/${userId}`, fetchConfig('GET'), onSuccess, onErrors);
