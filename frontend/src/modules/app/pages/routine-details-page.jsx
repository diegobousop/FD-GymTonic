import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/common/user-provider";
import backend from "../../../backend";
import Exercise from "../components/exercise/exercise";
import RoutineEditForm from "../components/routine/routine-edit-form";
import RoutineActions from "../components/routine/routine-actions";

const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const handleRoutineUpdated = (updatedRoutine, msg) => {
    setRoutine(updatedRoutine);
    setEditing(false);
    setMessage({ type: "success", text: msg });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleError = (msg) => {
    setMessage({ type: "error", text: msg });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (loading) return <p>Cargando rutina...</p>;
  if (error) return <p>{error}</p>;
  if (!routine) return <p>No se encontró la rutina</p>;

  return (
    <div className="p-4">
      {message.text && (
        <div
          className={`p-3 mb-4 rounded text-white ${
            message.type === "success"
              ? "bg-green-500"
              : message.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          {(user?.role === "ADMIN" || user?.userName === routine.creator) && (
            <span className={`text-sm py-1 text-gray-400 rounded`}>
                {routine.isPublic ? "Rutina pública" : "Rutina privada"}
            </span>
            )}
            <h2 className="text-3xl font-bold text-white">{routine.name}</h2>
        </div>
      </div>

      <div className="flex flex-row items-center self-start mt-5 mb-5 flex-wrap">
        <p className="mx-3">{routine.creator}</p>
        <span className="text-white">•</span>
        <p className="mx-3">{routine.duration} minutos</p>
      </div>

      {!editing ? (
        <>
          {/* Botones de acción */}
          <RoutineActions
            user={user}
            routine={routine}
            onEdit={() => setEditing(true)}
            onDeleted={() => navigate("/routines")}
            onVisibilityChange={setRoutine}
            onError={handleError}
          />

          {/* Ejercicios */}
          {routine.exercises && routine.exercises.length > 0 && (
            <ul className="list-disc list-inside space-y-5 mt-6">
              {routine.exercises.map((ex) => (
                <Exercise ex={ex} routineId={routine.id} routineCreator={routine.creator} key={ex.id} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <RoutineEditForm
          routine={routine}
          onCancel={() => setEditing(false)}
          onSaved={handleRoutineUpdated}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default RoutineDetails;
