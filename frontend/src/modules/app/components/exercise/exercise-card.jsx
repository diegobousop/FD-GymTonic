import React from 'react'
import { svgIcons } from '../../../../config/constants'
import PropTypes from 'prop-types'


const ExerciseCard = ({exercise, onValidate, onDecline}) => {
  return (
    <div className="flex flex-row mb-5 items-center justify-start">

        <img src={exercise.ownerAvatar.avatarBase64} alt={exercise.ownerName} className="w-[52px] h-[52px] mr-5"/>
        
        <div className="flex flex-col min-w-[20%] max-w-[20%]">  
            <p className="truncate font-semibold">{exercise.name}</p>
            <p>{exercise.ownerName}</p>
        </div>

        <p className="w-[10%]">{exercise.grupoMuscular}</p>

        <p className="w-[10%]"></p>

        <p className="w-[40%] line-clamp-3">{exercise.descripcion}</p>

        <div className="w-[20%] flex justify-center gap-5">
            {onValidate && (
              <button onClick={onValidate} aria-label="Validate Exercise" className="bg-[#262626] p-3 hover:bg-[#3a3a3a]">
                  <svgIcons.AcceptIcon  className="w-[30px] h-auto text-white"/>
              </button>
            )}

            {onDecline && (
              <button onClick={onDecline} aria-label="Block Exercise" className="bg-[#262626] p-3 hover:bg-[#3a3a3a]">
                  <svgIcons.CancelIcon  className="w-[30px] h-auto text-white"/>
              </button>
            )}
        </div>
    </div>
  )
}

ExerciseCard.propTypes = {
   exercise: PropTypes.object.isRequired,
   onValidate: PropTypes.func,
   onDecline: PropTypes.func
} 

export default ExerciseCard