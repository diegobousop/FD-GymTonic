import { useState, useEffect } from "react";
import backend from "../../../backend";


const PAGE_SIZE = 3;
const LeaderboardsPage = () => {
    /* =========================
       Estado
       ========================= */
    const [exercises, setExercises] = useState([]);
    const [page, setPage] = useState(0);
    const [existMoreItems, setExistMoreItems] = useState(false);

    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    const [loadingExercises, setLoadingExercises] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [error, setError] = useState("");
    const userId = Number(localStorage.getItem("userId"));

    /* =========================
       Cargar ejercicios (paginado)
       ========================= */
    useEffect(() => {
        setLoadingExercises(true);

        backend.exerciseService.getValidatedExercises(
            { page, size: PAGE_SIZE },
            (block) => {
                setExercises(block.items || []);
                setExistMoreItems(block.existMoreItems);
                setLoadingExercises(false);
            },
            () => {
                setExercises([]);
                setLoadingExercises(false);
            }
        );
    }, [page]);

    /* =========================
       Cargar leaderboard
       ========================= */
    const loadLeaderboard = (exerciseId) => {
        if (!exerciseId) return;

        setLoadingLeaderboard(true);
        setError("");
        setLeaderboard([]);

        backend.userService.getLeaderboard(
            { exerciseId },
            async (data) => {
                try {
                    const leaderboardWithProfiles = await Promise.all(
                        (data || []).map(
                            (entry) =>
                                new Promise((resolve) => {
                                    backend.userService.getProfile(
                                        { id: entry.userId },
                                        (profile) => {
                                            resolve({
                                                userId: entry.userId,
                                                score: entry.score,
                                                profile
                                            });
                                        },
                                        () => {
                                            resolve({
                                                userId: entry.userId,
                                                score: entry.score,
                                                profile: {
                                                    name: "Usuario",
                                                    imageUrl: "/default-profile.png"
                                                }
                                            });
                                        }
                                    );
                                })
                        )
                    );

                    setLeaderboard(leaderboardWithProfiles);
                } catch (e) {
                    setError("Error al cargar los perfiles de usuario");
                } finally {
                    setLoadingLeaderboard(false);
                }
            },
            () => {
                setError("Error al cargar el ranking");
                setLoadingLeaderboard(false);
            }
        );
    };


    /* =========================
       Handlers
       ========================= */
    const handleExerciseSelect = (exerciseId) => {
        setSelectedExerciseId(exerciseId);
        loadLeaderboard(exerciseId);
    };

    const handlePreviousPage = () => {
        if (page > 0) setPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (existMoreItems) setPage((prev) => prev + 1);
    };

    /* =========================
       Render helpers
       ========================= */
    const renderExercises = () => {
        if (loadingExercises) {
            return (
                <p className="text-gray-400 text-sm text-center">
                    Cargando ejercicios...
                </p>
            );
        }

        if (exercises.length === 0) {
            return (
                <p className="text-gray-400 text-sm text-center">
                    No hay ejercicios disponibles
                </p>
            );
        }

        return exercises.map((exercise) => (
            <button
                key={exercise.id}
                onClick={() => handleExerciseSelect(exercise.id)}
                className={`w-full text-left p-3 rounded-lg mb-2
          ${
                    selectedExerciseId === exercise.id
                        ? "bg-blue-600"
                        : "bg-gray-800 hover:bg-gray-700"
                }`}
            >
                {exercise.name}
            </button>
        ));
    };

    const renderLeaderboard = () => {
        if (loadingLeaderboard) {
            return <p className="text-gray-400 text-sm text-center">Cargando ranking...</p>;
        }

        if (error) {
            return <p className="text-red-400 text-sm text-center">{error}</p>;
        }

        if (leaderboard.length === 0) {
            return <p className="text-gray-400 text-sm text-center">Selecciona un ejercicio para ver el ranking</p>;
        }

        return leaderboard.map((entry, index) => {
            const name = entry.profile?.userName || "Usuario";
            const imageUrl = entry.profile?.avatar.avatarBase64 || "/default-profile.png";

            return (
                <div key={index} className="grid grid-cols-4 py-1 items-center gap-2">
                     <span className={`
                            ${index < 3 ? 'font-bold' : ''}
                            ${index === 0 ? 'text-yellow-400' : ''}
                            ${index === 1 ? 'text-gray-300' : ''}
                            ${index === 2 ? 'text-amber-700' : ''}
                        `}>
                            {index + 1}
                        </span>
                    <img src={imageUrl} alt={name} className="w-6 h-6 rounded-full"/>
                    <span>{name}</span>
                    <span className="text-right font-semibold">{entry.score}</span>
                </div>
            );
        });
    };


    /* =========================
       Render principal
       ========================= */
    return (
        <div className="flex justify-center mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

                {/* =====================
            Columna ejercicios
            ===================== */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-gray-200">
                    <h2 className="text-lg font-bold mb-4 text-center">
                        Ejercicios
                    </h2>

                    {renderExercises()}

                    {/* Paginación */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={page === 0}
                            className={`px-3 py-1 rounded-lg text-sm
                ${
                                page === 0
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-600 hover:bg-gray-500 text-white"
                            }`}
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-gray-400">
              Página {page + 1}
            </span>

                        <button
                            onClick={handleNextPage}
                            disabled={!existMoreItems}
                            className={`px-3 py-1 rounded-lg text-sm
                ${
                                !existMoreItems
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-600 hover:bg-gray-500 text-white"
                            }`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

                {/* =====================
            Columna ranking
            ===================== */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-gray-200">
                    <h2 className="text-lg font-bold mb-4 text-center">
                        Ranking
                    </h2>

                    <div className="grid grid-cols-3 py-2 text-xs font-semibold border-b border-gray-700">
                        <span className="text-center">#</span>
                        <span>Usuario</span>
                        <span className="text-right">Puntuación</span>
                    </div>

                    <div className="divide-y divide-gray-800 mt-2">
                        {renderLeaderboard()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaderboardsPage;