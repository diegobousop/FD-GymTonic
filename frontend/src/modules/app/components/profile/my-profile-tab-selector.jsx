import React from 'react'
import { svgIcons } from '../../../../config/constants'

const MyProfileTabSelector = () => {
  return (
    <div>
      
  
      <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-[#2F2828] to-[#602B2B]">
        <svgIcons.TrainingIcon />
        <button className="px-4 py-2 bg-[#161616] text-white rounded-full">
          
          <p className="text-white">Entrenamientos</p>
        </button>
      </div>
      
      
      
    </div>
  )
}

export default MyProfileTabSelector