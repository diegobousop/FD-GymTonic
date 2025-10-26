import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";

const RoutineDetails = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [routine, setRoutine] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false); // evita doble clic rápido

  useEffect(() => {
    setLoading(true);

    // Cargar detalles de la rutina
    backend.routineService.findRoutineById(
      id,
      (data) => {
        setRoutine(data);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error al cargar la rutina");
        setLoading(false);
      }
    );

    // Consultar si el usuario ya sigue esta rutina
    if (user) {
      backend.routineService.isFollowingRoutine(
        id,
        (response) => setIsFollowing(response), // true / false
        (err) => console.error("Error al comprobar seguimiento", err)
      );
    }
  }, [id, user]);

  const handleFollowToggle = () => {
    if (!user) {
      alert("Debes iniciar sesión para seguir una rutina");
      return;
    }
    setUpdating(true);

    const action = isFollowing
      ? backend.routineService.unfollowRoutine
      : backend.routineService.followRoutine;

    action(
      id,
      () => {
        setIsFollowing(!isFollowing);
        setUpdating(false);
      },
      (err) => {
        console.error("Error al actualizar seguimiento", err);
        setUpdating(false);
      }
    );
  };

  if (loading) return <p>Cargando rutina...</p>;
  if (error) return <p>{error}</p>;
  if (!routine) return <p>No se encontró la rutina</p>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {routine.name}
          {routine.isPublic !== undefined && (
            <span
              className={`ml-3 text-sm px-3 py-1 rounded ${
                routine.isPublic ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              {routine.isPublic ? "🌍 Pública" : "🔒 Privada"}
            </span>
          )}
        </h2>

        {/* 🔹 Botón de seguir/dejar de seguir */}
        <button
          onClick={handleFollowToggle}
          disabled={updating}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            isFollowing
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {updating
            ? "Procesando..."
            : isFollowing
            ? "Dejar de seguir"
            : "Seguir rutina"}
        </button>
      </div>

      <p className="text-gray-200">Duración: {routine.duration} min</p>
      <p className="text-gray-200">Creada por: {routine.creator}</p>

      <h3 className="mt-4 text-xl font-semibold text-white">Ejercicios:</h3>
      {routine.exercises && routine.exercises.length > 0 ? (
        <ul className="list-disc list-inside">
          {routine.exercises.map((ex, i) => (
            <li key={i} className="text-gray-200">
              {ex.name} – <small>{ex.grupoMuscular}</small> {ex.descripcion}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay ejercicios en esta rutina</p>
      )}
    </div>
  );
};

export default RoutineDetails;
