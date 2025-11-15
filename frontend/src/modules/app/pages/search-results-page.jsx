import React, { useEffect, useState, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { searchResults } from "../../../backend/searchService.js";
import Routine from "../components/common/routine.jsx";
import { UserContext } from "../components/common/user-provider";
import backend from "../../../backend";
import {useToast} from "../components/common/toast-provider.jsx";
import { Link } from "react-router-dom";


const SearchResultsPage = () => {
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({ users: [], routines: [], exercises: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemTypeFilter, setItemTypeFilter] = useState("TODO");
  const { showToast } = useToast();


  const query = searchParams.get("text") || "";
  const trainerName = searchParams.get("trainerName") || "";
  const muscleGroup = searchParams.get("muscleGroup") || "";
  const size = 5;

  const fetchResults = useCallback(() => {
    if (!query.trim()) {
      setResults({ users: [], routines: [], exercises: [] });
      return;
    }

    setLoading(true);
    setError(null);

    searchResults(
      { text: query, trainerName, muscleGroup, page: 0, size },
      (data) => {
        const routinesWithSeries = data.routines.map((routine) => ({
          id: routine.id,
          name: routine.name,
          duration: routine.duration,
          creator: routine.creatorUsername,
          exercises:
            routine.exercises?.map((e) => ({
              name: e.name,
              numeroSeries: e.numeroSeries ?? 0,
            })) || [],
          dificultad: routine.dificultad || "INTERMEDIO",
        }));

        setResults({ ...data, routines: routinesWithSeries });
        setLoading(false);
      },
      () => {
        setError("Error al cargar los resultados");
        setLoading(false);
      }
    );
  }, [query, trainerName, muscleGroup]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    backend.userService.getBlockedUsers(
      (data) => {
        user.idBlocked = data;
      },
      (err) => {setError(err || "Error inesperado al recuperar usuarios baneados")}
    )
  }, []);

  const filterByType = (type) => setItemTypeFilter(type);

  // Seguir usuario
  const handleFollowUser = (userId) => {
    const targetUser = results.users.find((u) => u.id === userId);
    const userName = targetUser?.name || "este usuario";
    const targetRole = targetUser?.rol;

    if (!targetUser) {
      showToast("No se encontró el usuario.", "error");
      return;
    }

    // TRAINER / ADMIN → seguir directamente
    if (targetRole === "TRAINER" || targetRole === "ADMIN") {
      backend.userService.followUser(
          userId,
          () => {
            setResults((prev) => ({
              ...prev,
              users: prev.users.map((u) =>
                  u.id === userId ? { ...u, isFollowing: true } : u
              ),
            }));
            showToast(`Has comenzado a seguir a ${userName}`, "success");
          },
          () => showToast("Error al seguir al usuario.", "error")
      );
      return;
    }


    if (targetRole === "USER") {
        backend.userService.sendFollowRequest(
            userId,
            () => {
                setResults((prev) => ({
                    ...prev,
                    users: prev.users.map((u) =>
                        u.id === userId ? { ...u, requestSent: true } : u
                    ),
                }));
                showToast(`Solicitud enviada a ${userName}`, "success");
            },
            () => showToast("Error al enviar la solicitud.", "error")
        );
      return;
    }

    // ROL desconocido
    showToast("No se puede seguir a este usuario.", "error");
  };

  // Dejar de seguir usuario
  const handleUnfollowUser = (userId) => {
    const targetUser = results.users.find((u) => u.id === userId);
    const userName = targetUser?.name || "este usuario";

    backend.userService.unfollowUser(
        userId,
        () => {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isFollowing: false } : u
            ),
          }));
          showToast(`Has dejado de seguir a ${userName}`, "success");
        },
        () => showToast("Error al dejar de seguir al usuario.", "error")
    );
  };

  // Bloquear usuario
  const handleBlockUser = (userId) => {
    const targetUser = results.users.find((u) => u.id === userId);
    const userName = targetUser?.name || "este usuario";

    backend.userService.blockUser(
        userId,
        () => {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map(u =>
              u.id === userId ? { ...u, isBlocked: true } : u
            )
          }));
  
          if (!user.idBlocked) user.idBlocked = [];
          user.idBlocked.push(userId);

          showToast(`Has bloqueado a ${userName}`, "success");
        },
        () => showToast("Error al bloquear al usuario.", "error")
    );
  };

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10 text-white pb-16">
      <p className="mb-4 text-gray-300">
        Mostrando resultados para: <b>{query || "..."}</b>
      </p>

      <div className="mb-6 flex gap-2">
        {["TODO", "RUTINAS", "EJERCICIOS", "USUARIOS"].map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-md text-sm transition ${
              itemTypeFilter === type ? "bg-red-600" : "bg-gray-700"
            } hover:bg-gray-600`}
            onClick={() => filterByType(type)}
          >
            {type === "TODO" ? "Todo" : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando resultados...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {(itemTypeFilter === "TODO" || itemTypeFilter === "USUARIOS") &&
              results.users?.length > 0 && (
                  <div>
                    <h2 className="font-semibold mb-2">Usuarios</h2>
                    <ul className="space-y-2">
                      {results.users.map((userItem) => (
                          <li
                              key={userItem.id}
                              className="border border-gray-700 p-2 rounded-md shadow-sm flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {userItem.avatarBase64 && (
                                  <img
                                      src={userItem.avatarBase64}
                                      alt={userItem.name}
                                      className="w-10 h-10 object-cover"
                                  />
                              )}
                              <Link
                                  to={`/profile/${userItem.id}`}
                                  className="text-white hover:text-[#CA0D0A] cursor-pointer"
                              >
                                {userItem.name}
                              </Link>
                            </div>

                            {userItem.id !== user.id && (
                                <div className="flex gap-2">

                                    <button
                                        onClick={() =>
                                            userItem.isFollowing
                                                ? handleUnfollowUser(userItem.id)
                                                : !userItem.requestSent && handleFollowUser(userItem.id)
                                        }
                                        disabled={userItem.requestSent}
                                        className={`${
                                            userItem.isFollowing
                                                ? "bg-gray-600 hover:bg-gray-700"
                                                : userItem.requestSent
                                                    ? "bg-yellow-700 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-700"
                                        } text-white px-3 py-1 rounded-md text-sm`}
                                    >
                                        {userItem.isFollowing
                                            ? "Dejar de seguir"
                                            : userItem.requestSent
                                                ? "Solicitud enviada"
                                                : "Seguir"}
                                    </button>
                                    {user.role !== "ADMIN" && userItem.role !== "ADMIN" && (
                                        <button
                                            onClick={() => handleBlockUser(userItem.id)}
                                            disabled={user.idBlocked?.includes(userItem.id)}
                                            className={`${
                                                user.idBlocked?.includes(userItem.id)
                                                    ? "bg-red-900 cursor-not-allowed"
                                                    : "bg-red-600 hover:bg-red-700"
                                            } text-white px-3 py-1 rounded-md text-sm`}
                                      >
                                        {user.idBlocked?.includes(userItem.id)
                                            ? "Bloqueado"
                                            : "Bloquear"}
                                      </button>
                                  )}
                                </div>
                            )}
                          </li>
                      ))}
                    </ul>
                  </div>
              )}

          {(itemTypeFilter === "TODO" || itemTypeFilter === "RUTINAS") &&
            results.routines?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Rutinas</h2>
                <div className="flex flex-col space-y-4 mt-4 ml-4 mr-4">
                  {results.routines.map((routine) => (
                    <Routine routine={routine} key={routine.id} />
                  ))}
                </div>
              </div>
            )}

          {(itemTypeFilter === "TODO" || itemTypeFilter === "EJERCICIOS") &&
            results.exercises?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Ejercicios</h2>
                <ul className="space-y-2">
                  {results.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="border border-gray-700 p-2 rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-gray-300">
                          {exercise.grupoMuscular}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {!results.users?.length &&
            !results.routines?.length &&
            !results.exercises?.length && (
              <p className="text-gray-400">No se encontraron resultados.</p>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
