import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExerciseUserGraphs from '../../../src/modules/app/components/profile/exercise-user-graphs';

// Mock recharts to simple passthrough components
jest.mock('recharts', () => {
  const React = require('react');
  const Passthrough = ({ children }) => <div>{children}</div>;
  const Line = (props) => <div data-testid={`line-${props.dataKey}`}></div>;
  const Pie = (props) => <div>{props.children}</div>;
  const Cell = () => <div/>;
  return {
    ResponsiveContainer: Passthrough,
    LineChart: Passthrough,
    PieChart: Passthrough,
    Line,
    XAxis: Passthrough,
    YAxis: Passthrough,
    CartesianGrid: Passthrough,
    Tooltip: Passthrough,
    Legend: Passthrough,
    LabelList: Passthrough,
    Brush: Passthrough,
    Pie,
    Cell,
  };
});

const sampleStats = [{
  periodExerciseStats: [
    {
      exerciseStats: [
        {
          date: '2025-01-01',
          exerciseWeightsKg: { 'Sentadilla': 100, 'Press banca': 80 },
          isPR: { 'Sentadilla': true }
        },
        {
          date: '2025-01-02',
          exerciseWeightsKg: { 'Sentadilla': 105 },
          isPR: { 'Sentadilla': true }
        }
      ]
    }
  ]
}];

describe('ExerciseUserGraphs', () => {
  test('renders and toggles between Pie and Line chart', () => {
    const setSelectedReps = jest.fn();
    const setSelectedTime = jest.fn();

    render(
      <ExerciseUserGraphs 
        stats={sampleStats} 
        selectedReps={10} 
        setSelectedReps={setSelectedReps}
        selectedTime={'YEAR'}
        setSelectedTime={setSelectedTime}
      />
    );

    // Initial header shows pie chart label
    expect(screen.getByText(/ejercicios más practicados/i)).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);

    // After toggle, line chart label appears
    expect(screen.getByText(/comparativa de progresión/i)).toBeInTheDocument();
  });
});