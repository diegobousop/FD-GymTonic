import PropTypes from 'prop-types'

const STATUE_OF_LIBERTY_WEIGHT = 225000 // kg

const formatWeight = (weight) => {
  if (weight >= 1000000) {
    return `${(weight / 1000000).toFixed(1)}M kg`
  } else if (weight >= 1000) {
    return `${(weight / 1000).toFixed(0)}k kg`
  }
  return `${weight} kg`
}

const formatMuscleGroup = (muscleGroup) => {
  const mapping = {
    'PECHO': 'Pecho',
    'ESPALDA': 'Espalda',
    'PIERNA': 'Pierna',
    'HOMBRO': 'Hombro',
    'BRAZO': 'Brazo',
    'ABDOMEN': 'Abdomen',
    'FULLBODY': 'Fullbody'
  }
  return mapping[muscleGroup] || muscleGroup
}

const StatueOfLibertySVG = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 300" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'float 3s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="statueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Base/Pedestal */}
      <rect x="70" y="240" width="60" height="30" fill="#4b5563" />
      
      {/* Statue body */}
      <path 
        d="M 100 60 L 70 100 L 70 200 L 100 240 L 130 200 L 130 100 Z" 
        fill="url(#statueGradient)" 
      />
      
      {/* Crown */}
      <circle cx="100" cy="40" r="15" fill="url(#statueGradient)" />
      <circle cx="85" cy="35" r="4" fill="#93c5fd" />
      <circle cx="100" cy="32" r="4" fill="#93c5fd" />
      <circle cx="115" cy="35" r="4" fill="#93c5fd" />
      
      {/* Torch (raised right arm) */}
      <line x1="130" y1="100" x2="150" y2="80" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      <circle cx="150" cy="75" r="8" fill="#fbbf24" />
      
      {/* Tablet (left arm) */}
      <rect x="60" y="110" width="15" height="25" fill="#93c5fd" rx="2" />
      
      {/* Drapery/folds */}
      <path d="M 90 140 Q 85 150 90 160" stroke="#3b82f6" strokeWidth="2" fill="none" />
      <path d="M 110 140 Q 115 150 110 160" stroke="#3b82f6" strokeWidth="2" fill="none" />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </svg>
  )
}

StatueOfLibertySVG.propTypes = {
  className: PropTypes.string
}

const TrainingCalendarSVG = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'pulse 2s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Calendar base */}
      <rect x="30" y="40" width="140" height="140" rx="8" fill="url(#calendarGradient)" />
      <rect x="30" y="40" width="140" height="30" rx="8" fill="#1e40af" />
      
      {/* Calendar rings */}
      <circle cx="70" cy="110" r="8" fill="#ffffff" opacity="0.9" />
      <circle cx="100" cy="110" r="8" fill="#ffffff" opacity="0.9" />
      <circle cx="130" cy="110" r="8" fill="#ffffff" opacity="0.9" />
      <circle cx="70" cy="140" r="8" fill="#ffffff" opacity="0.9" />
      <circle cx="100" cy="140" r="8" fill="#ffffff" opacity="0.9" />
      <circle cx="130" cy="140" r="8" fill="#ffffff" opacity="0.9" />
      
      {/* Calendar header text */}
      <text x="100" y="62" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">2025</text>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </svg>
  )
}

TrainingCalendarSVG.propTypes = {
  className: PropTypes.string
}

const ExerciseDumbbellSVG = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 150" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'lift 2s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="dumbbellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Left weight */}
      <rect x="20" y="50" width="25" height="50" rx="4" fill="url(#dumbbellGradient)" />
      <rect x="22" y="52" width="21" height="46" rx="2" fill="#fcd34d" />
      
      {/* Bar */}
      <rect x="45" y="68" width="110" height="14" rx="2" fill="#9ca3af" />
      
      {/* Right weight */}
      <rect x="155" y="50" width="25" height="50" rx="4" fill="url(#dumbbellGradient)" />
      <rect x="157" y="52" width="21" height="46" rx="2" fill="#fcd34d" />
      
      <style>{`
        @keyframes lift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </svg>
  )
}

ExerciseDumbbellSVG.propTypes = {
  className: PropTypes.string
}

const MuscleGroupSVG = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 250" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'flex 2s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Simplified figure - torso and arms */}
      {/* Head */}
      <circle cx="100" cy="40" r="20" fill="url(#muscleGradient)" opacity="0.8" />
      
      {/* Torso */}
      <ellipse cx="100" cy="100" rx="35" ry="50" fill="url(#muscleGradient)" />
      
      {/* Left arm */}
      <ellipse cx="60" cy="110" rx="12" ry="40" fill="url(#muscleGradient)" transform="rotate(-20 60 110)" />
      
      {/* Right arm */}
      <ellipse cx="140" cy="110" rx="12" ry="40" fill="url(#muscleGradient)" transform="rotate(20 140 110)" />
      
      {/* Muscle highlights */}
      <ellipse cx="100" cy="90" rx="20" ry="25" fill="#f472b6" opacity="0.5" />
      <ellipse cx="85" cy="105" rx="8" ry="15" fill="#f472b6" opacity="0.5" />
      <ellipse cx="115" cy="105" rx="8" ry="15" fill="#f472b6" opacity="0.5" />
      
      <style>{`
        @keyframes flex {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </svg>
  )
}

MuscleGroupSVG.propTypes = {
  className: PropTypes.string
}

