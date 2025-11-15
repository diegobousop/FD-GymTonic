import React, { useState, useEffect, useRef } from "react";
import backend from "../../../../backend";
import Spinner from "./spinner";
import { SVG_ICONS } from "../../../../config/constants";

const SearchBar = ({ query, setQuery, filters, setFilters, onSearch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const MAX_LENGTH = 100;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      backend.searchService.getSearchSuggestions(
        trimmed,
        (data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setLoading(false);
        },
        () => {
          setSuggestions([]);
          setLoading(false);
        }
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch();
    setShowSuggestions(false);
    setShowFilters(false);
  };

  const groupedSuggestions = {
    user: suggestions.filter((s) => s.type === "user"),
    routine: suggestions.filter((s) => s.type === "routine"),
    exercise: suggestions.filter((s) => s.type === "exercise"),
  };

  return (
    <div className="relative w-full md:w-96" ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-[#1a1a1a] text-white border border-gray-600 px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          placeholder="Buscar..."
          value={query}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setShowSuggestions(value.trim().length > 0);
            setShowFilters(false);

            if (value.trim().length === 0) {
              setSuggestions([]);
              setLoading(false);
            }
          }}
        />

        <button
          type="submit"
          className="border border-gray-600 bg-[#1a1a1a] text-white px-3 py-2 text-sm 
                     rounded-md hover:border-[#ff0000] focus:ring-2 focus:ring-[#ff0000]"
        >
          <SVG_ICONS.SearchIcon className="w-5 h-5 text-white" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowFilters((prev) => !prev);
            setShowSuggestions(false);
          }}
          className="border border-gray-600 bg-[#1a1a1a] text-white px-3 py-2 text-sm 
                     rounded-md hover:border-[#ff0000] focus:ring-2 focus:ring-[#ff0000]"
        >
          Filtrar
        </button>
      </form>

      {showFilters && (
        <div className="absolute z-40 bg-[#1a1a1a] border border-gray-700 mt-1 w-full 
                        rounded-md shadow-lg p-3 text-white">
          <label className="block mb-1 text-sm">Nombre del entrenador</label>
          <input
            type="text"
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.trainerName}
            onChange={(e) =>
              setFilters({ ...filters, trainerName: e.target.value })
            }
          />

          <label className="block mb-1 text-sm">Grupo muscular</label>
          <select
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.muscleGroup}
            onChange={(e) =>
              setFilters({ ...filters, muscleGroup: e.target.value })
            }
          >
            <option value="">Todos</option>
            <option value="PECHO">Pecho</option>
            <option value="ESPALDA">Espalda</option>
            <option value="PIERNA">Pierna</option>
            <option value="BRAZO">Brazo</option>
            <option value="HOMBRO">Hombro</option>
            <option value="ABDOMEN">Abdomen</option>
            <option value="FULLBODY">Fullbody</option>
          </select>

          <label className="block mb-1 text-sm">Dificultad</label>
          <select
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.difficulty || ""}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="">Todas</option>
            <option value="FACIL">Fácil</option>
            <option value="INTERMEDIO">Intermedio</option>
            <option value="DIFICIL">Difícil</option>
          </select>

          <button
            type="button"
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            onClick={() =>
              setFilters({ trainerName: "", muscleGroup: "", difficulty: "" })
            }
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute z-50 bg-[#1a1a1a] border border-gray-700 mt-1 w-full 
                        shadow-lg text-gray-400 px-3 py-2 text-sm">
          <Spinner />
        </div>
      )}

      {showSuggestions && !loading && suggestions.length > 0 && (
        <div className="absolute z-50 bg-[#1a1a1a] border border-gray-700 mt-1 w-full 
                        shadow-lg text-white max-h-[32rem] overflow-y-auto p-2">
          {groupedSuggestions.user.length > 0 && (
            <div className="mb-2">
              <div className="text-gray-400 text-xs uppercase mb-1 border-b border-gray-700 pb-1">
                Usuarios
              </div>
              {groupedSuggestions.user.map((u, idx) => (
                <div
                  key={`user-${u.id}-${idx}`}
                  className="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  onClick={() => {
                    setQuery(u.name);
                    onSearch();
                    setShowSuggestions(false);
                    setShowFilters(false);
                  }}
                >
                  {u.name}
                </div>
              ))}
            </div>
          )}

          {groupedSuggestions.routine.length > 0 && (
            <div className="mb-2">
              <div className="text-gray-400 text-xs uppercase mb-1 border-b border-gray-700 pb-1">
                Rutinas
              </div>
              {groupedSuggestions.routine.map((r, idx) => (
                <div
                  key={`routine-${r.id}-${idx}`}
                  className="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  onClick={() => {
                    setQuery(r.name);
                    onSearch();
                    setShowSuggestions(false);
                    setShowFilters(false);
                  }}
                >
                  {r.name}
                </div>
              ))}
            </div>
          )}

          {groupedSuggestions.exercise.length > 0 && (
            <div>
              <div className="text-gray-400 text-xs uppercase mb-1 border-b border-gray-700 pb-1">
                Ejercicios
              </div>
              {groupedSuggestions.exercise.map((e, idx) => (
                <div
                  key={`exercise-${e.id}-${idx}`}
                  className="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  onClick={() => {
                    setQuery(e.name);
                    onSearch();
                    setShowSuggestions(false);
                    setShowFilters(false);
                  }}
                >
                  {e.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
