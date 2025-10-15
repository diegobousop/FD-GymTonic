import React, {useEffect, useState} from 'react'
import backend from "../../../backend";
import { useToast } from '../components/common//toast-provider'

import ExerciseCard from '../components/exercise/exercise-card'
import Spinner from '../components/common/spinner';
import Pager from '../components/common/pager';

import { SVG_ICONS } from '../../../config/constants'

const ValidateExercises = () => {
    const { showToast } = useToast()
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [page, setPage] = useState(0);
    const size = 8;

    const [exercises, setExercises] = useState([]);
    
    const viewExercises = (pageNumber) => {
        setLoading(true);
        backend.exerciseService.getUnvalidatedExercises(
          { page: pageNumber, size },
          (data) => {
            setExercises(data.items);
            setExistMoreItems(data.existMoreItems);
            setPage(pageNumber);
            setLoading(false);
          },
          (err) => {
            setError(err || "Error inesperado al cargar ejercicios");
            setLoading(false);
          }
        );
      };

    
    useEffect(() => {
        viewExercises(0);
    }, []);

    const validateExercise = (exerciseId) => {
        backend.exerciseService.validateExercise(
            exerciseId,
            () => {
                // Actualiza la lista de ejercicios después de validar uno
                showToast('Ejercicio validado correctamente', 'success')
                viewExercises(page);
            },
            (err) => {
                setError(err.globalError || "Error al validar ejercicio");
            }
        );
    }

    const declineExercise = (exerciseId) => {
        backend.exerciseService.declineExercise(
            exerciseId,
            () => {
                // Actualiza la lista de ejercicios después de validar uno
                showToast('Ejercicio rechazado correctamente', 'declined')
                viewExercises(page);
            },
            (err) => {
                setError(err.globalError || "Error al validar ejercicio");
            }
        );
    }

    if (isLoading) {
        return <Spinner />;
    }

    if (exercises.length === 0 && !error) {
        return (
            <div className="flex flex-col h-[500px] justify-center items-center">
                <SVG_ICONS.AcceptIcon className="text-[#ff0000] w-16 h-16"/>
                <p className="text-center text-white text-[24px] font-semibold mb-2">Estás al día</p>
                <p>Cuando un Entrenador PRO cree un nuevo ejercicio aparecerá aquí</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col pt-10 pl-10">
            <div className="flex flex-col">
                {error && <p>{error}</p>}
                
                {exercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} onValidate={() => validateExercise(exercise.id)} onDecline={() => declineExercise(exercise.id)}/>
                ))}
                <p>{error}</p>
            </div>
            <div className="pb-5">
                <Pager back={{ enabled: page > 0, onClick: () => viewExercises(page - 1) }} next={{ enabled: existMoreItems, onClick: () => viewExercises(page + 1) }}/>
            </div>
        </div>
    )
}

export default ValidateExercises