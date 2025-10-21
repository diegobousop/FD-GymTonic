import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchResults } from "../../../backend/searchService.js";
import Routine from "../components/common/routine.jsx";
import Pager from "../components/common/pager.jsx";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({ users: [], routines: [], exercises: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState("TODO");

  const query = searchParams.get("text") || "";
  const trainerName = searchParams.get("trainerName") || "";
  const muscleGroup = searchParams.get("muscleGroup") || "";
  const size = 5; // Tamaño de página

  const fetchResults = useCallback(
    (pageNumber = 0) => {
      if (!query.trim()) {
        setResults({ users: [], routines: [], exercises: [] });
        return;
      }

      setLoading(true);
      setError(null);

      searchResults(
        { text: query, trainerName, muscleGroup, page: pageNumber, size },
        (data) => {
          console.log(data);
          setResults(data);
          setExistMoreItems(data.existMoreItems ?? false);
          setPage(pageNumber);
          setLoading(false);
        },
        (err) => {
          setError("Error al cargar los resultados");
          setLoading(false);
        }
      );
    },
    [query, trainerName, muscleGroup]
  );

  useEffect(() => {
    fetchResults(0);
  }, [fetchResults]);

  const filterByType = (type) => setItemTypeFilter(type);

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10 text-white">
      <p className="mb-4 text-gray-300">
        Mostrando resultados para: <b>{query || "..."}</b>
      </p>

      {/* Selector de tipo de resultado */}
      <div className="mb-6 flex gap-2">
        {["TODO", "RUTINAS", "EJERCICIOS", "USUARIOS"].map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-md text-sm transition ${
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
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Usuarios */}
          {(itemTypeFilter === "TODO" || itemTypeFilter === "USUARIOS") &&
            results.users?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Usuarios</h2>
                <ul className="space-y-2">
                  {results.users.map((user) => (
                    <li
                      key={user.id}
                      className="border border-gray-700 p-2 rounded-md shadow-sm flex items-center gap-3"
                    >
                      {user.avatarBase64 && (
                        <img
                          src={user.avatarBase64}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span>{user.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Rutinas */}
          {(itemTypeFilter === "TODO" || itemTypeFilter === "RUTINAS") &&
            results.routines?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Rutinas</h2>
                <div className="flex flex-col space-y-4 mt-4 ml-4 mr-4">
                  {results.routines.map((routine) => (
                    <Routine routine={routine} key={routine.id} />
                  ))}
                </div>
              </div>
            )}

          {/* Ejercicios */}
          {(itemTypeFilter === "TODO" || itemTypeFilter === "EJERCICIOS") &&
            results.exercises?.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Ejercicios</h2>
                <ul className="space-y-2">
                  {results.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="border border-gray-700 p-2 rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-gray-300">
                          {exercise.grupoMuscular}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Sin resultados */}
          {(!results.users?.length &&
            !results.routines?.length &&
            !results.exercises?.length) && (
            <p className="text-gray-400">No se encontraron resultados.</p>
          )}
        </div>
      )}

      {/* Paginación */}
      {!loading && (results.users?.length || results.routines?.length || results.exercises?.length) > 0 && (
        <div className="mt-6">
          <Pager
            back={{ enabled: page > 0, onClick: () => fetchResults(page - 1) }}
            next={{ enabled: existMoreItems, onClick: () => fetchResults(page + 1) }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
