import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MuscleUserGraphs from '../../../src/modules/app/components/profile/muscle-user-graphs';

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
    Brush: Passthrough,
    Pie,
    Cell,
  };
});

const sampleStats = [{
  periodMuscularGroupStats: [
    {
      muscularGroupStats: [
        { date: '2025-01-01', exerciseCount: { PECHO: 2, ESPALDA: 1 } },
        { date: '2025-01-02', exerciseCount: { PECHO: 1, PIERNA: 3 } },
      ]
    }
  ]
}];

describe('MuscleUserGraphs', () => {
  test('renders and toggles chart view', () => {
    render(<MuscleUserGraphs stats={sampleStats} />);
    expect(screen.getByText(/distribución de entrenamiento/i)).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/evolución por grupo muscular/i)).toBeInTheDocument();
  });
});