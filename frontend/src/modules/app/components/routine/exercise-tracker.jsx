import React from 'react'
import WeightDisplay from '../training/weight-display';
import { svgIcons } from '../../../../config/constants'
import PropTypes from 'prop-types'


const ExerciseTracker = ({ key, exercise, onUpdateSerie }) => {

  const handleRepeticionesChange = (serieIndex, delta) => {
    const newRepeticiones = Math.max(0, (exercise.series[serieIndex].repeticiones || 0) + delta)
    onUpdateSerie(exercise.id, serieIndex, 'repeticiones', newRepeticiones)
  }

  const handlePesoChange = (serieIndex, delta) => {
    const newPeso = Math.max(0, (exercise.series[serieIndex].peso || 0) + delta)
    onUpdateSerie(exercise.id, serieIndex, 'peso', newPeso)
  }

  const handleRepeticionesInput = (serieIndex, value) => {
    const numValue = parseInt(value)
    onUpdateSerie(exercise.id, serieIndex, 'repeticiones', Math.max(0, numValue))
  }

  const handlePesoInput = (serieIndex, value) => {
    const numValue = parseFloat(value) 
    onUpdateSerie(exercise.id, serieIndex, 'peso', Math.max(0, numValue))
  }

  return (
    <div className="flex flex-row w-full mb-10">
      <div key={key} className="w-[40%] max-w-[500px] min-w-[50%]">
          <div className="flex flex-row w-[70%]">
              <p className=" mb-1 w-[13%] text-left text-xs">Nº</p>
              <p className=" mb-1 w-[30%] text-left text-xs">Nombre</p>
              <p className=" mb-1 w-[30%] text-left text-xs">Series</p>
          </div>
          <div className="flex flex-row h-[48px] bg-[#262626] items-center  border-b border-b-[#6F6F6F] w-[80%]">
              <p className="w-[13%] text-white  text-left pl-5">{exercise.id}</p>
              <p className="w-[30%] text-lg font-semibold text-white">{exercise.name || `Ejercicio ${key + 1}`}</p>
              <p className="w-[30%] text-lg font-regular text-white">{exercise.numeroSeries || `Ejercicio ${key + 1}`}</p>
          </div>
          
          {/* Series con el mismo estilo */}
          <div className="mb-3 w-[80%]">
            <div className="flex flex-row mt-2 justify-start w-[80%]">
              <p className="mb-1 w-[15%] text-left text-xs">Serie</p>
              <p className="mb-1 w-[30%] text-left text-xs">Repeticiones</p>
              <div className="w-[10%]"></div>
              <p className="mb-1 w-[40%] text-left text-xs">Peso (kg)</p>
            </div>
            
            {exercise.series.map((serie, sIndex) => (
              <div key={sIndex} className="flex flex-row h-[48px]  items-center">
                <div className="flex flex-row h-[48px] items-center border-b border-b-[#6F6F6F]  bg-[#262626]">

                  <p className="w-[15%] text-white text-left pl-5">{sIndex + 1}</p>
                  
                  {/** Input de repeticiones **/}
                  <input 
                    type="number"
                    min="0"
                    value={serie.repeticiones}
                    onChange={(e) => handleRepeticionesInput(sIndex, e.target.value)}
                    className="w-[10%] h-[48px] text-white bg-transparent focus:border-[#ff0000] focus:outline-none"
                  />
                  
                  {/** Botones para modificar repeticiones **/}
                  <button 
                    className="w-[10%] h-[48px] text-white hover:bg-[#3a3a3a]"
                    onClick={() => handleRepeticionesChange(sIndex, 1)}
                    onHold
                  >
                    <svgIcons.AddIcon className="w-20"/>
                  </button>
                  <button 
                    className="w-[10%] h-[48px] text-white hover:bg-[#3a3a3a]"
                    onClick={() => handleRepeticionesChange(sIndex, -1)}
                  >
                    <svgIcons.MinusIcon className="w-20"/>
                  </button>

                  <div className="w-[10%]"></div>

                  {/** Input de peso **/}
                  <input 
                    type="number"
                    min="0"
                    step="0.5"
                    value={serie.peso}
                    onChange={(e) => handlePesoInput(sIndex, e.target.value)}
                    className="w-[20%] h-[48px] text-white bg-transparent focus:border-[#ff0000] focus:outline-none"
                  />

                  {/** Botones para modificar peso **/}
                  <button 
                    className="w-[10%] h-[48px] text-white hover:bg-[#3a3a3a]"
                    onClick={() => handlePesoChange(sIndex, 1)}
                  >
                    <svgIcons.AddIcon className="w-20"/>
                  </button>
                  <button 
                    className="w-[10%] h-[48px] text-white hover:bg-[#3a3a3a]"
                    onClick={() => handlePesoChange(sIndex, -1)}
                  >
                    <svgIcons.MinusIcon className="w-20"/>
                  </button>

                </div>
                
                

                <div className="w-[20%]">
                  <WeightDisplay weight={serie.peso} />
                </div>

              </div>
            ))}
          </div>
      </div>

      <div className="flex flex-row">
        <img src={exercise.exerciseImageBase64} alt={exercise.name} className="w-[200px] h-[200px] mt-4" />
        <p className="text-white mt-5 p-5">{exercise.descripcion}</p>
      </div>

    </div>
  )
}

ExerciseTracker.propTypes = {
  key: PropTypes.number,
  exercise: PropTypes.object.isRequired,
  onUpdateSerie: PropTypes.func
};

export default ExerciseTracker