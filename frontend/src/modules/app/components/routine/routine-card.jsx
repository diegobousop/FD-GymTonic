import { useNavigate } from 'react-router-dom';
import BubbleButton from '../common/bubble-button'
import { svgIcons } from '../../../../config/constants'
import PropTypes from 'prop-types';

const RoutineCard = ({ routine }) => {
      const navigate = useNavigate()
    return (
        <div key={routine.id} className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            {/* IZQUIERDA: Nombre y creador */}
            <div className="flex flex-col mb-3 sm:mb-0 sm:w-1/4">
                <h3 className="text-xl text-white font-bold flex items-center gap-2">
                    {!routine.isPublic && (
                        <span><svgIcons.RoutineVisibilityIcon className="text-red-700 w-5 h-5" /></span>
                    )}
                    <span>{routine.name} <small className="text-gray-400 text-sm">{routine.duration} min</small></span>
                </h3>
                <p className="text-gray-300 text-sm">Creada por: {routine.creator}</p>
            </div>

            {/* DERECHA: Ejercicios */}
            <div className="flex flex-wrap gap-3 sm:w-2/3 justify-start sm:justify-end">
                {routine.exercises && routine.exercises.length > 0 ? (
                routine.exercises.map((ex, i) => (
                    <div key={i} className="border border-red-700 text-red-700 px-3 py-1 text-l bg-transparent font-bold">
                        {ex.name}</div>
                ))
                ) : (
                <span className="text-gray-400 text-sm">No hay ejercicios</span>
                )}
            </div>

                <BubbleButton 
                    icon={<svgIcons.RoutineDetailsIcon 
                        className="text-[#ff0000]" 
                        title="Ver detalles de rutina"/>}
                    ariaLabel="Ver detalles de rutina"
                    title
                    size={50}
                    onClick={() => { navigate(`/routines/${routine.id}`); }}
                />
        </div>
    )}

RoutineCard.propTypes = {
  routine: PropTypes.object.isRequired,
};

export default RoutineCard;