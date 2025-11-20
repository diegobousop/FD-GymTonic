import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExerciseTracker from '../../../modules/app/components/routine/exercise-tracker';

describe('ExerciseTracker', () => {
  const mockExercise = {
    id: 1,
    name: 'Bench Press',
    numeroSeries: 3,
    descripcion: 'Chest exercise',
    exerciseImageBase64: 'data:image/png;base64,test',
    series: [
      { repeticiones: 10, peso: 50 },
      { repeticiones: 8, peso: 60 },
      { repeticiones: 6, peso: 70 }
    ]
  };

  const mockOnUpdateSerie = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza información del ejercicio', () => {
    render(<ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />);
    
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Chest exercise')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('renderiza todas las series', () => {
    render(<ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />);
    
    const seriesNumbers = screen.getAllByText(/^[1-3]$/);
    expect(seriesNumbers.length).toBeGreaterThanOrEqual(3);
  });

  it('renderiza imagen del ejercicio', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const image = container.querySelector('img[alt="Bench Press"]');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  it('llama onUpdateSerie cuando se incrementan repeticiones', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const addButtons = container.querySelectorAll('button');
    const firstAddButton = addButtons[0];
    fireEvent.click(firstAddButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(1, 0, 'repeticiones', 11);
  });

  it('llama onUpdateSerie cuando se decrementan repeticiones', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const buttons = container.querySelectorAll('button');
    const firstMinusButton = buttons[1];
    fireEvent.click(firstMinusButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(1, 0, 'repeticiones', 9);
  });

  it('llama onUpdateSerie cuando se incrementa peso', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const buttons = container.querySelectorAll('button');
    const firstPesoAddButton = buttons[2];
    fireEvent.click(firstPesoAddButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(1, 0, 'peso', 51);
  });

  it('llama onUpdateSerie cuando se decrementa peso', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const buttons = container.querySelectorAll('button');
    const firstPesoMinusButton = buttons[3];
    fireEvent.click(firstPesoMinusButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(1, 0, 'peso', 49);
  });

  it('llama onUpdateSerie cuando se escribe en input de repeticiones', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const inputs = container.querySelectorAll('input[type="number"]');
    const repInput = inputs[0];
    
    fireEvent.change(repInput, { target: { value: '15' } });
    
    expect(mockOnUpdateSerie).toHaveBeenCalled();
  });

  it('llama onUpdateSerie cuando se escribe en input de peso', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const inputs = container.querySelectorAll('input[type="number"]');
    const pesoInput = inputs[1];
    
    fireEvent.change(pesoInput, { target: { value: '75.5' } });
    
    expect(mockOnUpdateSerie).toHaveBeenCalled();
  });

  it('no permite repeticiones negativas', () => {
    const exerciseWithZeroReps = {
      ...mockExercise,
      series: [{ repeticiones: 0, peso: 50 }]
    };
    
    const { container } = render(
      <ExerciseTracker exercise={exerciseWithZeroReps} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const buttons = container.querySelectorAll('button');
    const minusButton = buttons[1];
    fireEvent.click(minusButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(exerciseWithZeroReps.id, 0, 'repeticiones', 0);
  });

  it('no permite peso negativo', () => {
    const exerciseWithZeroPeso = {
      ...mockExercise,
      series: [{ repeticiones: 10, peso: 0 }]
    };
    
    const { container } = render(
      <ExerciseTracker exercise={exerciseWithZeroPeso} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const buttons = container.querySelectorAll('button');
    const pesoMinusButton = buttons[3];
    fireEvent.click(pesoMinusButton);
    
    expect(mockOnUpdateSerie).toHaveBeenCalledWith(exerciseWithZeroPeso.id, 0, 'peso', 0);
  });

  it('renderiza componentes WeightDisplay', () => {
    const { container } = render(
      <ExerciseTracker exercise={mockExercise} onUpdateSerie={mockOnUpdateSerie} />
    );
    
    const weightDisplays = container.querySelectorAll('.w-\\[20\\%\\]');
    expect(weightDisplays.length).toBeGreaterThan(0);
  });

  it('maneja ejercicio sin nombre', () => {
    const exerciseWithoutName = { ...mockExercise, name: null };
    const { container } = render(<ExerciseTracker exercise={exerciseWithoutName} onUpdateSerie={mockOnUpdateSerie} />);
    
    // The component shows "Ejercicio X" where X is key + 1
    const exerciseText = container.querySelector('.text-lg.font-semibold.text-white');
    expect(exerciseText).toBeInTheDocument();
  });
});

