import { useEffect, useState, useContext } from "react";
import { getSerieByExercise } from "../../../../backend/exerciseService";
import EditSeries from "../routine/edit-series-routine";
import { UserContext } from "../common/user-provider";

const Exercise = ({ ex, routineId, routineCreator }) => {
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(UserContext);


const formatEnum = (value) =>
  value
    ? value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : "";


const refreshSeries = () => {
    getSerieByExercise(
      ex.id,
      routineId,
      (data) => setSeries(data.items || []),
      (err) => setError(err || "Error al cargar las series")
    );
  };

  useEffect(() => {
    refreshSeries();
  }, [ex.id, routineId]);

  return (
    <div key={ex.id} className="border-2 border-red-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        {/* IZQUIERDA: Nombre y descripción */}
        <div className="flex flex-col mb-3 sm:mb-0 sm:w-1/3">
            <h3 className="text-xl text-white font-bold">
            {ex.name}
            </h3>
            <p className="text-gray-300 text-m">{ex.descripcion}</p>
        </div>

        {/* CENTRO: Atributos*/}
        <div className="flex flex-row items-center self-center">
            <div className="flex flex-col items-start mr-3">
                <p className="text-white text-m">Equipamiento:</p>
                <p className="text-white text-m">Grupo Muscular:</p>
                <p className="text-white text-m">Dificultad:</p>
            </div>
            <div className="flex flex-col items-start">
                <p className="text-gray-300 text-m">{formatEnum(ex.equipment)}</p>
                <p className="text-gray-300 text-m">{formatEnum(ex.grupoMuscular)}</p>
                <p className={`text-black text-sm rounded-xl px-2 py-0.5 ${
                        ex.difficulty === 'FACIL'
                        ? 'bg-green-500'
                        : ex.difficulty === 'INTERMEDIO'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    >
                    {ex.difficulty}
                </p> 
            </div>
        </div>

        {/* DERECHA: Ejercicios y series */}
        <div className="grid divide-y divide-gray-700 text-gray-200 text-s leading-tight">
            {/* Cabecera */}
            <div className="grid grid-cols-3 py-2 font-semibold text-xs text-gray-200">
            <span>Serie</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
            </div>

            {/* Series dinámicas */}
            {error ? (
            <p className="text-red-400 text-xs p-2">{error}</p>
            ) : series.length > 0 ? (
            series.map((serie, index) => (
                <div key={serie.id || index} className="grid grid-cols-3 py-0">
                <span>{serie.numeroSerie}</span>
                <span>{serie.repeticiones}</span>
                <span>{serie.peso}</span>
                </div>
            ))
            ) : (
            <p className="text-gray-400 text-xs p-2">Sin series registradas</p>
            )}
        </div>

        {user && user.userName === routineCreator &&
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1 rounded-xl text-sm"
            title="Editar series"
          >
            ✏️
          </button>
        }

        {showModal && (
          <EditSeries
            exerciseId={ex.id}
            routineId={routineId}
            onClose={() => setShowModal(false)}
            onUpdate={refreshSeries}
          />
        )}
        
    </div>
  )}

export default Exercise;