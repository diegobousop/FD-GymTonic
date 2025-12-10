import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList, Brush } from 'recharts';

const buildStatsFromUserStats = (userStats) => {
  const allStats = [];
  const exerciseSet = new Set();
  const exerciseCounts = {};

  const addExerciseEntry = (entry, weights) => {
    Object.keys(weights).forEach((exName) => {
      entry[exName] = weights[exName];
      exerciseSet.add(exName);
      exerciseCounts[exName] = (exerciseCounts[exName] || 0) + 1;
    });
  };

  const processStat = (stat) => {
    const entry = { date: stat.date, isPR: stat.isPR || {} };
    if (stat.exerciseWeightsKg) {
      addExerciseEntry(entry, stat.exerciseWeightsKg);
    }
    allStats.push(entry);
  };

  const processPeriod = (period) => {
    if (!period.exerciseStats) return;
    period.exerciseStats.forEach(processStat);
  };

  userStats.periodExerciseStats.forEach(processPeriod);

  return { allStats, exerciseSet, exerciseCounts };
};

const CustomizedLabel = (props) => {
  const { x, y, index, dataKey, currentData } = props;
  const isPR = currentData[index]?.isPR?.[dataKey];
  
  if (!isPR) return null;

  return (
    <text x={x} y={y} dy={-10} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight="bold">
      PR 🏆
    </text>
  );
};

CustomizedLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  index: PropTypes.number,
  dataKey: PropTypes.string.isRequired,
  currentData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
      isPR: PropTypes.object,
    })
  ).isRequired,
};

const CustomCombinedTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    
    return (
      <div className="bg-[#161616]/95 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl z-50 min-w-[200px]">
        <p className="text-gray-400 text-xs mb-3 border-b border-gray-700 pb-2 font-mono">
            {new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex flex-col gap-2">
            {sortedPayload.map((entry) => (
            <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></div>
                    <span className="text-gray-200 text-xs font-medium">{entry.name}</span>
                </div>
                <span className="text-white text-sm font-bold font-mono">{entry.value} <span className="text-[10px] text-gray-500">kg</span></span>
            </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

CustomCombinedTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      name: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
};

const ExerciseUserGraphs = ({ stats, selectedReps, setSelectedReps, selectedTime, setSelectedTime }) => {
  
  const [currentData, setCurrentData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [showPieChart, setShowPieChart] = useState(true);

  useEffect(() => {
    if (!stats) return;

    const userStats = Array.isArray(stats) ? stats[0] : stats;
    
    if (!userStats?.periodExerciseStats) return;

    const { allStats, exerciseSet, exerciseCounts } = buildStatsFromUserStats(userStats);

    allStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    setCurrentData(allStats);

    let exerciseList = Array.from(exerciseSet).map(key => ({ key, label: key }));
    
    exerciseList.sort((a, b) => (exerciseCounts[b.key] || 0) - (exerciseCounts[a.key] || 0));
    setExercises(exerciseList.slice(0, 10));

    let newPieData = Object.keys(exerciseCounts).map(key => ({
        name: key,
        value: exerciseCounts[key]
    }));

    newPieData.sort((a, b) => b.value - a.value);

    if (newPieData.length > 10) {
        const top10 = newPieData.slice(0, 10);
        const others = newPieData.slice(10);
        const othersValue = others.reduce((sum, item) => sum + item.value, 0);
        
        top10.push({ name: 'Otros', value: othersValue });
        newPieData = top10;
    }

    setPieData(newPieData);

  }, [stats]);

  const pieColors = ['#EF4444', '#B91C1C', '#991B1B', '#7F1D1D', '#F87171'];

  if (!currentData || currentData.length === 0) {
      return <div className="text-white text-center mt-10">No hay datos disponibles para este periodo.</div>;
  }

  return (
    <div className="flex flex-col w-full mt-10">

      <div className="w-full h-[500px] bg-[#1e1e1e] p-4 rounded-xl shadow-lg mb-8 flex flex-col items-center relative">
        <div className="flex justify-between items-center w-full mb-4 px-4">
            <h3 className="text-white  text-lg">
                {showPieChart ? 'Ejercicios más practicados' : 'Comparativa de progresión'}
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
                  <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
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
                <YAxis stroke="#888" tick={{fontSize: 12}} label={{ value: 'kg', angle: -90, position: 'insideLeft', fill: '#888' }}/>
                <Tooltip content={<CustomCombinedTooltip />} />
                <Legend verticalAlign="top" height={36}/>
                <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#666" 
                    fill="#161616" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                />
                {exercises.map((ex, index) => (
                    <Line 
                        key={ex.key}
                        type="monotone" 
                        dataKey={ex.key} 
                        stroke={['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'][index % 10]} 
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        name={ex.label}
                        connectNulls
                        animationDuration={1500}
                    />
                ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Grilla de Gráficos Lineales (Progresión de Cargas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {exercises.map((exercise) => (
          <div key={exercise.key} className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h3 className="text-white text-center mb-4 font-bold text-lg" style={{ color: '#EF4444' }}>
              {exercise.label}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={currentData}
                margin={{
                  top: 30,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} allowDecimals={false} label={{ value: 'kg', angle: -90, position: 'insideLeft', fill: '#888' }}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#EF4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={exercise.key} 
                  stroke="#EF4444" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#EF4444'}} 
                  activeDot={{ r: 6 }}
                  name="Peso (kg)"
                  connectNulls
                >
                  <LabelList content={<CustomizedLabel dataKey={exercise.key} currentData={currentData} />} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}

ExerciseUserGraphs.propTypes = {
  stats: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
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
};

export default ExerciseUserGraphs