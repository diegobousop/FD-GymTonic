import {
  fetchConfig,
  appFetch,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
  setReauthenticationCallback,
} from "./appFetch";

const processLoginSignUp = (authenticatedUser, reauthenticationCallback, onSuccess) => {
  setServiceToken(authenticatedUser.serviceToken);
  setReauthenticationCallback(reauthenticationCallback);
  if (onSuccess) {
    onSuccess(authenticatedUser);
  }
};

export const viewAllUsers = ({page, size}, onSuccess, onErrors) => 
  appFetch(
    `/users/getUsers?page=${page}`, 
    fetchConfig("GET"),
    onSuccess, 
    onErrors
  );
  
export const banUser = (userId, onSuccess, onErrors) => 
  appFetch(
    `/users/ban/${userId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );
    
export const blockUser = (userId, onSuccess, onErrors) => 
  appFetch(
    `/users/block/${userId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  )

export const login = (
  userName,
  password,
  onSuccess,
  onErrors,
  reauthenticationCallback
) =>
  appFetch(
    "/users/login",
    fetchConfig("POST", { userName, password }),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback, onSuccess);
    },
    onErrors
  );

export const tryLoginFromServiceToken = (
  onSuccess,
  reauthenticationCallback
) => {
  const serviceToken = getServiceToken();

  if (!serviceToken) {
    reauthenticationCallback();
    return;
  }

  setReauthenticationCallback(reauthenticationCallback);

  appFetch(
    "/users/loginFromServiceToken",
    fetchConfig("POST"),
    (authenticatedUser) => onSuccess(authenticatedUser),
    () => removeServiceToken()
  );
};

export const signUp = (user, onSuccess, onErrors, reauthenticationCallback) => {
  appFetch(
    "/users/signUp",
    fetchConfig("POST", user),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback, onSuccess);
    },
    onErrors
  );
};

export const getProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("GET"), onSuccess, onErrors);

export const logout = () => removeServiceToken();

export const updateProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("PUT", user), onSuccess, onErrors);

export const changePassword = (user, oldPassword, newPassword, onSuccess, onErrors) => {
  appFetch(
    `/users/${user.id}/changePassword`,
    fetchConfig("POST", { oldPassword, newPassword }),
    onSuccess,
    async (err) => {
      try {
        const json = await err.json();
        if (onErrors) onErrors(json.globalError || "Error al cambiar la contraseña");
      } catch {
        if (onErrors) onErrors("Error inesperado");
      }
    }
  );
};

export const getBlockedUsers = (onSuccess, onErrors) => 
  appFetch(
    `/users/getBlocked`,
    fetchConfig("GET"),
    onSuccess,
    async (err) => {
      onErrors("Error inesperado")
    }
  )

export const followUser = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/follow/${userId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );

export const unfollowUser = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/unfollow/${userId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );

export const getFollowers = ({page,size}, onSuccess, onErrors) =>
  appFetch(
    `/users/followers?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getFollowing = ({page,size}, onSuccess, onErrors) =>
  appFetch(
    `/users/following?page=${page}&size=${size}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getFollowersCount = (onSuccess, onErrors) =>
  appFetch(
    `/users/followers/count`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getFollowingCount = (onSuccess, onErrors) =>
  appFetch(
    `/users/following/count`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getGenders = (onSuccess, onErrors) =>
  appFetch(
    `/users/getGenders`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
export const sendFollowRequest = (receiverId, onSuccess, onErrors) =>
    appFetch(
        `/users/sendFollowRequest/${receiverId}`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );
export const acceptFollowRequest = (requestId, onSuccess, onErrors) =>
    appFetch(
        `/users/acceptFollowRequest/${requestId}`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );
export const rejectFollowRequest = (requestId, onSuccess, onErrors) =>
    appFetch(
        `/users/rejectFollowRequest/${requestId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );
export const getFollowRequests = (onSuccess, onErrors) =>
    appFetch(
        `/users/FollowRequest`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getRequestSended = (onSuccess, onErrors) => 
    appFetch(
      `/users/requestSended`,
      fetchConfig("GET"),
      onSuccess,
      onErrors
    );

