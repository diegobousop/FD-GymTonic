import React, { useState, useEffect, useContext } from "react";
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";

const MyRoutineFollowersPage = () => {
  const { user } = useContext(UserContext);
  const [followers, setFollowers] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [myRoutines, setMyRoutines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "TRAINER") {
      backend.routineService.searchRoutines(
        user.id,
        "",
        { page: 0, size: 10 },
        (data) => setMyRoutines(data.items || data),
        (err) => console.error("Error cargando rutinas:", err)
      );
    }
  }, [user]);

  const handleViewFollowers = (routineId) => {
    setFollowers([]);
    setLoading(true);
    backend.routineService.getFollowersByRoutine(
      routineId,
      { page: 0, size: 10 },
      (data) => {
        setFollowers(data.items || data || []);
        setSelectedRoutine(routineId);
        setLoading(false);
      },
      (err) => {
        console.error("Error al cargar seguidores:", err);
        setLoading(false);
      }
    );
  };

  if (user?.role !== "TRAINER") {
    return <p>No tienes permiso para ver esta página.</p>;
  }

  const selectedRoutineName = myRoutines.find((r) => r.id === selectedRoutine)?.name;

  return (
    <div className="p-6 text-white">
      {/* Listado de rutinas */}
      <div className="mb-6">
        <h3 className="text-lg mb-2">Mis rutinas</h3>
        <ul className="space-y-2">
          {myRoutines.map((r) => (
            <li
              key={r.id}
              className="flex justify-between items-center bg-gray-700 p-3 rounded-md"
            >
              <span>{r.name}</span>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                onClick={() => handleViewFollowers(r.id)}
              >
                Ver seguidores
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Seguidores de la rutina seleccionada */}
      {selectedRoutine && (
        <div>
          <h3 className="text-lg mb-2">
            Seguidores de {selectedRoutineName ? `"${selectedRoutineName}"` : `rutina #${selectedRoutine}`}
          </h3>

          {loading ? (
            <p>Cargando seguidores...</p>
          ) : followers.length > 0 ? (
            <ul className="space-y-2">
              {followers.map((f) => (
                <li
                  key={f.id}
                  className="bg-gray-800 p-3 rounded-md flex items-center gap-3"
                >
                  {f.avatarBase64 && (
                    <img
                      src={f.avatarBase64}
                      alt={f.userName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <span>{f.userName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay seguidores en esta rutina.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRoutineFollowersPage;
