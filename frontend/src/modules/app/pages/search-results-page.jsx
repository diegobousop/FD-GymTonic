import React, { useEffect, useState, useCallback, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchResults } from "../../../backend/searchService.js";
import Routine from "../components/routine/routine-card.jsx";
import { UserContext } from "../components/common/user-provider";
import backend from "../../../backend";
import { useToast } from "../components/common/toast-provider.jsx";

const SearchResultsPage = () => {
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({
    users: [],
    routines: [],
    exercises: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemTypeFilter, setItemTypeFilter] = useState("TODO");
  const { showToast } = useToast();

  const query = searchParams.get("text") || "";
  const trainerName = searchParams.get("trainerName") || "";
  const muscleGroup = searchParams.get("muscleGroup") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const equipment = searchParams.get("equipment") || "";
  const size = 5;

  // --------------------
  // Callbacks refactorizados
  // --------------------
  const processRoutine = (routine) => ({
    id: routine.id,
    name: routine.name,
    duration: routine.duration,
    creator: routine.creatorUsername,
    exercises:
      routine.exercises?.map((e) => ({
        name: e.name,
        numeroSeries: e.numeroSeries ?? 0,
      })) || [],
    difficulty: routine.difficulty || "INTERMEDIO",
  });

  const onSearchSuccess = (data) => {
    setResults({
      users: data.users,
      routines: data.routines.map(processRoutine),
      exercises: data.exercises,
    });
    setLoading(false);
  };

  const onSearchError = () => {
    setError("Error al cargar los resultados");
    setLoading(false);
  };

  // --------------------
  // Fetch resultados
  // --------------------
  const fetchResults = useCallback(() => {
    if (!query.trim()) {
      setResults({ users: [], routines: [], exercises: [] });
      return;
    }

    setLoading(true);
    setError(null);

    searchResults(
      { text: query, trainerName, muscleGroup, difficulty, equipment, page: 0, size },
      onSearchSuccess,
      onSearchError
    );
  }, [query, trainerName, muscleGroup, difficulty, equipment]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    backend.userService.getBlockedUsers(
      (data) => {
        user.idBlocked = data;
      },
      (err) => setError(err || "Error inesperado al recuperar usuarios baneados")
    );
  }, []);

  // --------------------
  // Acciones usuario
  // --------------------
  const updateUserState = (userId, changes) => {
    setResults((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...changes } : u)),
    }));
  };

  const getUserName = (userId) =>
    results.users.find((u) => u.id === userId)?.name || "este usuario";

  const handleFollowUser = (userId) => {
    const userName = getUserName(userId);
    backend.userService.followUser(
      userId,
      (success) => {
        updateUserState(userId, { isFollowing: true });
        showToast(
          success ? `Has comenzado a seguir a ${userName}` : `Ya sigues a ${userName}`,
          success ? "success" : "error"
        );
      },
      () => showToast("Error al seguir al usuario.", "error")
    );
  };

  const handleUnfollowUser = (userId) => {
    const userName = getUserName(userId);
    backend.userService.unfollowUser(
      userId,
      (success) => {
        updateUserState(userId, { isFollowing: false });
        showToast(
          success ? `Has dejado de seguir a ${userName}` : `No seguías a ${userName}`,
          success ? "success" : "error"
        );
      },
      () => showToast("Error al dejar de seguir al usuario.", "error")
    );
  };

  const handleBlockUser = (userId) => {
    const userName = getUserName(userId);
    backend.userService.blockUser(
      userId,
      (success) => {
        if (success) {
          updateUserState(userId, { isBlocked: true });
          if (!user.idBlocked) user.idBlocked = [];
          user.idBlocked.push(userId);
          showToast(`Has bloqueado a ${userName}`, "success");
        } else {
          showToast(`Ya tenías bloqueado a ${userName}`, "error");
        }
      },
      () => showToast("Error al bloquear al usuario.", "error")
    );
  };

  const shouldShowUsers = itemTypeFilter === "TODO" || itemTypeFilter === "USUARIOS";
  const shouldShowRoutines = itemTypeFilter === "TODO" || itemTypeFilter === "RUTINAS";
  const shouldShowExercises = itemTypeFilter === "TODO" || itemTypeFilter === "EJERCICIOS";

  // --------------------
  // Helpers de render
  // --------------------
  const renderUsers = () => (
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
                <img src={userItem.avatarBase64} alt={userItem.name} className="w-10 h-10 object-cover" />
              )}
              <Link to={`/profile/${userItem.id}`} className="inline-block w-fit text-white hover:text-[#CA0D0A]">
                {userItem.name}
              </Link>
            </div>

            {userItem.id !== user.id && (
              <div className="flex gap-2">
                {!userItem.isBanned && (
                  <button
                    onClick={() => (userItem.isFollowing ? handleUnfollowUser(userItem.id) : handleFollowUser(userItem.id))}
                    className={`${
                      userItem.isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
                    } text-white px-3 py-1 rounded-md text-sm`}
                  >
                    {userItem.isFollowing ? "Dejar de seguir" : "Seguir"}
                  </button>
                )}

                {userItem.id !== user.id &&
                  user.role !== "ADMIN" &&
                  userItem.rol !== "ADMIN" && (
                    <button
                      onClick={() => handleBlockUser(userItem.id)}
                      disabled={user.idBlocked?.includes(userItem.id)}
                      className={`${
                        user.idBlocked?.includes(userItem.id) ? "bg-red-900 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                      } text-white px-3 py-1 rounded-md text-sm`}
                    >
                      {user.idBlocked?.includes(userItem.id) ? "Bloqueado" : "Bloquear"}
                    </button>
                  )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderRoutines = () => (
    <div>
      <h2 className="font-semibold mb-2">Rutinas</h2>
      <div className="flex flex-col space-y-4 mt-4 ml-4 mr-4">
        {results.routines.map((routine) => (
          <Routine routine={routine} key={routine.id} />
        ))}
      </div>
    </div>
  );

  const renderExercises = () => (
    <div>
      <h2 className="font-semibold mb-2 text-lg">Ejercicios</h2>
      <ul className="space-y-3">
        {results.exercises.map((exercise) => (
          <li
            key={exercise.id}
            className="border border-gray-700 p-3 rounded-lg shadow-md flex justify-between items-center hover:bg-gray-800 transition"
          >
            <span className="font-bold text-white text-lg">{exercise.name}</span>

            <div className="flex flex-row items-center gap-4">
              <span className="text-sm text-gray-300">
                Grupo muscular: {exercise.grupoMuscular}
              </span>
              <span className="text-sm text-gray-400">
                Equipamiento: {exercise.equipment || "N/A"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // --------------------
  // Render principal
  // --------------------
  let content;
  if (loading) {
    content = <p>Cargando resultados...</p>;
  } else if (error) {
    content = <p className="text-red-500">{error}</p>;
  } else {
    content = (
      <div className="flex flex-col gap-6">
        {shouldShowUsers && results.users.length > 0 && renderUsers()}
        {shouldShowRoutines && results.routines.length > 0 && renderRoutines()}
        {shouldShowExercises && results.exercises.length > 0 && renderExercises()}
        {!results.users.length && !results.routines.length && !results.exercises.length && (
          <p className="text-gray-400">No se encontraron resultados.</p>
        )}
      </div>
    );
  }

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
            onClick={() => setItemTypeFilter(type)}
          >
            {type === "TODO" ? "Todo" : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {content}
    </div>
  );
};

export default SearchResultsPage;
