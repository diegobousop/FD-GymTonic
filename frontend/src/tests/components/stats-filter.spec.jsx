import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsFilter from '../../../src/modules/app/components/profile/stats-filter';

describe('StatsFilter', () => {
  test('renders and toggles reps selection', () => {
    const setSelectedReps = jest.fn();
    render(
      <StatsFilter selectedReps={8} setSelectedReps={setSelectedReps} selectedTime={'YEAR'} setSelectedTime={jest.fn()} />
    );

    // Labels
    expect(screen.getByText('Repeticiones')).toBeInTheDocument();
    expect(screen.getByText('Tiempo')).toBeInTheDocument();

    // Click reps 10
    fireEvent.click(screen.getByText('10'));
    expect(setSelectedReps).toHaveBeenCalledWith(10);

    // Clear selection button appears when selectedReps != 0
    const clearBtn = screen.getByTitle('Limpiar selección');
    fireEvent.click(clearBtn);
    expect(setSelectedReps).toHaveBeenCalledWith(0);
  });

  test('opens time dropdown and selects option', () => {
    const setSelectedTime = jest.fn();
    render(
      <StatsFilter selectedReps={1} setSelectedReps={jest.fn()} selectedTime={'MONTH'} setSelectedTime={setSelectedTime} />
    );

    // Open dropdown
    const toggleBtn = screen.getAllByRole('button', { name: /último mes/i })[0];
    fireEvent.click(toggleBtn);

    // Select week
    const weekBtn = screen.getByRole('button', { name: /última semana/i });
    fireEvent.click(weekBtn);

    expect(setSelectedTime).toHaveBeenCalledWith('WEEK');
  });
});