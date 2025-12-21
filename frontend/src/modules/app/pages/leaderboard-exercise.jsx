import { useState, useEffect } from "react";
import backend from "../../../backend";


const PAGE_SIZE = 3;

const LeaderboardsPage = () => {
    const [exercises, setExercises] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [page, setPage] = useState(0);
    const [existMoreItems, setExistMoreItems] = useState(false);

    const [leaderboardType, setLeaderboardType] = useState("exercise");
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    const [loadingExercises, setLoadingExercises] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [loadingRoutines, setLoadingRoutines] = useState(false);
    const [error, setError] = useState("");
    const userId = Number(localStorage.getItem("userId"));

    /* =========================
       Cargar ejercicios
       ========================= */
    useEffect(() => {
        if (leaderboardType !== "exercise") return;

        setLoadingExercises(true);
        setExercises([]);
        setExistMoreItems(false);

        backend.exerciseService.getValidatedExercises(
            { page, size: PAGE_SIZE },
            (response) => {
                try {
                    // Manejar la respuesta que puede ser un objeto con items o un array
                    let items = [];
                    let hasMore = false;

                    if (Array.isArray(response)) {
                        items = response;
                    } else if (response && typeof response === 'object') {
                        items = response.items || [];
                        hasMore = response.existMoreItems || false;
                    }

                    setExercises(items);
                    setExistMoreItems(hasMore);
                } catch (err) {
                    console.error("Error procesando ejercicios:", err);
                    setExercises([]);
                    setExistMoreItems(false);
                } finally {
                    setLoadingExercises(false);
                }
            },
            (error) => {
                console.error("Error cargando ejercicios:", error);
                setExercises([]);
                setExistMoreItems(false);
                setLoadingExercises(false);
            }
        );
    }, [page, leaderboardType]);

    /* =========================
       Cargar rutinas
       ========================= */
    useEffect(() => {
        if (leaderboardType !== "routine") return;

        setLoadingRoutines(true);
        setRoutines([]);

        backend.routineService.viewAllRoutines(
            { page: 0, size: PAGE_SIZE },
            (response) => {
                try {
                    // Manejar la respuesta que puede ser un objeto con items o un array
                    let items = [];

                    if (Array.isArray(response)) {
                        items = response;
                    } else if (response && typeof response === 'object') {
                        // Extraer items del objeto de respuesta
                        items = response.items || [];
                    }

                    setRoutines(items);
                } catch (err) {
                    console.error("Error procesando rutinas:", err);
                    setRoutines([]);
                } finally {
                    setLoadingRoutines(false);
                }
            },
            (error) => {
                console.error("Error cargando rutinas:", error);
                setRoutines([]);
                setLoadingRoutines(false);
            }
        );
    }, [leaderboardType]);

    /* =========================
       Cargar leaderboard
       ========================= */
    const loadLeaderboard = ({ exerciseId, routineId }) => {
        setLoadingLeaderboard(true);
        setError("");
        setLeaderboard([]);

        const serviceCall =
            leaderboardType === "exercise"
                ? backend.userService.getLeaderboard
                : backend.userService.getLeaderboardRoutine;

        const params = leaderboardType === "exercise"
            ? { exerciseId }
            : { routineId };

        serviceCall(
            params,
            async (response) => {
                try {
                    // Manejar la respuesta que puede ser un objeto con items o un array
                    let leaderboardData = [];

                    if (Array.isArray(response)) {
                        leaderboardData = response;
                    } else if (response && typeof response === 'object') {
                        // Si es un objeto con items, extraerlos
                        leaderboardData = response.items || response.leaderboard || [];
                    }

                    const leaderboardWithProfiles = await Promise.all(
                        leaderboardData.map(
                            (entry) =>
                                new Promise((resolve) => {
                                    if (!entry || !entry.userId) {
                                        resolve({
                                            ...entry,
                                            profile: {
                                                userName: "Usuario",
                                                avatar: { avatarBase64: "/default-profile.png" },
                                            },
                                        });
                                        return;
                                    }

                                    backend.userService.getProfile(
                                        { id: entry.userId },
                                        (profile) => resolve({ ...entry, profile }),
                                        () =>
                                            resolve({
                                                ...entry,
                                                profile: {
                                                    userName: "Usuario",
                                                    avatar: { avatarBase64: "/default-profile.png" },
                                                },
                                            })
                                    );
                                })
                        )
                    );

                    setLeaderboard(leaderboardWithProfiles);
                } catch (err) {
                    console.error("Error procesando leaderboard:", err);
                    setError("Error al cargar los perfiles");
                    setLeaderboard([]);
                } finally {
                    setLoadingLeaderboard(false);
                }
            },
            (error) => {
                console.error("Error cargando leaderboard:", error);
                setError("Error al cargar el ranking");
                setLoadingLeaderboard(false);
            }
        );
    };


    /* =========================
       Handlers
       ========================= */
    const handleExerciseSelect = (exerciseId) => {
        if (!exerciseId) return;
        setSelectedExerciseId(exerciseId);
        loadLeaderboard({ exerciseId });
    };

    const handleRoutineSelect = (routineId) => {
        if (!routineId) return;
        setSelectedRoutineId(routineId);
        loadLeaderboard({ routineId });
    };

    const handleLeaderboardTypeChange = (type) => {
        if (leaderboardType === type) return;

        setLeaderboardType(type);
        setPage(0);
        setLeaderboard([]);
        setSelectedExerciseId(null);
        setSelectedRoutineId(null);
        setExistMoreItems(false);
        setError("");
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(prev => prev - 1);
            setSelectedExerciseId(null);
            setLeaderboard([]);
        }
    };

    const handleNextPage = () => {
        if (existMoreItems) {
            setPage(prev => prev + 1);
            setSelectedExerciseId(null);
            setLeaderboard([]);
        }
    };

    /* =========================
       Render helpers
       ========================= */
    const renderExercises = () => {
        if (loadingExercises) return <p className="text-gray-400 text-sm text-center">Cargando ejercicios...</p>;

        const exercisesArray = Array.isArray(exercises) ? exercises : [];

        if (exercisesArray.length === 0 && !loadingExercises)
            return <p className="text-gray-400 text-sm text-center">No hay ejercicios disponibles</p>;

        return exercisesArray.map((exercise) => {
            if (!exercise || !exercise.id) return null;

            return (
                <button
                    key={exercise.id}
                    onClick={() => handleExerciseSelect(exercise.id)}
                    className={`w-full text-left p-3 rounded-lg mb-2 ${
                        selectedExerciseId === exercise.id ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                    {exercise.name || "Ejercicio sin nombre"}
                </button>
            );
        }).filter(Boolean);
    };

    const renderRoutines = () => {
        if (loadingRoutines) return <p className="text-gray-400 text-sm text-center">Cargando rutinas...</p>;

        const routinesArray = Array.isArray(routines) ? routines : [];

        if (routinesArray.length === 0 && !loadingRoutines)
            return <p className="text-gray-400 text-sm text-center">No hay rutinas disponibles</p>;

        return routinesArray.map((routine) => {
            if (!routine || !routine.id) return null;

            return (
                <button
                    key={routine.id}
                    onClick={() => handleRoutineSelect(routine.id)}
                    className={`w-full text-left p-3 rounded-lg mb-2 ${
                        selectedRoutineId === routine.id ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                    {routine.name || "Rutina sin nombre"}
                </button>
            );
        }).filter(Boolean);
    };

    const renderLeaderboard = () => {
        if (loadingLeaderboard) return <p className="text-gray-400 text-sm text-center">Cargando ranking...</p>;
        if (error) return <p className="text-red-400 text-sm text-center">{error}</p>;

        const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];

        if (leaderboardArray.length === 0)
            return (
                <p className="text-gray-400 text-sm text-center">
                    {leaderboardType === "exercise"
                        ? "Selecciona un ejercicio para ver el ranking"
                        : "Selecciona una rutina para ver el ranking"}
                </p>
            );

        return leaderboardArray.map((entry, index) => {
            if (!entry) return null;

            const name = entry.profile?.userName || "Usuario";
            const imageUrl = entry.profile?.avatar?.avatarBase64 || "/default-profile.png";
            const score = entry.score || 0;
            const userId = entry.userId || index;

            return (
                <div key={`${userId}-${index}`} className="grid grid-cols-4 py-1 items-center gap-2">
                    <span
                        className={`
                        ${index < 3 ? "font-bold" : ""}
                        ${index === 0 ? "text-yellow-400" : ""}
                        ${index === 1 ? "text-gray-300" : ""}
                        ${index === 2 ? "text-amber-700" : ""}
                    `}
                    >
                        {index + 1}
                    </span>
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                            e.target.src = "/default-profile.png";
                        }}
                    />
                    <span className="truncate">{name}</span>
                    <span className="text-right font-semibold">{score}</span>
                </div>
            );
        }).filter(Boolean);
    };


    /* =========================
       Render principal
       ========================= */
    return (
        <div className="flex justify-center mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                <div className="col-span-full flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => handleLeaderboardTypeChange("exercise")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            leaderboardType === "exercise" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Por ejercicio
                    </button>
                    <button
                        onClick={() => handleLeaderboardTypeChange("routine")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            leaderboardType === "routine" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Por rutina
                    </button>
                </div>

                {/* Columna izquierda */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-gray-200">
                    <h2 className="text-lg font-bold mb-4 text-center">
                        {leaderboardType === "exercise" ? "Ejercicios" : "Rutinas"}
                    </h2>
                    {leaderboardType === "exercise" ? renderExercises() : renderRoutines()}
                    {leaderboardType === "exercise" && (
                        <div className="flex justify-between items-center mt-4">
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 0}
                                className={`px-3 py-1 rounded-lg text-sm ${
                                    page === 0
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-600 hover:bg-gray-500 text-white"
                                }`}
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-400">Página {page + 1}</span>
                            <button
                                onClick={handleNextPage}
                                disabled={!existMoreItems}
                                className={`px-3 py-1 rounded-lg text-sm ${
                                    !existMoreItems
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-600 hover:bg-gray-500 text-white"
                                }`}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>

                {/* Columna derecha */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-gray-200">
                    <h2 className="text-lg font-bold mb-4 text-center">Ranking</h2>
                    <div className="grid grid-cols-3 py-2 text-xs font-semibold border-b border-gray-700">
                        <span className="text-center">#</span>
                        <span>Usuario</span>
                        <span className="text-right">Puntuación</span>
                    </div>
                    <div className="divide-y divide-gray-800 mt-2">{renderLeaderboard()}</div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardsPage;