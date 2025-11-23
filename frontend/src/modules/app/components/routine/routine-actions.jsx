import backend from "../../../../backend";
import BubbleButton from '../common/bubble-button'
import { svgIcons } from '../../../../config/constants'

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

        <BubbleButton 
          icon={<svgIcons.RoutineEditIcon
              className="text-[#ff0000]"
            />}
          ariaLabel="Editar rutina"
          size={50}
          onClick={onEdit}
        />

        <BubbleButton 
          icon={<svgIcons.RoutineDeleteIcon
              className="text-[#ff0000]"
            />}
          ariaLabel="Eliminar rutina"
          size={50}
          onClick={handleDelete}
        />

        {user && user.userName === routine.creator &&
          <BubbleButton 
            icon={<svgIcons.RoutineVisibilityIcon
                className="text-[#ff0000]"
              />}
            ariaLabel="Cambiar visibilidad"
            size={50}
            onClick={handleVisibilityChange}
          />
        }
    </div>
  );
};

export default RoutineActions;
