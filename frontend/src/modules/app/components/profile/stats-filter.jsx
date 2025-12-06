import React, { useState } from 'react'

const StatsFilter = ({ selectedReps, setSelectedReps, selectedTime, setSelectedTime }) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeOptions = [
    { label: 'Último año', value: 'YEAR' },
    { label: 'Último mes', value: 'MONTH' },
    { label: 'Última semana', value: 'WEEK' },
  ];

  const currentLabel = timeOptions.find(opt => opt.value === selectedTime)?.label || 'Último año';

  return (
    <div className="flex items-center h-[40px] mt-2 rounded-full border bg-[#262626] border-[#990000] gap-2 relative z-18">
        <p className="absolute bottom-12 left-0 ml-2 text-xs">Repeticiones</p>
        <div className="flex flex-row  bg-transparent border rounded-full border-[#990000]">
            {[1, 8, 10].map((reps) => (
                <button
                    key={reps}
                    onClick={() => setSelectedReps && setSelectedReps(Number(reps))}
                    className={`px-4 py-2 text-white rounded-full transition-colors ${
                        selectedReps === Number(reps)
                            ? 'bg-[#ff0000]'
                            : 'hover:bg-[#990000]/50'
                    }`}
                >
                    {reps}
                </button>
            ))}
            {selectedReps !== 0 && (
                <button
                    onClick={() => setSelectedReps && setSelectedReps(0)}
                    className={`px-4 py-2 text-white rounded-full transition-colors hover:bg-[#990000]/50`}
                    title="Limpiar selección"
                >
                    ✕
                </button>
            )}
        </div>

        <div className="relative z-[18]">
            <p className="absolute bottom-12 left-0 ml-2 text-xs">Tiempo</p>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 text-white rounded-full hover:bg-[#990000]/20 transition-colors flex items-center gap-2"
            >
                {currentLabel}
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <div className={`absolute right-0 top-full mt-4 w-48 bg-[#262626] border
             border-[#990000] rounded-xl overflow-hidden shadow-xl transition-all duration-300 origin-top-right ${
                isOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
                {timeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            setSelectedTime && setSelectedTime(option.value);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            selectedTime === option.value 
                                ? 'bg-[#990000] text-white' 
                                : 'text-gray-300 hover:bg-[#990000]/30'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
  )
}

export default StatsFilter