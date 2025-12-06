import React from 'react'
import { svgIcons } from '../../../../config/constants'
import StatsFilter from './stats-filter'

const MyProfileTabSelector = ({activeTab, setActiveTab, selectedReps, setSelectedReps, selectedTime, setSelectedTime}) => {
  return (
    <div className="m-5 flex flex-row gap-4 mt-8">
  
      <div className={`inline-block p-[2px] rounded-full ${activeTab === 'trainingHistory' ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B]' : ''} `}>
        <button 
          className="flex flex-row items-center px-4 py-2 bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]"
          onClick={() => setActiveTab('trainingHistory')}
          >
          <svgIcons.TrainingIcon className="h-10 mr-2" />
          <p className="text-white">Entrenamientos</p>
        </button>
      </div>

      <div className={`inline-block p-[2px] rounded-full ${activeTab === 'userStats' ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B] ' : ''} `}>
        <button 
          className="flex flex-row items-center px-4 py-2 bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]"
          onClick={() => setActiveTab('userStats')}
          >
          <svgIcons.StatsIcon className="h-10 mr-2" />
          <p className="text-white">Estadísticas</p>
        </button>
      </div>

      <StatsFilter selectedReps={selectedReps} setSelectedReps={setSelectedReps} selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
      
      
      
    </div>
  )
}

export default MyProfileTabSelector