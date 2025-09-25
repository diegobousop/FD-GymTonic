import React, { useState, useEffect } from 'react'
import backend from "../../../backend";

const ViewAllRoutines = () => {

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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

  if (loading) {
    return <p className="text-white">Cargando rutinas...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10">
      <h2 className="text-white">Rutinas disponibles</h2>
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {routines.map((routine) => (
          <div className="bg-red-600 p-4 rounded-lg shadow-md.">
            <h3 className="text-xl text-black"><strong>{routine.name}</strong> <small>{routine.duration} min</small></h3>
              <ul>
                {routine.exercises.map((ex, i) => (
                  <li key={i} className="text-white">{ex.name} - <small>{ex.grupoMuscular}</small></li>
                ))}
              </ul>
              <p className="text-black">Creada por: {routine.creator.userName}</p>
          </div>
        ))}
      </div>
    </div>
  );
  };

export default ViewAllRoutines