import React, {useEffect, useState} from 'react'
import backend from "../../../backend";

import ExerciseCard from '../components/exercise/exercise-card'

const ValidateExercises = () => {
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [page, setPage] = useState(0);
    const size = 8;

    const [exercises, setExercises] = useState([]);
    
    const viewExercises = (pageNumber) => {
        setLoading(true);
        backend.exerciseService.getAllExercises(
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
                viewExercises(page);
            },
            (err) => {
                setError(err.globalError || "Error al validar ejercicio");
            }
        );
    }

    const declineExercise = (exerciseId) => {
    }

  return (
    <div className="mt-5 ml-10">
        {isLoading && <p>Cargando ejercicios...</p>}
        {error && <p>{error}</p>}
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} onValidate={() => validateExercise(exercise.id)} onDecline={() => declineExercise(exercise.id)}/>
        ))}
        <p>{error}</p>
    </div>
  )
}

export default ValidateExercises