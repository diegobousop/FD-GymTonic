import React, { useState, useEffect, useContext } from 'react'
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";

const ViewAllRoutines = () => {
  const { user } = useContext(UserContext);

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editExercises, setEditExercises] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");


  useEffect(() => {
    backend.routineService.viewAllRoutines(
      (data) => {
        setRoutines(data);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error inesperado al cargar rutinas");
        setLoading(false);
      }
    );
  }, []);

  const handleDeleteRoutine = (routineId, routineName, routineCreatorId) => {
    // Verificar permisos antes de proceder
    if (!user) {
      setPermissionError("Debes iniciar sesión para eliminar rutinas");
      setTimeout(() => setPermissionError(""), 3000);
      return;
    }

    // Admin puede eliminar cualquier rutina, otros usuarios solo las suyas
    if (user.role !== "ADMIN" && user.id !== routineCreatorId) {
      setPermissionError("Solo puedes eliminar rutinas que hayas creado");
      setTimeout(() => setPermissionError(""), 3000);
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"?`)) {
      backend.routineService.deleteRoutine(
        routineId,
        () => {
          setDeleteMessage(`Rutina "${routineName}" eliminada exitosamente`);
          setRoutines(routines.filter(routine => routine.id !== routineId));
          setTimeout(() => setDeleteMessage(""), 3000);
        },
        (err) => {
          if (err.globalError && err.globalError.includes("Permission")) {
            setPermissionError("No tienes permisos para eliminar esta rutina");
          } else {
            setError(err.globalError || "Error al eliminar la rutina");
          }
          setTimeout(() => setPermissionError(""), 3000);
        }
      );
    }
  };

  const handleEditRoutine = (routine) => {
    // Verificar permisos antes de proceder
    if (!user) {
      setPermissionError("Debes iniciar sesión para editar rutinas");
      setTimeout(() => setPermissionError(""), 3000);
      return;
    }

    // Admin puede editar cualquier rutina, otros usuarios solo las suyas
    if (user.role !== "ADMIN" && user.id !== routine.creator.id) {
      setPermissionError("Solo puedes editar rutinas que hayas creado");
      setTimeout(() => setPermissionError(""), 3000);
      return;
    }

    setEditingRoutine(routine.id);
    setEditName(routine.name);
    setEditDuration(routine.duration.toString());
    setEditExercises(routine.exercises.map(ex => ex.id).join(", "));
  };

  const handleSaveEdit = (routineId) => {
    const parsedExercises = editExercises
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);

    backend.routineService.modifyRoutine(
      routineId,
      editName.trim(),
      parsedExercises,
      Number(editDuration),
      (updatedRoutine) => {
        setSuccessMessage(`Rutina "${editName}" actualizada exitosamente`);
        setRoutines(routines.map(routine => 
          routine.id === routineId ? updatedRoutine : routine
        ));
        setEditingRoutine(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      (err) => {
        if (err.globalError && err.globalError.includes("Permission")) {
          setPermissionError("No tienes permisos para editar esta rutina");
        } else {
          setError(err.globalError || "Error al actualizar la rutina");
        }
        setEditingRoutine(null);
        setTimeout(() => setPermissionError(""), 3000);
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingRoutine(null);
    setEditName("");
    setEditDuration("");
    setEditExercises("");
  };

  
  const canUserModifyRoutine = (routine) => {
    if (!user) return false;
    
    // Admin puede modificar cualquier rutina
    if (user.role === "ADMIN") return true;
    
    return user.id === routine.creator.id;
  };

  if (loading) {
    return <p className="text-white">Cargando rutinas...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (!loading && !error && routines.length === 0) {
    return <p className="text-red-100 mt-10 ml-10">Todavía no hay rutinas disponibles</p>;
  }

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10">
      <h2 className="text-white">Rutinas disponibles</h2>
      
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {deleteMessage && (
        <div className="bg-blue-500 text-white p-3 rounded mb-4">
          {deleteMessage}
        </div>
      )}
      {permissionError && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          ⚠️ {permissionError}
        </div>
      )}
      
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {routines.map((routine) => (
          <div key={routine.id} className="bg-red-600 p-4 rounded-lg shadow-md">
            {editingRoutine === routine.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black"
                  placeholder="Nombre de la rutina"
                />
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black"
                  placeholder="Duración (min)"
                />
                <input
                  type="text"
                  value={editExercises}
                  onChange={(e) => setEditExercises(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black"
                  placeholder="IDs de ejercicios (separados por coma)"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(routine.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div>
                <h3 className="text-xl text-black"><strong>{routine.name}</strong> <small>{routine.duration} min</small></h3>
                <ul>
                  {routine.exercises.map((ex, i) => (
                    <li key={i} className="text-white">{ex.name} - <small>{ex.grupoMuscular}</small></li>
                  ))}
                </ul>
                <p className="text-black">Creada por: {routine.creator.userName}</p>
                
                {canUserModifyRoutine(routine) && (
                  <div className="mt-3">
                    {user.role === "ADMIN" && user.id !== routine.creator.id && (
                      <p className="text-yellow-300 text-xs mb-2">👑 Permisos de administrador</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRoutine(routine.id, routine.name, routine.creator.id)}
                        className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  };

export default ViewAllRoutines