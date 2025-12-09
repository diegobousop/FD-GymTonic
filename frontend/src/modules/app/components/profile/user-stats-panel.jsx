import React from 'react'
import PropTypes from 'prop-types'
import UserStatsPentagrams from './user-stats-pentagrams'
import MyProfileTabSelector from './my-profile-tab-selector'
import ExerciseUserGraphs from './exercise-user-graphs'
import MuscleUserGraphs from './muscle-user-graphs'

const UserStatsPanel = ({activeTab, setActiveTab, selectedReps, setSelectedReps, selectedTime, setSelectedTime, stats, forbidden}) => {
  const [active, setActive] = React.useState('exercises');

  if (forbidden) {
    return (
      <div className="flex flex-col w-full px-5">
          <MyProfileTabSelector 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            selectedReps={selectedReps} 
            setSelectedReps={setSelectedReps} 
            selectedTime={selectedTime} 
            setSelectedTime={setSelectedTime} 
          />
          <div className="flex flex-col items-center justify-center h-full mt-20">
              <p className="text-xl text-gray-400">Debes seguir al usuario para ver sus estadísticas.</p>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-5">
        <MyProfileTabSelector 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          selectedReps={selectedReps} 
          setSelectedReps={setSelectedReps} 
          selectedTime={selectedTime} 
          setSelectedTime={setSelectedTime} 
        />
        <UserStatsPentagrams selectedReps={selectedReps} selectedTime={selectedTime} stats={stats} />
        <div className="flex rounded-full flex-row py-1 bg-[#262626] w-fit mt-10 gap-1">
          <button 
            className={`px-6 rounded-full transition-all duration-300 font-regular text-sm ${active === 'exercises' ? 'bg-[#990000] text-white shadow-md' : 'text-gray-400 hover:text-white'}`} 
            onClick={() => setActive('exercises')}
          >
            EJERCICIOS
          </button> 
          <button 
            className={`px-6 py-2 rounded-full transition-all duration-300 font-regular text-sm ${active === 'muscleGroups' ? 'bg-[#990000] text-white shadow-md' : 'text-gray-400 hover:text-white'}`} 
            onClick={() => setActive('muscleGroups')}
          >
            GRUPOS MUSCULARES
          </button> 
        </div>

        {active === 'exercises' &&(
          <ExerciseUserGraphs 
            selectedReps={selectedReps} 
            setSelectedReps={setSelectedReps} 
            selectedTime={selectedTime} 
            setSelectedTime={setSelectedTime}
            stats={stats}
          />
        )}
        {active === 'muscleGroups' &&(
          <MuscleUserGraphs
            stats={stats}
          />
        )}
    </div>
  )
}

export default UserStatsPanel

UserStatsPanel.propTypes = {
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
  selectedReps: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  setSelectedReps: PropTypes.func,
  selectedTime: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  setSelectedTime: PropTypes.func,
  stats: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
};

