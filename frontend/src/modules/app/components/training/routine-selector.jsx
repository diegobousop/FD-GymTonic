import React from 'react'
import { useState, useEffect, useContext } from 'react';
import backend from "../../../../backend";

import MiniPager from '../common/mini-pager';
import Spinner from '../common/spinner';

import { svgIcons } from '../../../../config/constants'


const RoutineSelector = ({ selectedRoutine, setSelectedRoutine, onDeselect }) => {

    const [routines, setRoutines] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [loading, setLoading] = useState(false); // Gestionar aquí

    //Paginacion
    const size = 2;

    //Parametros de search
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const onSearch = (searchQuery) => {
        if (!searchQuery) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = routines.filter(routine =>
            routine.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
    };

    const viewRoutines = (pageNumber) => {
        setLoading(true);
        backend.routineService.viewAllRoutines(
          { page: pageNumber, size },
          (data) => {
            setRoutines(data.items);
            setExistMoreItems(data.existMoreItems);
            setPage(pageNumber);
            setLoading(false);
          },
          (err) => {
            console.error("Error al cargar rutinas:", err);
            setError(err || "Error inesperado al cargar rutinas");
            setLoading(false);
          }
        );
      };
    
      useEffect(() => {
        viewRoutines(0);
      }, []);

    if (loading) {
        return <Spinner />;
    }

    return (
        <div>
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && routines.length === 0 && <p className="text-red-100 mt-10 ml-10">Todavía no hay rutinas disponibles</p>}
            <div className="flex flex-col w-[500px] p-5 px-10 justify-start pr-0 ">
              <p className="text-xs text-[#c6c6c6] mb-1">Seleccionar rutina</p>
              <div className="relative flex flex-row items-center">
                {/* Botón de lupa */}
                <button
                  type="submit"
                  className="h-[48px] w-[55px] bg-[#262626] text-white mb-2"
                  onClick={() => onSearch(query)}
                >
                  {svgIcons.SearchIcon({ className: 'w-[30px] text-white' })}
                </button>
                <input
                  type="text"
                  className="bg-[#262626] w-full h-[48px] text-[#f4f4f4] text-xs px-4 pr-10 focus:outline-none focus:border focus:border-[#ff0000] mb-2"
                  placeholder="Buscar rutina"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuery(value);
                  onSearch(value);
                }}
                />
                {query.length > 0 &&
                <button onClick={() => {
                  setShowSuggestions(false)
                  setQuery('');
                }
                }>
                  <svgIcons.CancelIcon className="absolute right-5 top-4 w-[20px] text-white"/>
                </button>
                }
                
              </div>              {/* Mostrar rutina seleccionada, sugerencias o rutinas recientes */}
              {selectedRoutine ? (
                <>
                  <div className="flex flex-row items-center mb-3">
                    <p className="text-xs">Rutina seleccionada</p>
                    <button className="ml-auto " onClick={() => {
                      onDeselect();
                      setSelectedRoutine(null);
                    }}>
                      <svgIcons.CancelIcon className={`w-[25px] h-auto text-white`} />
                    </button>
                  </div>

                  <div className="flex flex-row p-2 bg-[#ff0000] bg-opacity-20 border border-[#ff0000]">
                    <img src={selectedRoutine.creatorAvatarBase64} alt={selectedRoutine.creator} className="w-12 h-12 mr-4" />
                    <div className="flex flex-col">
                      <p className="text-white text-lg font-semibold">{selectedRoutine.name}</p>
                      <p className="text-white">{selectedRoutine.creator}</p>
                    </div>
                  </div>
                </>
              ) : showSuggestions ? (
                <>
                  <p className=" text-xs mt-3">Resultados de búsqueda</p>
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <button key={s.id} className="flex flex-row p-2 hover:bg-[#262626]" onClick={() => setSelectedRoutine(s)}>
                        <img src={s.creatorAvatarBase64} alt={s.creator} className="w-12 h-12 mr-4" />
                        <div className="flex flex-col">
                          <p className="text-white text-lg font-semibold">{s.name}</p>
                          <p className="text-white">{s.creator}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs pt-5 text-center">No se encontraron rutinas con ese nombre</p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-row justify-between items-center mb-2">
                    <p className="text-xs">Rutinas recientes</p>
                    <MiniPager back={{ enabled: page > 0, onClick: () => viewRoutines(page - 1) }} next={{ enabled: existMoreItems, onClick: () => viewRoutines(page + 1) }}/>
                  </div>  
                  
                  {routines.map((routine) => (
                    <button key={routine.id} className="flex flex-row p-2 hover:bg-[#262626] items-center" onClick={() => setSelectedRoutine(routine)}>
                      <img src={routine.creatorAvatarBase64} alt={routine.creator} className="w-12 h-12 mr-4" />
                      <div className="flex flex-col text-left w-[40%]">
                        <p className="text-white text-m font-semibold">{routine.name}</p>
                        <p className="text-white text-s">{routine.creator}</p>
                      </div>

                     <p className="text-white ml-20 text-xs w-[30%]">{routine.duration} minutos</p>
                    </button>
                  ))}
                </>
              )}

            </div>
        </div>
    )
}

export default RoutineSelector