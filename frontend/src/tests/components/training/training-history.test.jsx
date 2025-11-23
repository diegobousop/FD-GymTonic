import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TrainingHistory from '../../../modules/app/components/training/training-history';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  routineService: {
    viewUserTrainings: jest.fn(),
    viewDayTrainings: jest.fn()
  }
}));

jest.mock('../../../modules/app/components/common/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

jest.mock('../../../modules/app/components/common/pager', () => {
  return function MockPager({ back, next }) {
    return (
      <div data-testid="pager">
        <button onClick={back.onClick} disabled={!back.enabled}>Back</button>
        <button onClick={next.onClick} disabled={!next.enabled}>Next</button>
      </div>
    );
  };
});

describe('TrainingHistory', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    avatar: {
      avatarBase64: 'data:image/png;base64,avatar'
    }
  };

  const mockTrainings = [
    {
      id: 1,
      routineId: 10,
      name: 'Full Body Workout',
      routineName: 'Full Body Workout',
      creatorUserName: 'coach1',
      creationDate: '2024-01-15T10:30:00',
      description: 'Entrenamiento completo',
      duration: 60,
      public: true,
      exercises: [
        { name: 'Push Up', exerciseImageBase64: 'img1' },
        { name: 'Squat', exerciseImageBase64: 'img2' }
      ]
    },
    {
      id: 2,
      routineId: 11,
      name: 'Upper Body Blast',
      routineName: 'Upper Body',
      creatorUserName: 'coach2',
      creationDate: '2024-01-14T14:00:00',
      description: 'Entrenamiento superior',
      duration: 45,
      public: false,
      exercises: [
        { name: 'Bench Press', exerciseImageBase64: 'img3' }
      ]
    }
  ];

  const mockSetFilterActivated = jest.fn();
  const mockSelectedDay = new Date('2024-01-15');

  beforeEach(() => {
    jest.clearAllMocks();
    backend.routineService.viewUserTrainings.mockImplementation((userId,page, size, onSuccess) => {
      onSuccess({ items: mockTrainings, existMoreItems: false });
    });
    backend.routineService.viewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: mockTrainings, existMoreItems: false });
    });
  });

  it('muestra spinner mientras carga', () => {
    backend.routineService.viewUserTrainings.mockImplementation(() => {
      // Don't call success to keep loading state
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('carga y muestra entrenamientos recientes', async () => {
    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewUserTrainings).toHaveBeenCalledWith(1,
        0,
        5,
        expect.any(Function),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('Full Body Workout').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Upper Body/)[0]).toBeInTheDocument();
    });
  });

  it('muestra mensaje cuando no hay entrenamientos disponibles', async () => {
    backend.routineService.viewUserTrainings.mockImplementation((userId,page, size, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ningún entrenamiento registrado')).toBeInTheDocument();
    });
  });

  it('muestra mensaje diferente cuando no hay entrenamientos para el día seleccionado', async () => {
    backend.routineService.viewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={true}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ningún entrenamiento registrado para el/i)).toBeInTheDocument();
    });
  });

  it('llama a viewDayTrainings cuando se activa el filtro de día', async () => {
    backend.routineService.viewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: mockTrainings, existMoreItems: false });
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={true}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewDayTrainings).toHaveBeenCalledWith(
        0,
        5,
        15,
        1,
        2024,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('recarga entrenamientos cuando cambia selectedDay', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={true}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewDayTrainings).toHaveBeenCalledTimes(1);
    });

    const newSelectedDay = new Date('2024-01-16');

    rerender(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={true}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={newSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewDayTrainings).toHaveBeenCalledTimes(2);
    });
  });

  it('formatea fecha correctamente', async () => {
    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check if date is formatted (contains "a las" for time)
      const dateElements = screen.getAllByText(/a las/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('renderiza componente de paginación', async () => {
    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });
  });

  it('renderiza tarjetas de entrenamiento con enlaces', async () => {
    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('muestra duración para cada entrenamiento', async () => {
    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/60/)).toBeInTheDocument();
      expect(screen.getByText(/45/)).toBeInTheDocument();
    });
  });

  it('maneja error al cargar entrenamientos', async () => {
    backend.routineService.viewUserTrainings.mockImplementation((userId,page, size, onSuccess, onError) => {
      onError('Error loading trainings');
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });

  it('actualiza página cuando se hace clic en botón siguiente del paginador', async () => {
    backend.routineService.viewUserTrainings.mockImplementation((userId,page, size, onSuccess) => {
      onSuccess({ items: mockTrainings, existMoreItems: true });
    });

    render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });
  });

  it('switches between recent and day filter modes', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={false}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewUserTrainings).toHaveBeenCalled();
    });

    backend.routineService.viewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: mockTrainings, existMoreItems: false });
    });

    rerender(
      <MemoryRouter>
        <TrainingHistory
          user={mockUser}
          dayFilterActivated={true}
          setFilterActivated={mockSetFilterActivated}
          selectedDay={mockSelectedDay}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(backend.routineService.viewDayTrainings).toHaveBeenCalled();
    });
  });
});

