import React, { useEffect, useState, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { searchResults } from "../../../backend/searchService.js";
import Routine from "../components/common/routine.jsx";
import { UserContext } from "../components/common/user-provider";
import backend from "../../../backend/index.js";
import { useToast } from "../components/common/toast-provider.jsx";

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

  const filterByType = (type) => setItemTypeFilter(type);

  // Seguir usuario
  const handleFollowUser = (userId) => {
    const targetUser = results.users.find(u => u.id === userId);
    const userName = targetUser?.name || "este usuario";

    backend.userService.followUser(
      userId,
      (success) => {
        if (success) {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isFollowing: true } : u
            ),
          }));
          showToast(`Has comenzado a seguir a ${userName}`, 'success');
        } else {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isFollowing: true } : u
            ),
          }));
          showToast(`Ya sigues a ${userName}`, 'error');
        }
      },
      (error) => {
        console.error(error);
        showToast("Error al seguir al usuario.", 'error');
      }
    );
  };

  // Dejar de seguir usuario
  const handleUnfollowUser = (userId) => {
    const targetUser = results.users.find(u => u.id === userId);
    const userName = targetUser?.name || "este usuario";

    backend.userService.unfollowUser(
      userId,
      (success) => {
        if (success) {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isFollowing: false } : u
            ),
          }));
          showToast(`Has dejado de seguir a ${userName}`, 'success');
        } else {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isFollowing: false } : u
            ),
          }));
          showToast(`No seguías a ${userName}`, 'error');
        }
      },
      (error) => {
        console.error(error);
        showToast("Error al dejar de seguir al usuario.", 'error');
      }
    );
  };

  // 🔒 Bloquear usuario
  const handleBlockUser = (userId) => {
    const targetUser = results.users.find(u => u.id === userId);
    const userName = targetUser?.name || "este usuario";

    backend.userService.blockUser(
      userId,
      (success) => {
        if (success) {
          setResults((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, isBlocked: true, isFollowing: false } : u
            ),
          }));
          showToast(`Has bloqueado a ${userName}`, 'success');
        } else {
          showToast(`Ya tenías bloqueado a ${userName}`, 'error');
        }
      },
      (error) => {
        console.error(error);
        showToast("Error al bloquear al usuario.", 'error');
      }
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
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <span>{userItem.name}</span>
                      </div>
                      {userItem.id !== user.id && (
                        <div className="flex gap-2">
                          {!userItem.isBlocked && (
                            <button
                              onClick={() =>
                                userItem.isFollowing
                                  ? handleUnfollowUser(userItem.id)
                                  : handleFollowUser(userItem.id)
                              }
                              className={`${
                                userItem.isFollowing
                                  ? "bg-gray-600 hover:bg-gray-700"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white px-3 py-1 rounded-md text-sm`}
                            >
                              {userItem.isFollowing ? "Dejar de seguir" : "Seguir"}
                            </button>
                          )}
                          <button
                            onClick={() => handleBlockUser(userItem.id)}
                            disabled={userItem.isBlocked}
                            className={`${
                              userItem.isBlocked
                                ? "bg-red-900 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            } text-white px-3 py-1 rounded-md text-sm`}
                          >
                            {userItem.isBlocked ? "Bloqueado" : "Bloquear"}
                          </button>
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