const FireStreakSVG = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 250" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'flicker 1.5s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="fireGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="fireGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fcd34d', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      
      {/* Main flame */}
      <path d="M 100 250 L 70 200 L 65 150 Q 70 130 85 140 Q 100 120 115 140 Q 130 130 135 150 L 130 200 Z" 
            fill="url(#fireGradient1)" />
      
      {/* Inner flame */}
      <path d="M 100 250 L 80 210 L 78 170 Q 85 155 95 162 Q 100 150 105 162 Q 115 155 122 170 L 120 210 Z" 
            fill="url(#fireGradient2)" />
      
      {/* Small flame on left */}
      <path d="M 65 170 L 55 150 L 50 130 Q 55 120 60 125 Q 65 115 70 125 Q 75 120 80 130 Z" 
            fill="#fbbf24" opacity="0.7" />
      
      {/* Small flame on right */}
      <path d="M 135 170 L 145 150 L 150 130 Q 145 120 140 125 Q 135 115 130 125 Q 125 120 120 130 Z" 
            fill="#fbbf24" opacity="0.7" />
      
      <style>{`
        @keyframes flicker {
          0%, 100% { 
            transform: scaleY(1) scaleX(1);
            opacity: 1;
          }
          25% { 
            transform: scaleY(1.05) scaleX(0.98);
            opacity: 0.95;
          }
          50% { 
            transform: scaleY(0.98) scaleX(1.02);
            opacity: 1;
          }
          75% { 
            transform: scaleY(1.02) scaleX(0.99);
            opacity: 0.98;
          }
        }
      `}</style>
    </svg>
  )
}

FireStreakSVG.propTypes = {
  className: PropTypes.string
}

const YearSummaryCard = ({ card, year }) => {
  if (!card) return null

  const renderContent = () => {
    switch (card.type) {
      case 'totalTrainings':
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-4">{card.title}</p>
              <p className="text-white text-lg mb-3">
                El número de entrenamientos totales de todo el año
              </p>
              <p className="text-white text-6xl font-bold mb-4">{card.value}</p>
            </div>
            
            {/* Calendar illustration */}
            <div className="flex justify-center items-center mb-4">
              <TrainingCalendarSVG className="w-32 h-auto" />
            </div>
            
            <div className="text-center">
              <p className="text-white text-xl">{card.subtitle}</p>
            </div>
          </>
        )

      case 'mostUsedExercise':
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-4">{card.title}</p>
              <p className="text-white text-lg mb-3">
                El ejercicio que más veces hiciste
              </p>
              <p className="text-white text-4xl font-bold mb-4">{card.value}</p>
            </div>
            
            {/* Dumbbell illustration */}
            <div className="flex justify-center items-center mb-4">
              <ExerciseDumbbellSVG className="w-40 h-auto" />
            </div>
            
            <div className="text-center">
              <p className="text-white text-lg">{card.subtitle}</p>
            </div>
          </>
        )

      case 'mostTrainedMuscleGroup':
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-4">{card.title}</p>
              <p className="text-white text-lg mb-3">
                El grupo muscular más entrenado
              </p>
              <p className="text-white text-4xl font-bold mb-4">{formatMuscleGroup(card.value)}</p>
            </div>
            
            {/* Muscle group illustration */}
            <div className="flex justify-center items-center mb-4">
              <MuscleGroupSVG className="w-32 h-auto" />
            </div>
            
            <div className="text-center">
              <p className="text-white text-lg">{card.subtitle}</p>
            </div>
          </>
        )

      case 'totalWeight':
        const statues = card.statuesOfLiberty || 0
        const formattedWeight = formatWeight(card.value)
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-4">{card.title}</p>
              <p className="text-white text-lg mb-3">
                El peso total que has<br />levantado es
              </p>
              <p className="text-white text-6xl font-bold mb-6">{formattedWeight}</p>
            </div>
            
            {/* Statue of Liberty illustration */}
            <div className="flex justify-center items-center mb-6">
              <StatueOfLibertySVG className="w-40 h-auto" />
            </div>
            
            <div className="text-center">
              <p className="text-white text-lg">
                ¡Eso equivale a levantar {statues.toFixed(1)}<br />estatuas de la Libertad!
              </p>
            </div>
          </>
        )

      case 'longestStreak':
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-4">{card.title}</p>
              <p className="text-white text-lg mb-3">
                La mayor racha diaria conseguida
              </p>
              <p className="text-white text-6xl font-bold mb-4">{card.value}</p>
            </div>
            
            {/* Fire streak illustration */}
            <div className="flex justify-center items-center mb-4">
              <FireStreakSVG className="w-32 h-auto" />
            </div>
            
            <div className="text-center">
              <p className="text-white text-xl">{card.subtitle}</p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-[#1a1f3a] rounded-xl p-8 min-h-[500px] flex flex-col justify-between shadow-xl">
      {renderContent()}
      
      {/* Footer with logo/branding */}
      <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-700">
        <div className="text-white font-bold text-lg tracking-wide">GYMTONIC</div>
        <div className="text-gray-400 text-xs">@{year}</div>
      </div>
    </div>
  )
}

YearSummaryCard.propTypes = {
  card: PropTypes.shape({
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtitle: PropTypes.string,
    statuesOfLiberty: PropTypes.number
  }).isRequired,
  year: PropTypes.number.isRequired
}

export default YearSummaryCard

