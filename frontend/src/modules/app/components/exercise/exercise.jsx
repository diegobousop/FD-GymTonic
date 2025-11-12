import { useEffect, useState, useContext } from "react";
import { getSerieByExercise } from "../../../../backend/exerciseService";
import EditSeries from "../routine/edit-series-routine";
import { UserContext } from "../common/user-provider";
import BubbleButton from '../common/bubble-button'
import { SVG_ICONS } from '../../../../config/constants'

const Exercise = ({ ex, routineId, routineCreator, onExerciseUpdated }) => {
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

const formatRestTime = (seconds) =>
  seconds < 60
    ? `${seconds} seg`
    : `${Math.floor(seconds / 60)} min${seconds % 60 > 0 ? ` ${seconds % 60} seg` : ""}`;


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

  const handleUpdate = () => {
    refreshSeries();
    if (typeof onExerciseUpdated === "function") {
      onExerciseUpdated();
    }
  };

  return (
    <div key={ex.id}>
      {/* Detalles de ejercicio */}
      <div className="border-2 border-red-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
          {/* IZQUIERDA: Imagen, nombre y descripción */}
          <img src={ex.exerciseImageBase64} className="w-[80px] h-[80px]"/>
          <div className="flex flex-col mb-3 sm:mb-0 sm:w-1/3">
              <h3 className="text-xl text-white font-bold">
              {ex.name}
              </h3>
              <p className="text-gray-300 text-m">{ex.descripcion}</p>
          </div>

          {/* CENTRO: Atributos*/}
          <div className="flex flex-row items-center self-center sm:w-1/4">
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
            <BubbleButton 
              icon={<SVG_ICONS.CreateRoutineIcon
                  className="text-[#ff0000]"
                />}
              ariaLabel="Editar Series"
              onClick={() => setShowModal(true) }
            />
          }

          {showModal && (
            <EditSeries
              restTime={ex.restTime}
              exerciseId={ex.id}
              routineId={routineId}
              onClose={() => setShowModal(false)}
              onUpdate={handleUpdate}
            />
          )}
          
      </div>

      {/* Descanso */}
      <div className="border-2 border-red-700 rounded-2xl mt-3 flex items-center w-1/3 justify-between">
        <div className="flex items-center">
          <span className="border-2 border-red-600 bg-red-600 text-white text-sm px-1 rounded-l-xl flex items-center">
            🕒
          </span>
          <p className="text-white text-sm ml-2">DESCANSO:</p>
          <p className="text-gray-300 text-sm ml-1">{formatRestTime(ex.restTime)}</p>
        </div>
      </div>

    </div>
  )}

export default Exercise;