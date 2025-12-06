import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Brush } from 'recharts';

const CustomCombinedTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    
    return (
      <div className="bg-[#161616]/95 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl z-50 min-w-[200px]">
        <p className="text-gray-400 text-xs mb-3 border-b border-gray-700 pb-2 font-mono">
            {new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex flex-col gap-2">
            {sortedPayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></div>
                    <span className="text-gray-200 text-xs font-medium">{entry.name}</span>
                </div>
                <span className="text-white text-sm font-bold font-mono">{entry.value} <span className="text-[10px] text-gray-500">series</span></span>
            </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

const MuscleUserGraphs = ({ stats }) => {
  const [currentData, setCurrentData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [showPieChart, setShowPieChart] = useState(true);

  const muscleGroups = [
    { key: 'PECHO', color: '#2563EB', label: 'Pecho' },      // Azul oscuro
    { key: 'ESPALDA', color: '#059669', label: 'Espalda' },    // Verde esmeralda
    { key: 'PIERNA', color: '#DB2777', label: 'Pierna' },      // Rosa oscuro
    { key: 'HOMBRO', color: '#D97706', label: 'Hombro' },      // Ámbar oscuro
    { key: 'BRAZO', color: '#7C3AED', label: 'Brazo' },        // Violeta oscuro
    { key: 'ABDOMEN', color: '#DC2626', label: 'Abdomen' },    // Rojo oscuro
    { key: 'FULLBODY', color: '#0D9488', label: 'Full Body' }, // Verde azulado oscuro
  ];

  useEffect(() => {
    if (!stats) return;

    const userStats = Array.isArray(stats) ? stats[0] : stats;
    if (!userStats || !userStats.periodMuscularGroupStats) return;

    let allStats = [];
    let muscleCounts = {};

    userStats.periodMuscularGroupStats.forEach(period => {
        if (period.muscularGroupStats) {
            period.muscularGroupStats.forEach(stat => {
                const entry = { date: stat.date };
                if (stat.exerciseCount) {
                    Object.keys(stat.exerciseCount).forEach(muscle => {
                        entry[muscle] = stat.exerciseCount[muscle];
                        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + stat.exerciseCount[muscle];
                    });
                }
                allStats.push(entry);
            });
        }
    });

    allStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    setCurrentData(allStats);

    const newPieData = muscleGroups.map(group => {
        return { name: group.label, value: muscleCounts[group.key] || 0, color: group.color };
    }).filter(item => item.value > 0);

    setPieData(newPieData);

  }, [stats]);

  if (!currentData || currentData.length === 0) {
      return <div className="text-white text-center mt-10">No hay datos disponibles para este periodo.</div>;
  }

  return (
    <div className="flex flex-col w-full mt-10">
      
      <div className="w-full h-[500px] bg-[#1e1e1e] p-4 rounded-xl shadow-lg mb-8 flex flex-col items-center relative">
        <div className="flex justify-between items-center w-full mb-4 px-4">
            <h3 className="text-white  text-lg">
                {showPieChart ? 'Distribución de entrenamiento' : 'Evolución por grupo muscular'}
            </h3>
            <button 
                onClick={() => setShowPieChart(!showPieChart)}
                className="px-4 py-2 bg-[#333] text-white text-xs rounded-full hover:bg-[#444] transition-colors border border-gray-600"
            >
                {showPieChart ? 'Ver Gráfico Lineal' : 'Ver Gráfico Circular'}
            </button>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {showPieChart ? (
            <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                <Legend />
            </PieChart>
          ) : (
            <LineChart
                data={currentData}
                margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{fontSize: 12}} 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                />
                <YAxis stroke="#888" tick={{fontSize: 12}} label={{ value: 'series', angle: -90, position: 'insideLeft', fill: '#888' }}/>
                <Tooltip content={<CustomCombinedTooltip />} />
                <Legend verticalAlign="top" height={36}/>
                <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#666" 
                    fill="#161616" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                />
                {muscleGroups.map((muscle) => (
                    <Line 
                        key={muscle.key}
                        type="monotone" 
                        dataKey={muscle.key} 
                        stroke={muscle.color} 
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        name={muscle.label}
                        connectNulls
                        animationDuration={1500}
                    />
                ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {muscleGroups.map((muscle) => (
          <div key={muscle.key} className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h3 className="text-white text-center mb-4 font-bold text-lg" style={{ color: muscle.color }}>
              {muscle.label}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={currentData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                  itemStyle={{ color: muscle.color }}
                />
                <Line 
                  type="monotone" 
                  dataKey={muscle.key} 
                  stroke={muscle.color} 
                  strokeWidth={3} 
                  dot={{r: 4, fill: muscle.color}} 
                  activeDot={{ r: 6 }}
                  name="Ejercicios"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MuscleUserGraphs