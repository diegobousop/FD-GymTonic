import backend from "../../../../backend";

const RoutineActions = ({ user, routine, onEdit, onDeleted, onVisibilityChange, onError }) => {
  const canModify =
    user && (user.role === "ADMIN" || user.userName === routine.creator);

  const handleDelete = () => {
    if (!canModify) {
      onError("No tienes permisos para eliminar esta rutina");
      return;
    }

    if (window.confirm(`¿Seguro que quieres eliminar la rutina "${routine.name}"?`)) {
      backend.routineService.deleteRoutine(
        routine.id,
        () => {
          onDeleted();
        },
        (err) => {
          onError(err.globalError || "Error al eliminar la rutina");
        }
      );
    }
  };

  const handleVisibilityChange = () => {
    if (!canModify) {
      onError("No tienes permisos para cambiar la visibilidad");
      return;
    }

    backend.routineService.modifyRoutine(
      routine.id,
      routine.name,
      routine.exercises.map((ex) => ex.id),
      routine.duration,
      !routine.isPublic,
      (updated) => onVisibilityChange(updated),
      (err) => onError(err.globalError || "Error al cambiar visibilidad")
    );
  };

  if (!canModify) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap mb-6">

        <button
            onClick={onEdit}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-xl text-xl"
            title="Editar rutina"
        >
            ✏️
        </button>

        <button
            onClick={handleDelete}
            className="bg-gray-800 hover:bg-gray-800 text-white px-3 py-1 rounded-xl text-xl"
            title="Eliminar rutina"
        >
            🗑️
        </button>

        {user && user.userName === routine.creator &&
            <button
                onClick={handleVisibilityChange}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-xl text-xl"
                title={routine.isPublic ? "Hacer privada" : "Hacer pública"}
                >
                {routine.isPublic ? "🔒" : "🔓"}
            </button>
        }
    </div>
  );
};

export default RoutineActions;
