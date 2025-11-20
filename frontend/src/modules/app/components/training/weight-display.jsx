import React from 'react'
import PropTypes from 'prop-types'

const WeightDisplay = ({ weight }) => {
 
  const plates = [
    { weight: 50, color: 'bg-gray-700', borderColor: 'border-gray-800' },
    { weight: 25, color: 'bg-red-500', borderColor: 'border-red-600' },
    { weight: 15, color: 'bg-yellow-400', borderColor: 'border-yellow-500' },
    { weight: 10, color: 'bg-green-500', borderColor: 'border-green-600' },
    { weight: 5, color: 'bg-white', borderColor: 'border-gray-400' },
    { weight: 2.5, color: 'bg-red-400', borderColor: 'border-red-500' },
    { weight: 1.25, color: 'bg-gray-400', borderColor: 'border-gray-500' },
  ];

  const calculatePlates = (totalWeight) => {
    if (totalWeight <= 0) return [];
    
    let remainingWeight = totalWeight; // El peso completo (sin contar la barra)
    const platesToAdd = [];

    for (const plate of plates) {
      while (remainingWeight >= plate.weight && platesToAdd.length < 6) {
        platesToAdd.push(plate);
        remainingWeight -= plate.weight;
        remainingWeight = Math.round(remainingWeight * 100) / 100;
      }
      if (platesToAdd.length >= 6) break;
    }

    return platesToAdd;
  };

  const platesToDisplay = calculatePlates(weight);

  return (
    <div className="flex flex-row justify-start items-center gap-0 h-[48px]" style={{ width: 'fit-content', minWidth: '60px' }}>
      {/* Barra olímpica compacta */}
      <div className="flex items-center">
        
        
        {/* Centro de la barra */}
        <div 
          className="h-2 w-4"
          style={{
            background: 'linear-gradient(180deg, #E5E7EB 0%, #9CA3AF 50%, #6B7280 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        />
        
        {/* Grip derecho */}
        
      </div>

      {/* Todos los discos en el lado derecho */}
      <div className="flex flex-row items-center gap-0.5">
        {platesToDisplay.map((plate, index) => {
          const size = Math.min(40, 20 + plate.weight * 0.8);
          const width = Math.min(10, Math.max(3, plate.weight * 0.3));
          
          return (
            <div
              key={`right-${index}`}
              className={`${plate.borderColor} rounded-full border flex-shrink-0`}
              style={{
                height: `${size}px`,
                width: `${width}px`,
                background: `radial-gradient(circle at 30% 30%, ${getColorValue(plate.color, 'light')}, ${getColorValue(plate.color, 'normal')} 50%, ${getColorValue(plate.color, 'dark')})`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4)'
              }}
            />
          );
        })}
      </div>
    </div>
  )
}

const getColorValue = (colorClass, shade) => {
  const colorMap = {
    'bg-gray-700': { light: '#9ca3af', normal: '#374151', dark: '#1f2937' },
    'bg-red-500': { light: '#f87171', normal: '#ef4444', dark: '#991b1b' },
    'bg-yellow-400': { light: '#fde047', normal: '#facc15', dark: '#a16207' },
    'bg-green-500': { light: '#4ade80', normal: '#22c55e', dark: '#15803d' },
    'bg-white': { light: '#ffffff', normal: '#f3f4f6', dark: '#9ca3af' },
    'bg-red-400': { light: '#fca5a5', normal: '#f87171', dark: '#b91c1c' },
    'bg-gray-400': { light: '#d1d5db', normal: '#9ca3af', dark: '#4b5563' },
  };
  
  return colorMap[colorClass]?.[shade] || '#9ca3af';
};

WeightDisplay.propTypes = {
  weight: PropTypes.number.isRequired,
}


export default WeightDisplay