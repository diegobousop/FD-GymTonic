import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ValidateExercises from '../../modules/app/pages/validate-exercises-page';

const mockShowToast = jest.fn();

jest.mock('../../modules/app/components/common/toast-provider', () => {
  const React = require('react');
  return {
    useToast: () => ({ showToast: mockShowToast }),
    ToastProvider: function ToastProvider(allProps) {
      return React.createElement('div', null, Object.values(allProps)[0]);
    },
  };
});

jest.mock('../../modules/app/components/common/spinner', () => () => (
  <div data-testid="spinner">Loading...</div>
));

jest.mock('../../modules/app/components/common/pager', () => {
  const React = require('react');
  return function MockPager(allProps) {
    const propsArray = Object.values(allProps);
    const backObj = propsArray[0] || {};
    const nextObj = propsArray[1] || {};
    return React.createElement('div', null,
      React.createElement('button', {
        onClick: backObj.onClick,
        disabled: !backObj.enabled
      }, 'Back'),
      React.createElement('button', {
        onClick: nextObj.onClick,
        disabled: !nextObj.enabled
      }, 'Next')
    );
  };
});

jest.mock('../../backend', () => {
  const exerciseService = {
    getUnvalidatedExercises: jest.fn(),
    validateExercise: jest.fn(),
    declineExercise: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      exerciseService,
    },
  };
});

const mockExerciseService = require('../../backend').default.exerciseService;

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ValidateExercises />
    </MemoryRouter>
  );

const sampleExercises = [
  {
    id: 1,
    name: 'Push Up',
    descripcion: 'Chest exercise',
    grupoMuscular: 'PECHO',
    ownerAvatar: { avatarBase64: 'data:image/png;base64,mock' },
    ownerName: 'trainer1',
  },
];

describe('ValidateExercises page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
  });

  it('muestra spinner mientras carga', () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation(() => {});

    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renderiza estado vacío cuando no hay ejercicios', async () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation((params, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Estás al día')).toBeInTheDocument();
    });
  });

  it('renderiza ejercicios y valida exitosamente', async () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation((params, onSuccess) => {
      onSuccess({ items: sampleExercises, existMoreItems: false });
    });
    mockExerciseService.validateExercise.mockImplementation((id, onSuccess) => onSuccess());

    renderComponent();

    await waitFor(() => expect(screen.getByText('Push Up')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Validate Exercise' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Ejercicio validado correctamente', 'success');
    });

    await waitFor(() => {
      expect(mockExerciseService.getUnvalidatedExercises).toHaveBeenCalledTimes(2);
    });
  });

  it('muestra error cuando falla la validación', async () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation((params, onSuccess) => {
      onSuccess({ items: sampleExercises, existMoreItems: false });
    });
    mockExerciseService.validateExercise.mockImplementation((id, onSuccess, onError) =>
      onError({ globalError: 'Validation failed' })
    );

    renderComponent();

    await waitFor(() => expect(screen.getByText('Push Up')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Validate Exercise' }));

    await waitFor(() => {
      expect(screen.getAllByText('Validation failed').length).toBeGreaterThan(0);
    });
  });

  it('rechaza ejercicio y muestra toast', async () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation((params, onSuccess) => {
      onSuccess({ items: sampleExercises, existMoreItems: false });
    });
    mockExerciseService.declineExercise.mockImplementation((id, onSuccess) => onSuccess());

    renderComponent();

    await waitFor(() => expect(screen.getByText('Push Up')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Block Exercise' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Ejercicio rechazado correctamente', 'declined');
    });
    await waitFor(() => {
      expect(mockExerciseService.getUnvalidatedExercises).toHaveBeenCalledTimes(2);
    });
  });

  it('muestra error cuando falla la obtención de ejercicios', async () => {
    mockExerciseService.getUnvalidatedExercises.mockImplementation((params, onSuccess, onError) => {
      onError('Fetch error');
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Fetch error')[0]).toBeInTheDocument();
    });
  });
});
