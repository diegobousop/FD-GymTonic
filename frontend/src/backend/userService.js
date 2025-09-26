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
}

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
    onSuccess();
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

export const logout = () => removeServiceToken();

export const updateProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("PUT", user), onSuccess, onErrors);

export const changePassword = (oldPassword, newPassword, onSuccess, onErrors) => {
  const serviceToken = getServiceToken();
  if (!serviceToken) {
    if (onErrors) onErrors("No token disponible");
    return;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    if (onErrors) onErrors("No se encontró userId");
    return;
  }

  appFetch(
    `/users/${userId}/changePassword`,
    fetchConfig("POST", { oldPassword, newPassword }, serviceToken),
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
