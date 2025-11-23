import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditSeriesModal from '../../../modules/app/components/routine/edit-series-routine';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  exerciseService: {
    getSerieByExercise: jest.fn(),
    createSerie: jest.fn(),
    deleteSerie: jest.fn(),
    modifySerie: jest.fn(),
    editRestTime: jest.fn()
  }
}));

describe('EditSeriesModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  const mockSeries = [
    { id: 1, numeroSerie: 1, repeticiones: 10, peso: 50 },
    { id: 2, numeroSerie: 2, repeticiones: 8, peso: 60 },
    { id: 3, numeroSerie: 3, repeticiones: 6, peso: 70 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    backend.exerciseService.getSerieByExercise.mockImplementation((exerciseId, routineId, onSuccess) => {
      onSuccess({ items: mockSeries });
    });
  });

  it('renderiza modal con título', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Editar series del ejercicio')).toBeInTheDocument();
    });
  });

  it('carga y muestra series desde backend', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(backend.exerciseService.getSerieByExercise).toHaveBeenCalledWith(
        1,
        1,
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      const repInputs = screen.getAllByLabelText(/Repeticiones serie/);
      expect(repInputs.length).toBe(3);
    });
  });

  it('muestra input de tiempo de descanso con valor inicial', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const restTimeInput = screen.getByLabelText('Tiempo de descanso');
      expect(restTimeInput).toHaveValue(60);
    });
  });

  it('actualiza repeticiones cuando cambia el input', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const repInputs = screen.getAllByLabelText(/Repeticiones serie/);
      fireEvent.change(repInputs[0], { target: { value: '15' } });
    });

    await waitFor(() => {
      const repInputs = screen.getAllByLabelText(/Repeticiones serie/);
      expect(repInputs[0]).toHaveValue(15);
    });
  });

  it('actualiza peso cuando cambia el input', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const pesoInputs = screen.getAllByLabelText(/Peso serie/);
      fireEvent.change(pesoInputs[0], { target: { value: '75' } });
    });

    await waitFor(() => {
      const pesoInputs = screen.getAllByLabelText(/Peso serie/);
      expect(pesoInputs[0]).toHaveValue(75);
    });
  });

  it('actualiza tiempo de descanso cuando cambia el input', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const restTimeInput = screen.getByLabelText('Tiempo de descanso');
      fireEvent.change(restTimeInput, { target: { value: '90' } });
    });

    await waitFor(() => {
      const restTimeInput = screen.getByLabelText('Tiempo de descanso');
      expect(restTimeInput).toHaveValue(90);
    });
  });

  it('llama createSerie cuando se hace clic en botón añadir', async () => {
    backend.exerciseService.createSerie.mockImplementation((exerciseId, routineId, onSuccess) => {
      onSuccess({ id: 4, numeroSerie: 4, repeticiones: 0, peso: 0 });
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const addButton = screen.getByText('➕ Añadir serie');
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(backend.exerciseService.createSerie).toHaveBeenCalledWith(
        1,
        1,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('llama deleteSerie cuando se hace clic en botón eliminar', async () => {
    backend.exerciseService.deleteSerie.mockImplementation((id, onSuccess) => {
      onSuccess();
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Eliminar serie');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByTitle('Eliminar serie');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(backend.exerciseService.deleteSerie).toHaveBeenCalled();
    });
  });

  it('llama modifySerie y editRestTime cuando se hace clic en confirmar', async () => {
    backend.exerciseService.modifySerie.mockImplementation((id, reps, peso, onSuccess) => {
      onSuccess();
    });
    backend.exerciseService.editRestTime.mockImplementation((exerciseId, routineId, restTime, onSuccess) => {
      onSuccess();
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const confirmButton = screen.getByText('Continuar');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(backend.exerciseService.modifySerie).toHaveBeenCalled();
      expect(backend.exerciseService.editRestTime).toHaveBeenCalledWith(
        1,
        1,
        60,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('llama onUpdate y onClose después de guardar exitosamente', async () => {
    backend.exerciseService.modifySerie.mockImplementation((id, reps, peso, onSuccess) => {
      onSuccess();
    });
    backend.exerciseService.editRestTime.mockImplementation((exerciseId, routineId, restTime, onSuccess) => {
      onSuccess();
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const confirmButton = screen.getByText('Continuar');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('muestra mensaje de error cuando falla la carga de series', async () => {
    backend.exerciseService.getSerieByExercise.mockImplementation((exerciseId, routineId, onSuccess, onError) => {
      onError('Error loading');
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las series')).toBeInTheDocument();
    });
  });

  it('muestra mensaje cuando no hay series disponibles', async () => {
    backend.exerciseService.getSerieByExercise.mockImplementation((exerciseId, routineId, onSuccess) => {
      onSuccess({ items: [] });
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sin series registradas')).toBeInTheDocument();
    });
  });

  it('muestra estado de guardado cuando se hace clic en botón confirmar', async () => {
    backend.exerciseService.modifySerie.mockImplementation((id, reps, peso, onSuccess) => {
      setTimeout(() => onSuccess(), 100);
    });
    backend.exerciseService.editRestTime.mockImplementation((exerciseId, routineId, restTime, onSuccess) => {
      setTimeout(() => onSuccess(), 100);
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const confirmButton = screen.getByText('Continuar');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });
  });

  it('deshabilita botón confirmar mientras guarda', async () => {
    backend.exerciseService.modifySerie.mockImplementation((id, reps, peso, onSuccess) => {
      setTimeout(() => onSuccess(), 100);
    });
    backend.exerciseService.editRestTime.mockImplementation((exerciseId, routineId, restTime, onSuccess) => {
      setTimeout(() => onSuccess(), 100);
    });

    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      const confirmButton = screen.getByText('Continuar');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      const savingButton = screen.getByText('Guardando...');
      expect(savingButton).toBeDisabled();
    });
  });

  it('renderiza encabezados de columna', async () => {
    render(
      <EditSeriesModal
        restTime={60}
        exerciseId={1}
        routineId={1}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Serie')).toBeInTheDocument();
      expect(screen.getByText('Reps')).toBeInTheDocument();
      expect(screen.getByText('Peso (kg)')).toBeInTheDocument();
    });
  });
});

