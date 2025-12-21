import React from 'react'
import { svgIcons } from '../../../../config/constants'
import StatsFilter from './stats-filter'
import PropTypes from 'prop-types'

const MyProfileTabSelector = ({activeTab, setActiveTab, selectedReps, setSelectedReps, selectedTime, setSelectedTime}) => {
  const isTrainingActive = activeTab === 'trainingHistory';
  const isStatsActive = activeTab === 'userStats';
  const isBadgesActive = activeTab === 'badges';
  const isYearSummaryActive = activeTab === 'yearSummary';
  const activeSize = 'px-3 py-1.5 text-sm';
  const inactiveSize = 'px-2.5 py-1 text-xs';
  return (
    <div className="m-3 flex flex-row gap-3 mt-6 items-center">
  
      <div className={`inline-block p-[2px] rounded-full ${isTrainingActive ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B]' : ''} `}>
        <button 
          className={`flex flex-row items-center ${isTrainingActive ? activeSize : inactiveSize} bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]`}
          onClick={() => setActiveTab('trainingHistory')}
          >
          <svgIcons.TrainingIcon className={`${isTrainingActive ? 'h-8' : 'h-6'} mr-2`} />
          <p className={`text-white ${isTrainingActive ? 'text-sm' : 'text-xs'}`}>Entrenamientos</p>
        </button>
      </div>

      <div className={`inline-block p-[2px] rounded-full ${isStatsActive ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B] ' : ''} `}>
        <button 
          className={`flex flex-row items-center ${isStatsActive ? activeSize : inactiveSize} bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]`}
          onClick={() => setActiveTab('userStats')}
          >
          <svgIcons.StatsIcon className={`${isStatsActive ? 'h-8' : 'h-6'} mr-2`} />
          <p className={`text-white ${isStatsActive ? 'text-sm' : 'text-xs'}`}>Estadísticas</p>
        </button>
      </div>

      <div className={`inline-block p-[2px] rounded-full ${isBadgesActive ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B] ' : ''} `}>
        <button 
          className={`flex flex-row items-center ${isBadgesActive ? activeSize : inactiveSize} bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]`}
          onClick={() => setActiveTab('badges')}
          >
          <svgIcons.StatsIcon className={`${isBadgesActive ? 'h-8' : 'h-6'} mr-2`} />
          <p className={`text-white ${isBadgesActive ? 'text-sm' : 'text-xs'}`}>Medallas</p>
        </button>
      </div>

      <div className={`inline-block p-[2px] rounded-full ${isYearSummaryActive ? 'bg-gradient-to-r from-[#2F2828] to-[#602B2B] ' : ''} `}>
        <button 
          className={`flex flex-row items-center ${isYearSummaryActive ? activeSize : inactiveSize} bg-[#161616] text-white rounded-full hover:bg-[#ff0000e1]`}
          onClick={() => setActiveTab('yearSummary')}
          >
          <svgIcons.StatsIcon className={`${isYearSummaryActive ? 'h-8' : 'h-6'} mr-2`} />
          <p className={`text-white ${isYearSummaryActive ? 'text-sm' : 'text-xs'}`}>Resumen Anual</p>
        </button>
      </div>
      
      {activeTab === 'userStats' && (
        <StatsFilter 
          selectedReps={selectedReps} 
          setSelectedReps={setSelectedReps} 
          selectedTime={selectedTime} 
          setSelectedTime={setSelectedTime} 
        />
      )}
      
      
      
    </div>
  )
}

MyProfileTabSelector.propTypes = {
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
  selectedReps: PropTypes.number,
  setSelectedReps: PropTypes.func,
  selectedTime: PropTypes.string,
  setSelectedTime: PropTypes.func
}

export default MyProfileTabSelector