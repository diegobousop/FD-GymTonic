import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutineSeriesPanel from '../../../modules/app/components/training/routine-series-panel';

jest.mock('../../../modules/app/components/routine/exercise-tracker', () => {
  return function MockExerciseTracker({ exercise, onUpdateSerie }) {
    return (
      <div data-testid={`exercise-tracker-${exercise.id}`}>
        <div>{exercise.name}</div>
        <button onClick={() => onUpdateSerie(exercise.id, 0, 'repeticiones', 15)}>
          Update Serie
        </button>
      </div>
    );
  };
});

jest.mock('../../../modules/app/components/common/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('RoutineSeriesPanel', () => {
  const mockRoutine = {
    id: 1,
    name: 'Test Routine',
    exercises: [
      {
        id: 1,
        name: 'Bench Press',
        series: [
          { repeticiones: 10, peso: 50 },
          { repeticiones: 8, peso: 60 }
        ]
      },
      {
        id: 2,
        name: 'Squat',
        series: [
          { repeticiones: 12, peso: 80 }
        ]
      }
    ]
  };

  let localStorageSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    localStorageSpy.mockRestore();
  });

  it('renderiza ejercicios de la rutina', () => {
    render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    expect(screen.getByTestId('exercise-tracker-1')).toBeInTheDocument();
    expect(screen.getByTestId('exercise-tracker-2')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('muestra spinner cuando isLoading es true', () => {
    render(<RoutineSeriesPanel routine={mockRoutine} isLoading={true} />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('exercise-tracker-1')).not.toBeInTheDocument();
  });

  it('muestra div vacío cuando routine es null', () => {
    const { container } = render(<RoutineSeriesPanel routine={null} />);
    
    const emptyDiv = container.querySelector('.p-10');
    expect(emptyDiv).toBeInTheDocument();
    expect(emptyDiv.children.length).toBe(0);
  });

  it('actualiza rutina local cuando cambia prop routine', () => {
    const { rerender } = render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    expect(screen.getByText('Bench Press')).toBeInTheDocument();

    const updatedRoutine = {
      ...mockRoutine,
      exercises: [{ id: 3, name: 'Deadlift', series: [] }]
    };

    rerender(<RoutineSeriesPanel routine={updatedRoutine} />);
    
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
  });

  it('llama onUpdateSerie y actualiza estado', () => {
    const onRoutineChange = jest.fn();
    
    render(
      <RoutineSeriesPanel
        routine={mockRoutine}
        onRoutineChange={onRoutineChange}
      />
    );
    
    const updateButton = screen.getAllByText('Update Serie')[0];
    
    act(() => {
      updateButton.click();
    });

    expect(onRoutineChange).toHaveBeenCalled();
    const updatedRoutine = onRoutineChange.mock.calls[0][0];
    expect(updatedRoutine.exercises[0].series[0].repeticiones).toBe(15);
  });

  it('guarda en localStorage después del timeout', () => {
    render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    const updateButton = screen.getAllByText('Update Serie')[0];
    
    act(() => {
      updateButton.click();
    });

    expect(localStorageSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(localStorageSpy).toHaveBeenCalledWith(
      'selectedRoutineDetails',
      expect.any(String)
    );
  });

  it('limpia timeout en múltiples actualizaciones', () => {
    render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    const updateButton = screen.getAllByText('Update Serie')[0];
    
    act(() => {
      updateButton.click();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      updateButton.click();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Debe guardar solo una vez después del timeout final
    expect(localStorageSpy).toHaveBeenCalledTimes(1);
  });

  it('limpia timeout al desmontar', () => {
    const { unmount } = render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    const updateButton = screen.getAllByText('Update Serie')[0];
    
    act(() => {
      updateButton.click();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(localStorageSpy).not.toHaveBeenCalled();
  });

  it('actualiza ejercicio correcto en la rutina', () => {
    const onRoutineChange = jest.fn();
    
    render(
      <RoutineSeriesPanel
        routine={mockRoutine}
        onRoutineChange={onRoutineChange}
      />
    );
    
    // Hacer clic en actualizar en el segundo ejercicio
    const updateButtons = screen.getAllByText('Update Serie');
    
    act(() => {
      updateButtons[1].click();
    });

    const updatedRoutine = onRoutineChange.mock.calls[0][0];
    
    // El primer ejercicio debe permanecer sin cambios
    expect(updatedRoutine.exercises[0].series[0].repeticiones).toBe(10);
    // El segundo ejercicio debe actualizarse
    expect(updatedRoutine.exercises[1].series[0].repeticiones).toBe(15);
  });

  it('renderiza ejercicios con keys', () => {
    const { container } = render(<RoutineSeriesPanel routine={mockRoutine} />);
    
    const exerciseTrackers = container.querySelectorAll('[data-testid^="exercise-tracker-"]');
    expect(exerciseTrackers.length).toBe(2);
  });

  it('maneja rutina sin ejercicios', () => {
    const emptyRoutine = { ...mockRoutine, exercises: [] };
    
    const { container } = render(<RoutineSeriesPanel routine={emptyRoutine} />);
    
    const exerciseTrackers = container.querySelectorAll('[data-testid^="exercise-tracker-"]');
    expect(exerciseTrackers.length).toBe(0);
  });
});

