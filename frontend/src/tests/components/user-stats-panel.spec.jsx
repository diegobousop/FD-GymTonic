import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserStatsPanel from '../../../src/modules/app/components/profile/user-stats-panel';

// Mock child graphs to simplify
jest.mock('../../../src/modules/app/components/profile/exercise-user-graphs', () => (
  ({ stats }) => <div>Exercise Graphs</div>
));
jest.mock('../../../src/modules/app/components/profile/muscle-user-graphs', () => (
  ({ stats }) => <div>Muscle Graphs</div>
));
jest.mock('../../../src/modules/app/components/profile/my-profile-tab-selector', () => (
  ({ selectedReps, setSelectedReps, selectedTime, setSelectedTime, activeTab, setActiveTab }) => (
    <div>
      <button onClick={() => setActiveTab('trainingHistory')}>Entrenamientos</button>
      <button onClick={() => setActiveTab('userStats')}>Estadísticas</button>
    </div>
  )
));

// Mock three/fiber to avoid ResizeObserver from Canvas in pentagrams
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

// Provide a simple ResizeObserver polyfill for environments that need it
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof global.ResizeObserver === 'undefined') {
  // eslint-disable-next-line no-global-assign
  global.ResizeObserver = ResizeObserverPolyfill;
}

const stats = [{
  periodExerciseStats: [],
  periodMuscularGroupStats: []
}];

describe('UserStatsPanel', () => {
  test('toggles exercises and muscle groups sections', () => {
    const setActiveTab = jest.fn();
    const setSelectedReps = jest.fn();
    const setSelectedTime = jest.fn();

    render(
      <UserStatsPanel 
        activeTab={'userStats'}
        setActiveTab={setActiveTab}
        selectedReps={10}
        setSelectedReps={setSelectedReps}
        selectedTime={'YEAR'}
        setSelectedTime={setSelectedTime}
        stats={stats}
      />
    );

    // Starts with exercises active button present
    expect(screen.getByText('Exercise Graphs')).toBeInTheDocument();

    // Click toggle to muscle groups
    fireEvent.click(screen.getByRole('button', { name: /grupos musculares/i }));
    expect(screen.getByText('Muscle Graphs')).toBeInTheDocument();
  });
});