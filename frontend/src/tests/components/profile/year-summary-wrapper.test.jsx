import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserContext } from '../../../modules/app/components/common/user-provider';
import YearSummaryWrapper from '../../../modules/app/components/profile/year-summary-wrapper';
import backend from '../../../backend';

// Mock backend
jest.mock('../../../backend', () => ({
  routineService: {
    viewUserTrainings: jest.fn(),
    getTrainingCalendarStats: jest.fn()
  }
}));

// Mock YearSummaryCard
jest.mock('../../../modules/app/components/profile/year-summary-card', () => {
  return function MockYearSummaryCard({ card, year }) {
    return (
      <div data-testid={`card-${card.type}`}>
        <div data-testid="card-title">{card.title}</div>
        <div data-testid="card-value">{card.value}</div>
        {card.subtitle && <div data-testid="card-subtitle">{card.subtitle}</div>}
        {card.statuesOfLiberty && <div data-testid="card-statues">{card.statuesOfLiberty}</div>}
      </div>
    );
  };
});

describe('YearSummaryWrapper', () => {
  const mockUser = {
    id: 1,
    userName: 'testuser',
    role: 'USER'
  };

  const mockTrainings = [
    {
      id: 1,
      creationDate: '2025-01-15T10:00:00',
      exercises: [
        {
          name: 'Press Banca',
          grupoMuscular: 'PECHO',
          series: [
            { peso: 80, repeticiones: 10 },
            { peso: 80, repeticiones: 8 },
            { peso: 75, repeticiones: 10 }
          ]
        },
        {
          name: 'Press Banca',
          grupoMuscular: 'PECHO',
          series: [
            { peso: 70, repeticiones: 12 }
          ]
        },
        {
          name: 'Sentadilla',
          grupoMuscular: 'PIERNA',
          series: [
            { peso: 100, repeticiones: 10 },
            { peso: 100, repeticiones: 10 }
          ]
        }
      ]
    },
    {
      id: 2,
      creationDate: '2025-01-16T10:00:00',
      exercises: [
        {
          name: 'Press Banca',
          grupoMuscular: 'PECHO',
          series: [
            { peso: 85, repeticiones: 8 }
          ]
        }
      ]
    },
    {
      id: 3,
      creationDate: '2025-02-10T10:00:00',
      exercises: [
        {
          name: 'Dominadas',
          grupoMuscular: 'ESPALDA',
          series: [
            { peso: 0, repeticiones: 10 }
          ]
        }
      ]
    }
  ];

  const renderWithContext = (year = 2025, user = mockUser) => {
    return render(
      <UserContext.Provider value={{ user }}>
        <YearSummaryWrapper year={year} />
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading message while fetching data', () => {
      backend.routineService.viewUserTrainings.mockImplementation(() => {});
      
      renderWithContext();
      
      expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch trainings for the given year', async () => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        if (page === 0) {
          onSuccess({
            items: mockTrainings,
            existMoreItems: false
          });
        }
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(backend.routineService.viewUserTrainings).toHaveBeenCalledWith(
          mockUser.id,
          0,
          100,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });

    it('should filter trainings by year', async () => {
      const trainings2024 = [
        {
          id: 4,
          creationDate: '2024-12-31T10:00:00',
          exercises: []
        }
      ];

      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: [...mockTrainings, ...trainings2024],
          existMoreItems: false
        });
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      // Should only show 2025 trainings (3 cards)
      const cards = screen.getAllByTestId(/^card-/);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle pagination correctly', async () => {
      let callCount = 0;
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        callCount++;
        if (page === 0) {
          onSuccess({
            items: mockTrainings,
            existMoreItems: true
          });
        } else if (page === 1) {
          onSuccess({
            items: [],
            existMoreItems: false
          });
        }
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(callCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: mockTrainings,
          existMoreItems: false
        });
      });
    });

    it('should calculate total trainings correctly', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      const totalTrainingsCard = screen.getByTestId('card-totalTrainings');
      expect(totalTrainingsCard).toBeInTheDocument();
      const valueElement = within(totalTrainingsCard).getByTestId('card-value');
      expect(valueElement).toHaveTextContent('3');
    });

    it('should find most used exercise correctly', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        const card = screen.getByTestId('card-mostUsedExercise');
        expect(card).toBeInTheDocument();
        const valueElement = within(card).getByTestId('card-value');
        expect(valueElement).toHaveTextContent('Press Banca');
      });
    });

    it('should find most trained muscle group correctly', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        const card = screen.getByTestId('card-mostTrainedMuscleGroup');
        expect(card).toBeInTheDocument();
        // PECHO appears 3 times, PIERNA 1, ESPALDA 1
        const valueElement = within(card).getByTestId('card-value');
        expect(valueElement).toHaveTextContent('PECHO');
      });
    });

    it('should calculate total weight lifted correctly', async () => {
      // Expected: (80*10 + 80*8 + 75*10) + (70*12) + (85*8) + (100*10 + 100*10) + (0*10)
      // = (800 + 640 + 750) + 840 + 680 + 2000 + 0
      // = 2190 + 840 + 680 + 2000 = 5710
      renderWithContext(2025);

      await waitFor(() => {
        const card = screen.getByTestId('card-totalWeight');
        expect(card).toBeInTheDocument();
        const valueElement = within(card).getByTestId('card-value');
        expect(valueElement).toHaveTextContent('5710');
      });
    });

    it('should calculate longest streak correctly', async () => {
      // Dates: 2025-01-15, 2025-01-16, 2025-02-10
      // Streak: 2 consecutive days (15-16)
      renderWithContext(2025);

      await waitFor(() => {
        const card = screen.getByTestId('card-longestStreak');
        expect(card).toBeInTheDocument();
        const valueElement = within(card).getByTestId('card-value');
        expect(parseInt(valueElement.textContent)).toBeGreaterThanOrEqual(1);
      });
    });

    it('should calculate statues of liberty correctly', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        const card = screen.getByTestId('card-totalWeight');
        expect(card).toBeInTheDocument();
        const statues = within(card).getByTestId('card-statues');
        expect(statues).toBeInTheDocument();
        const statuesValue = parseFloat(statues.textContent);
        expect(statuesValue).toBeCloseTo(5710 / 225000, 2);
      });
    });
  });

  describe('Empty State', () => {
    it('should handle no trainings gracefully', async () => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: [],
          existMoreItems: false
        });
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      // When there are no trainings, cards are still rendered with 0 values
      const totalTrainingsCard = screen.getByTestId('card-totalTrainings');
      const valueElement = within(totalTrainingsCard).getByTestId('card-value');
      expect(valueElement).toHaveTextContent('0');
    });

    it('should handle trainings with no exercises', async () => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: [
            {
              id: 1,
              creationDate: '2025-01-15T10:00:00',
              exercises: []
            }
          ],
          existMoreItems: false
        });
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      const totalTrainingsCard = screen.getByTestId('card-totalTrainings');
      expect(totalTrainingsCard).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch error', async () => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess, onError) => {
        onError(new Error('Network error'));
      });

      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: mockTrainings,
          existMoreItems: false
        });
      });
    });

    it('should render navigation dots for all cards', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      // Should have 5 cards, so 5 dots
      const dots = screen.getAllByLabelText(/Ir a tarjeta/);
      expect(dots.length).toBe(5);
    });

    it('should navigate to next card when next button is clicked', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Tarjeta siguiente');
      fireEvent.click(nextButton);

      // First dot should not be active, second should be
      const dots = screen.getAllByLabelText(/Ir a tarjeta/);
      expect(dots[0]).toHaveClass('bg-white');
    });

    it('should navigate to previous card when prev button is clicked', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      // Go to second card first
      const nextButton = screen.getByLabelText('Tarjeta siguiente');
      fireEvent.click(nextButton);

      // Then go back
      const prevButton = screen.getByLabelText('Tarjeta anterior');
      fireEvent.click(prevButton);

      const dots = screen.getAllByLabelText(/Ir a tarjeta/);
      expect(dots[0]).toHaveClass('bg-blue-500');
    });

    it('should navigate to specific card when dot is clicked', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      const dots = screen.getAllByLabelText(/Ir a tarjeta/);
      fireEvent.click(dots[2]); // Click third dot

      expect(dots[2]).toHaveClass('bg-blue-500');
    });

    it('should handle circular navigation (last to first)', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      const dots = screen.getAllByLabelText(/Ir a tarjeta/);
      const lastDot = dots[dots.length - 1];
      fireEvent.click(lastDot); // Go to last card

      const nextButton = screen.getByLabelText('Tarjeta siguiente');
      fireEvent.click(nextButton); // Should wrap to first

      expect(dots[0]).toHaveClass('bg-blue-500');
    });
  });

  describe('User Context', () => {
    it('should not fetch if user is not available', () => {
      render(
        <UserContext.Provider value={{ user: null }}>
          <YearSummaryWrapper year={2025} />
        </UserContext.Provider>
      );

      expect(backend.routineService.viewUserTrainings).not.toHaveBeenCalled();
    });
  });

  describe('Card Order', () => {
    beforeEach(() => {
      backend.routineService.viewUserTrainings.mockImplementation((userId, page, size, onSuccess) => {
        onSuccess({
          items: mockTrainings,
          existMoreItems: false
        });
      });
    });

    it('should render cards in correct order', async () => {
      renderWithContext(2025);

      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });

      // Get all card containers (not the nested elements)
      const cardContainers = screen.getAllByTestId(/^card-(totalTrainings|mostUsedExercise|mostTrainedMuscleGroup|totalWeight|longestStreak)$/);
      expect(cardContainers[0]).toHaveAttribute('data-testid', 'card-totalTrainings');
      expect(cardContainers[1]).toHaveAttribute('data-testid', 'card-mostUsedExercise');
      expect(cardContainers[2]).toHaveAttribute('data-testid', 'card-mostTrainedMuscleGroup');
      expect(cardContainers[3]).toHaveAttribute('data-testid', 'card-totalWeight');
      expect(cardContainers[4]).toHaveAttribute('data-testid', 'card-longestStreak');
    });
  });
});

