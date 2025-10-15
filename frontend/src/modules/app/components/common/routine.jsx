import { Link } from 'react-router-dom';
const Routine = ({ routine }) => (
    <div key={routine.id} className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        {/* IZQUIERDA: Nombre y creador */}
        <div className="flex flex-col mb-3 sm:mb-0 sm:w-1/4">
            <h3 className="text-xl text-white font-bold">
            {routine.name} <small className="text-gray-400 text-sm">{routine.duration} min</small>
            </h3>
            <p className="text-gray-300 text-sm">Creada por: {routine.creator}</p>
        </div>

        {/* CENTRO: Grupos musculares y dificultad */}
        <div className="flex flex-col items-center self-start">
            <p className="text-gray-300 text-sm">Full-Body {/* {routine.GruposMusculares} */}</p>
            <p className="text-black text-m bg-yellow-500 rounded-xl px-2 py-0.5">INTERMEDIO{/* {routine.dificultad} */}</p>
        </div>

        {/* DERECHA: Ejercicios */}
        <div className="flex flex-wrap gap-3 sm:w-2/3 justify-start sm:justify-end">
            {routine.exercises && routine.exercises.length > 0 ? (
            routine.exercises.map((ex, i) => (
                <div key={i} className="border border-red-700 text-red-700 px-3 py-1 text-l bg-transparent font-bold">
                {ex.name} <small className="text-gray-300"> x4{/* {ex.series} */}</small>
                </div>
            ))
            ) : (
            <span className="text-gray-400 text-sm">No hay ejercicios</span>
            )}
        </div>
        <Link to={`/routines/${routine.id}`}>
        <button className="flex items-center text-white text-lg px-2 py-1 rounded hover:bg-red-700 ml-5">→</button>
        </Link>
    </div>
);

export default Routine;