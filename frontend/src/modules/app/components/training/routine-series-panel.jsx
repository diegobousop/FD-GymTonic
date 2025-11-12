import React, { useEffect, useState, useRef } from 'react'
import ExerciseTracker from '../routine/exercise-tracker';
import Spinner from '../common/spinner';

const RoutineSeriesPanel = ({ routine, isLoading, onRoutineChange }) => {
  const [localRoutine, setLocalRoutine] = useState(routine);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalRoutine(routine);
  }, [routine]);

  const onUpdateSerie = (exerciseId, serieIndex, field, value) => {
    setLocalRoutine(prevRoutine => {
      const updatedRoutine = {
        ...prevRoutine,
        exercises: prevRoutine.exercises.map(ex =>
            ex.id === exerciseId
                ? {
                  ...ex,
                  series: ex.series.map((serie, idx) =>
                      idx === serieIndex
                          ? { ...serie, [field]: value }
                          : serie
                  )
                }
                : ex
        )
      };


      if (onRoutineChange) {
        onRoutineChange(updatedRoutine);
      }


      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('selectedRoutineDetails', JSON.stringify(updatedRoutine));
        console.log('Guardado en localStorage');
      }, 500);

      return updatedRoutine;
    });
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!localRoutine) {
    return <div className="p-10"></div>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
      <div className="p-10">
        {localRoutine.exercises.map((exercise, index) => (
            <ExerciseTracker
                key={exercise.id || index}
                exercise={exercise}
                onUpdateSerie={onUpdateSerie}
            />
        ))}
      </div>
  );
}

export default RoutineSeriesPanel;
