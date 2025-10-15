import React from 'react'
import { SVG_ICONS } from '../../../../config/constants'


const ExerciseCard = ({exercise, onValidate, onDecline}) => {
  return (
    <div className="flex flex-row mb-5 items-center justify-start">
        
        <div className="flex flex-col w-[50%]">  
            <p>{exercise.name}</p>
            <p>{exercise.descripcion}</p>
        </div>

        <p className="w-[20%]">{exercise.grupoMuscular}</p>

        <div className="w-[30%] flex justify-center gap-5">
            <button onClick={onValidate} className="bg-[#262626] p-3 hover:bg-[#3a3a3a]">
                <SVG_ICONS.AcceptIcon  className="w-[30px] h-auto text-white"/>
            </button>

            <button onClick={onDecline}  className="bg-[#262626] p-3 hover:bg-[#3a3a3a]">
                <SVG_ICONS.CancelIcon  className="w-[30px] h-auto text-white"/>
            </button>
        </div>
    </div>
  )
}

export default ExerciseCard