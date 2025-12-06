import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserStatsPentagrams from '../../../src/modules/app/components/profile/user-stats-pentagrams';

// Mock three-related libs to prevent canvas/3D rendering issues
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Html: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
  Sphere: ({ children }) => <div>{children}</div>,
}));

// Provide minimal stats to populate charts
const stats = [{
  periodExerciseStats: [
    { exerciseStats: [
      { date: '2025-01-01', exerciseWeightsKg: { 'Sentadilla': 100 }, isPR: {} },
      { date: '2025-01-02', exerciseWeightsKg: { 'Press banca': 80 }, isPR: {} },
    ]}
  ],
  periodMuscularGroupStats: [
    { muscularGroupStats: [
      { date: '2025-01-01', exerciseCount: { PECHO: 2, ESPALDA: 1 } },
      { date: '2025-01-02', exerciseCount: { PECHO: 1, PIERNA: 3 } },
    ]}
  ]
}];

describe('UserStatsPentagrams', () => {
  test('renders both stats cards', () => {
    render(<UserStatsPentagrams selectedReps={10} selectedTime={'YEAR'} stats={stats} />);
    expect(screen.getByText(/tus 5 mejores ejercicios/i)).toBeInTheDocument();
    expect(screen.getByText(/grupos musculares/i)).toBeInTheDocument();
    const infoBadges = screen.getAllByText(/interactive 3d view/i);
    expect(infoBadges.length).toBeGreaterThanOrEqual(1);
  });
});