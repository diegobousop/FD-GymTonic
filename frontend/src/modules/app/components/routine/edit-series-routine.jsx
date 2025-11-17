import { useState, useEffect } from "react";
import backend from "../../../../backend";
import PropTypes from "prop-types";

const EditSeriesModal = ({ exerciseId, routineId, onClose, onUpdate }) => {
  const [series, setSeries] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Cargar las series del backend
  useEffect(() => {
    backend.exerciseService.getSerieByExercise(
      exerciseId,
      routineId,
      (block) => setSeries(block.items || []),
      () => setError("Error al cargar las series")
    );
  }, [exerciseId, routineId]);

  // Helpers para evitar anidación profunda
  const removeSerieFromState = (idToRemove) => {
    setSeries((prev) => prev.filter((s) => s.id !== idToRemove));
  };

  const modifySerieAsync = (serie) =>
    new Promise((resolve, reject) => {
      backend.exerciseService.modifySerie(
        serie.id,
        serie.repeticiones,
        serie.peso,
        resolve,   // evita funciones inline () => resolve()
        reject     // evita funciones inline (err) => reject(err)
      );
    });

  // Añadir nueva serie directamente en backend
  const addSerie = () => {
    backend.exerciseService.createSerie(
      exerciseId,
      routineId,
      (createdSerie) => {
        setSeries((prev) => [...prev, createdSerie]);
      },
      (err) => console.error("❌ Error al crear serie:", err)
    );
  };

  // Eliminar serie directamente en backend
  const deleteSerie = (id) => {
    const onDeleted = () => removeSerieFromState(id);
    const onDeleteError = (err) =>
      console.error(`❌ Error al eliminar serie ${id}:`, err);

    backend.exerciseService.deleteSerie(id, onDeleted, onDeleteError);
  };

  // Actualizar repeticiones o peso en el estado local
  const updateSerie = (id, field, value) => {
    setSeries(
      series.map((s) =>
        s.id === id ? { ...s, [field]: parseInt(value) || 0 } : s
      )
    );
  };

  // Confirmar cambios de repeticiones y pesos en backend
  const handleConfirm = async () => {
    setSaving(true);
    try {
      await Promise.all(series.map(modifySerieAsync));

      if (typeof onUpdate === "function") await onUpdate();

      onClose();
    } catch (err) {
      console.error("❌ Error al modificar series:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderSeries = () => {
    if (error) {
      return <p className="text-red-400 text-xs p-2">{error}</p>;
    }
    if (series.length === 0) {
      return <p className="text-gray-400 text-xs p-2">Sin series registradas</p>;
    }
    return series.map((serie) => (
      <div
        key={serie.id}
        className="grid grid-cols-4 items-center py-1 text-sm"
      >
        <span>{serie.numeroSerie}</span>
        <input
          type="number"
          value={serie.repeticiones}
          onChange={(e) =>
            updateSerie(serie.id, "repeticiones", e.target.value)
          }
          className="bg-gray-800 text-white w-16 rounded text-center"
          aria-label={`Repeticiones serie ${serie.numeroSerie}`}
          min="0"
        />
        <input
          type="number"
          value={serie.peso}
          onChange={(e) =>
            updateSerie(serie.id, "peso", e.target.value)
          }
          className="bg-gray-800 text-white w-16 rounded text-center"
          aria-label={`Peso serie ${serie.numeroSerie}`}
          min="0"
        />
        {series.length === serie.numeroSerie && (
          <button
            onClick={() => deleteSerie(serie.id)}
            className="text-red-500 hover:text-red-400"
            title="Eliminar serie"
          >
            ❌
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md text-gray-200">
        <h2 className="text-lg font-bold mb-4 text-center">
          Editar series del ejercicio
        </h2>

        <div className="grid divide-y divide-gray-700 text-gray-200 text-sm leading-tight">
          {/* Cabecera */}
          <div className="grid grid-cols-4 py-2 font-semibold text-xs text-gray-200">
            <span>Serie</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
            <span></span>
          </div>

          {/* Series dinámicas */}
          {renderSeries()}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={addSerie}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
            title="Añadir serie"
          >
            ➕ Añadir serie
          </button>

          <button
            onClick={handleConfirm}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {saving ? "Guardando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
};

EditSeriesModal.propTypes = {
  exerciseId: PropTypes.number.isRequired,
  routineId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
};

export default EditSeriesModal;
