import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../../backend";

const RoutineDetails = () => {
  const { id } = useParams(); 
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [id]);

  if (loading) return <p>Cargando rutina...</p>;
  if (error) return <p>{error}</p>;
  if (!routine) return <p>No se encontró la rutina</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white">{routine.name}</h2>
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
