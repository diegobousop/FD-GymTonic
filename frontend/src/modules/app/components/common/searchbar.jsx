import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

const SearchBar = ({ query, setQuery, filters, setFilters, onSearch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      // Llamar a getSearchSuggestions del backend (por ahora vacío)
      setSuggestions([]);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Cerrar filtros al hacer click fuera
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
    onSearch();
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full md:w-96" ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-[#1a1a1a] text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
        />

        {/* Botón de lupa */}
        <button
          type="submit"
          className="bg-gray-700 text-white px-3 py-2 rounded-md hover:bg-gray-600"
        >
          🔍
        </button>

        {/* Botón de filtrar */}
        <button
          type="button"
          className="bg-gray-700 text-white px-3 py-2 rounded-md hover:bg-gray-600"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          Filtrar
        </button>
      </form>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="absolute z-40 bg-[#1a1a1a] border border-gray-700 mt-1 w-full rounded-md shadow-lg p-3 text-white">
          {/* Nombre del entrenador */}
          <label className="block mb-1 text-sm">Nombre del entrenador</label>
          <input
            type="text"
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.trainerName}
            onChange={(e) => setFilters({ ...filters, trainerName: e.target.value })}
            placeholder="Filtrar por entrenador"
          />

          {/* Grupo muscular */}
          <label className="block mb-1 text-sm">Grupo muscular</label>
          <select
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.muscleGroup}
            onChange={(e) => setFilters({ ...filters, muscleGroup: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="PECHO">Pecho</option>
            <option value="ESPALDA">Espalda</option>
            <option value="PIERNA">Pierna</option>
            <option value="BRAZO">Brazo</option>
            <option value="HOMBRO">Hombro</option>
            <option value="ABDOMEN">Abdomen</option>
          </select>

          {/* Dificultad */}
          <label className="block mb-1 text-sm">Dificultad</label>
          <select
            className="w-full border border-gray-600 rounded-md px-2 py-1 mb-2 text-sm text-black"
            value={filters.dificultad || ""}
            onChange={(e) => setFilters({ ...filters, dificultad: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="MUY_FACIL">Muy fácil</option>
            <option value="FACIL">Fácil</option>
            <option value="INTERMEDIO">Intermedio</option>
            <option value="DIFICIL">Difícil</option>
            <option value="EXTREMO">Extremo</option>
          </select>

          {/* Botón limpiar */}
          <button
            type="button"
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            onClick={() =>
              setFilters({ trainerName: "", muscleGroup: "", dificultad: "" })
            }
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-[#1a1a1a] border border-gray-700 mt-1 w-full rounded-md shadow-lg text-white max-h-64 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={s.id || idx}
              onClick={() => {
                setQuery(s.name || s);
                onSearch();
                setShowSuggestions(false);
              }}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
            >
              {s.name || s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
