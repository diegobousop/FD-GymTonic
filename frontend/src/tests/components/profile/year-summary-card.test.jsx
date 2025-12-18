import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import YearSummaryCard from '../../../modules/app/components/profile/year-summary-card';

describe('YearSummaryCard', () => {
  const year = 2025;

  describe('Total Trainings Card', () => {
    const totalTrainingsCard = {
      type: 'totalTrainings',
      title: 'Resumen de Gymtonic de 2025',
      value: 150,
      subtitle: 'entrenamientos totales'
    };

    it('should render total trainings card with correct content', () => {
      render(<YearSummaryCard card={totalTrainingsCard} year={year} />);
      
      expect(screen.getByText('Resumen de Gymtonic de 2025')).toBeInTheDocument();
      expect(screen.getByText('El número de entrenamientos totales de todo el año')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('entrenamientos totales')).toBeInTheDocument();
      expect(screen.getByText('GYMTONIC')).toBeInTheDocument();
      expect(screen.getByText('@2025')).toBeInTheDocument();
    });

    it('should render calendar illustration', () => {
      render(<YearSummaryCard card={totalTrainingsCard} year={year} />);
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Most Used Exercise Card', () => {
    const mostUsedExerciseCard = {
      type: 'mostUsedExercise',
      title: 'Resumen de Gymtonic de 2025',
      value: 'Press Banca',
      subtitle: 'Lo hiciste 45 veces'
    };

    it('should render most used exercise card with correct content', () => {
      render(<YearSummaryCard card={mostUsedExerciseCard} year={year} />);
      
      expect(screen.getByText('Resumen de Gymtonic de 2025')).toBeInTheDocument();
      expect(screen.getByText('El ejercicio que más veces hiciste')).toBeInTheDocument();
      expect(screen.getByText('Press Banca')).toBeInTheDocument();
      expect(screen.getByText('Lo hiciste 45 veces')).toBeInTheDocument();
    });

    it('should render dumbbell illustration', () => {
      render(<YearSummaryCard card={mostUsedExerciseCard} year={year} />);
      
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Most Trained Muscle Group Card', () => {
    const mostTrainedMuscleGroupCard = {
      type: 'mostTrainedMuscleGroup',
      title: 'Resumen de Gymtonic de 2025',
      value: 'PECHO',
      subtitle: 'Lo entrenaste 80 veces'
    };

    it('should render most trained muscle group card with correct content', () => {
      render(<YearSummaryCard card={mostTrainedMuscleGroupCard} year={year} />);
      
      expect(screen.getByText('Resumen de Gymtonic de 2025')).toBeInTheDocument();
      expect(screen.getByText('El grupo muscular más entrenado')).toBeInTheDocument();
      expect(screen.getByText('Pecho')).toBeInTheDocument(); // Should be formatted
      expect(screen.getByText('Lo entrenaste 80 veces')).toBeInTheDocument();
    });

    it('should format muscle group names correctly', () => {
      const muscleGroups = [
        { value: 'PECHO', expected: 'Pecho' },
        { value: 'ESPALDA', expected: 'Espalda' },
        { value: 'PIERNA', expected: 'Pierna' },
        { value: 'HOMBRO', expected: 'Hombro' },
        { value: 'BRAZO', expected: 'Brazo' },
        { value: 'ABDOMEN', expected: 'Abdomen' },
        { value: 'FULLBODY', expected: 'Fullbody' }
      ];

      muscleGroups.forEach(({ value, expected }) => {
        const card = {
          type: 'mostTrainedMuscleGroup',
          title: 'Resumen de Gymtonic de 2025',
          value,
          subtitle: 'Lo entrenaste 10 veces'
        };
        
        const { unmount } = render(<YearSummaryCard card={card} year={year} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('should render muscle group illustration', () => {
      render(<YearSummaryCard card={mostTrainedMuscleGroupCard} year={year} />);
      
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Total Weight Card', () => {
    const totalWeightCard = {
      type: 'totalWeight',
      title: 'Resumen de Gymtonic de 2025',
      value: 550000,
      statuesOfLiberty: 2.44
    };

    it('should render total weight card with correct content', () => {
      render(<YearSummaryCard card={totalWeightCard} year={year} />);
      
      expect(screen.getByText('Resumen de Gymtonic de 2025')).toBeInTheDocument();
      expect(screen.getByText(/El peso total que has/i)).toBeInTheDocument();
      expect(screen.getByText(/levantado es/i)).toBeInTheDocument();
      expect(screen.getByText(/550k kg/i)).toBeInTheDocument();
      expect(screen.getByText(/Eso equivale a levantar 2.4/i)).toBeInTheDocument();
      expect(screen.getByText(/estatuas de la Libertad/i)).toBeInTheDocument();
    });

    it('should format weight correctly in thousands', () => {
      const card = {
        type: 'totalWeight',
        title: 'Resumen de Gymtonic de 2025',
        value: 153000,
        statuesOfLiberty: 0.68
      };
      
      render(<YearSummaryCard card={card} year={year} />);
      expect(screen.getByText(/153k kg/i)).toBeInTheDocument();
    });

    it('should format weight correctly in millions', () => {
      const card = {
        type: 'totalWeight',
        title: 'Resumen de Gymtonic de 2025',
        value: 2500000,
        statuesOfLiberty: 11.11
      };
      
      render(<YearSummaryCard card={card} year={year} />);
      expect(screen.getByText(/2.5M kg/i)).toBeInTheDocument();
    });

    it('should render Statue of Liberty illustration', () => {
      render(<YearSummaryCard card={totalWeightCard} year={year} />);
      
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Longest Streak Card', () => {
    const longestStreakCard = {
      type: 'longestStreak',
      title: 'Resumen de Gymtonic de 2025',
      value: 15,
      subtitle: 'días consecutivos'
    };

    it('should render longest streak card with correct content', () => {
      render(<YearSummaryCard card={longestStreakCard} year={year} />);
      
      expect(screen.getByText('Resumen de Gymtonic de 2025')).toBeInTheDocument();
      expect(screen.getByText('La mayor racha diaria conseguida')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('días consecutivos')).toBeInTheDocument();
    });

    it('should render fire streak illustration', () => {
      render(<YearSummaryCard card={longestStreakCard} year={year} />);
      
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should return null if card is not provided', () => {
      // Suppress prop-types warning for this test case
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<YearSummaryCard card={null} year={year} />);
      // Component returns null early, so container should be empty or minimal
      expect(container.firstChild).toBeNull();
      consoleError.mockRestore();
    });

    it('should handle N/A values for most used exercise', () => {
      const card = {
        type: 'mostUsedExercise',
        title: 'Resumen de Gymtonic de 2025',
        value: 'N/A',
        subtitle: 'No hay datos'
      };
      
      render(<YearSummaryCard card={card} year={year} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByText('No hay datos')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const card = {
        type: 'totalTrainings',
        title: 'Resumen de Gymtonic de 2025',
        value: 0,
        subtitle: 'entrenamientos totales'
      };
      
      render(<YearSummaryCard card={card} year={year} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    const testCard = {
      type: 'totalTrainings',
      title: 'Resumen de Gymtonic de 2025',
      value: 100,
      subtitle: 'entrenamientos totales'
    };

    it('should have correct CSS classes for styling', () => {
      const { container } = render(<YearSummaryCard card={testCard} year={year} />);
      const cardElement = container.querySelector('.bg-\\[\\#1a1f3a\\]');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveClass('rounded-xl', 'p-8');
    });

    it('should display footer with branding', () => {
      render(<YearSummaryCard card={testCard} year={year} />);
      expect(screen.getByText('GYMTONIC')).toBeInTheDocument();
      expect(screen.getByText(`@${year}`)).toBeInTheDocument();
    });
  });
});

