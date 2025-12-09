import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserStatsPanel from '../../../src/modules/app/components/profile/user-stats-panel';

// Mock child graphs to simplify
jest.mock('../../../src/modules/app/components/profile/exercise-user-graphs', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const Component = ({ stats }) => React.createElement('div', null, 'Exercise Graphs');
  Component.propTypes = {
    stats: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  };
  return Component;
});

jest.mock('../../../src/modules/app/components/profile/muscle-user-graphs', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const Component = ({ stats }) => React.createElement('div', null, 'Muscle Graphs');
  Component.propTypes = {
    stats: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  };
  return Component;
});

jest.mock('../../../src/modules/app/components/profile/my-profile-tab-selector', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const Component = ({ selectedReps, setSelectedReps, selectedTime, setSelectedTime, activeTab, setActiveTab }) => React.createElement(
    'div',
    null,
    React.createElement('button', { onClick: () => setActiveTab('trainingHistory') }, 'Entrenamientos'),
    React.createElement('button', { onClick: () => setActiveTab('userStats') }, 'Estadísticas')
  );
  Component.propTypes = {
    selectedReps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedReps: PropTypes.func,
    selectedTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedTime: PropTypes.func,
    activeTab: PropTypes.string,
    setActiveTab: PropTypes.func,
  };
  return Component;
});

// Mock three/fiber to avoid ResizeObserver from Canvas in pentagrams
jest.mock('@react-three/fiber', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const Canvas = ({ children }) => React.createElement('div', { 'data-testid': 'canvas' }, children);
  Canvas.propTypes = { children: PropTypes.node };
  const useFrame = () => {};
  return { Canvas, useFrame };
});

jest.mock('@react-three/drei', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const OrbitControls = () => React.createElement('div', { 'data-testid': 'orbit-controls' });
  const Html = ({ children }) => React.createElement('div', null, children);
  Html.propTypes = { children: PropTypes.node };
  const Line = () => React.createElement('div', null);
  const Sphere = ({ children }) => React.createElement('div', null, children);
  Sphere.propTypes = { children: PropTypes.node };
  return { OrbitControls, Html, Line, Sphere };
});

// Provide a simple ResizeObserver polyfill for environments that need it
class ResizeObserverPolyfill {
  observe() {
    // Intentionally a no-op for tests: JSDOM doesn't implement ResizeObserver.
  }
  unobserve() {
    // Intentionally a no-op for tests.
  }
  disconnect() {
    // Intentionally a no-op for tests.
  }
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

  test('MyProfileTabSelector buttons call setActiveTab', () => {
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

    // The mocked MyProfileTabSelector exposes two buttons that call setActiveTab
    fireEvent.click(screen.getByText('Entrenamientos'));
    expect(setActiveTab).toHaveBeenCalledWith('trainingHistory');

    fireEvent.click(screen.getByText('Estadísticas'));
    expect(setActiveTab).toHaveBeenCalledWith('userStats');
  });

  test('shows forbidden message when `forbidden` prop is true', () => {
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
        forbidden={true}
      />
    );

    // Should show the follow message
    expect(screen.getByText(/Debes seguir al usuario para ver sus estadísticas\./i)).toBeInTheDocument();

    // Graphs should not be present when forbidden
    expect(screen.queryByText('Exercise Graphs')).not.toBeInTheDocument();
    expect(screen.queryByText('Muscle Graphs')).not.toBeInTheDocument();
  });
});