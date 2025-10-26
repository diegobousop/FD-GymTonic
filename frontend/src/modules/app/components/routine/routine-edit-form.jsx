import { useState, useEffect } from "react";
import backend from "../../../../backend";
import MultiSelectList from "../common/multi-select-list";
import TextInput from "../common/text-input";

const RoutineEditForm = ({ routine, onCancel, onSaved, onError }) => {
  const [editName, setEditName] = useState(routine.name);
  const [editDuration, setEditDuration] = useState(routine.duration);
  const [editExercises, setEditExercises] = useState(routine.exercises.map((ex) => ex.id));
  const [editIsPublic, setEditIsPublic] = useState(routine.isPublic);
  const [page, setPage] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [existMoreItems, setExistMoreItems] = useState(false);

  // Cargar ejercicios paginados
  useEffect(() => {
    backend.exerciseService.getValidatedExercises(
      { page, size: 6 },
      (block) => {
        setExercises(block.items);
        setExistMoreItems(block.existMoreItems);
      },
      () => setExercises([])
    );
  }, [page]);

  const handleSave = () => {
    backend.routineService.modifyRoutine(
      routine.id,
      editName.trim(),
      editExercises,
      Number(editDuration),
      editIsPublic,
      (updatedRoutine) => {
        onSaved(updatedRoutine, `Rutina "${editName}" actualizada exitosamente`);
      },
      (err) => {
        onError(err.globalError || "Error al actualizar la rutina");
      }
    );
  };

  return (
    <div className="flex flex-col mt-10 justify-center items-center">
      <TextInput
        type="text"
        label="Nombre de la rutina"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full p-2 rounded bg-white text-black"
        placeholder="Nombre de la rutina"
      />
      <TextInput
        type="number"
        label="Duración"
        value={editDuration}
        onChange={(e) => setEditDuration(e.target.value)}
        className="w-full p-2 rounded bg-white text-black"
        placeholder="Duración (min)"
      />

      <MultiSelectList
        options={exercises}
        selected={editExercises}
        onChange={setEditExercises}
        label="Ejercicios"
        page={page}
        setPage={setPage}
        existMoreItems={existMoreItems}
        defaultOpen={true}
      />
      
      <div className="flex space-x-2 mt-5">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RoutineEditForm;
