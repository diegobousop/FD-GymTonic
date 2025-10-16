import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchResults } from "../../../backend/searchService.js";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({ users: [], routines: [], exercises: [] });
  const [loading, setLoading] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState("TODO");

  const query = searchParams.get("text") || "";
  const trainerName = searchParams.get("trainerName") || "";
  const muscleGroup = searchParams.get("muscleGroup") || "";

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], routines: [], exercises: [] });
      return;
    }

    setLoading(true);

    searchResults(
      { text: query, trainerName, muscleGroup, limit: 20 },
      (data) => {
        setResults(data);
        setLoading(false);
      },
      () => {
        setResults({ users: [], routines: [], exercises: [] });
        setLoading(false);
      }
    );
  }, [query, trainerName, muscleGroup]);

  const filterByType = (type) => setItemTypeFilter(type);

  return (
    <div className="p-6 text-white">
      <p className="mb-4 text-gray-300">
        Mostrando resultados para: <b>{query || "..."}</b>
      </p>

      <div className="mb-4 flex gap-2">
        {["TODO", "RUTINAS", "EJERCICIOS", "USUARIOS"].map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-md text-sm ${
              itemTypeFilter === type ? "bg-red-600" : "bg-gray-700"
            } hover:bg-gray-600`}
            onClick={() => filterByType(type)}
          >
            {type === "TODO" ? "Todo" : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando resultados...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {itemTypeFilter !== "RUTINAS" &&
            results.users.length > 0 &&
            (itemTypeFilter === "TODO" || itemTypeFilter === "USUARIOS") && (
              <div>
                <h2 className="font-semibold mb-2">Usuarios</h2>
                <ul className="space-y-2">
                  {results.users.map((user) => (
                    <li key={user.id} className="border p-2 rounded-md shadow-sm flex items-center gap-3">
                      {user.avatarBase64 && (
                        <img src={user.avatarBase64} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <span>{user.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {itemTypeFilter !== "USUARIOS" &&
            results.routines.length > 0 &&
            (itemTypeFilter === "TODO" || itemTypeFilter === "RUTINAS") && (
              <div>
                <h2 className="font-semibold mb-2">Rutinas</h2>
                <ul className="space-y-2">
                  {results.routines.map((routine) => (
                    <li key={routine.id} className="border p-2 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{routine.name}</span>
                        <span className="text-sm text-gray-300">{routine.creatorUsername}</span>
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        Ejercicios: {routine.exercises.join(", ")}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {itemTypeFilter !== "USUARIOS" &&
            results.exercises.length > 0 &&
            (itemTypeFilter === "TODO" || itemTypeFilter === "EJERCICIOS") && (
              <div>
                <h2 className="font-semibold mb-2">Ejercicios</h2>
                <ul className="space-y-2">
                  {results.exercises.map((exercise) => (
                    <li key={exercise.id} className="border p-2 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-gray-300">{exercise.grupoMuscular}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {results.users.length === 0 &&
            results.routines.length === 0 &&
            results.exercises.length === 0 && <p>No se encontraron resultados.</p>}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
