import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyProfileTabSelector from '../../../src/modules/app/components/profile/my-profile-tab-selector';

// Minimal mock for svgIcons to avoid failing on import
jest.mock('../../../src/config/constants', () => ({
  svgIcons: {
    TrainingIcon: (props) => <svg data-testid="training-icon" {...props} />,
    StatsIcon: (props) => <svg data-testid="stats-icon" {...props} />,
  }
}));

describe('MyProfileTabSelector', () => {
  test('renders tabs and triggers setActiveTab', () => {
    const setActiveTab = jest.fn();
    const setSelectedReps = jest.fn();
    const setSelectedTime = jest.fn();

    render(
      <MyProfileTabSelector 
        activeTab={'trainingHistory'} 
        setActiveTab={setActiveTab}
        selectedReps={8}
        setSelectedReps={setSelectedReps}
        selectedTime={'YEAR'}
        setSelectedTime={setSelectedTime}
      />
    );

    const trainingBtn = screen.getByRole('button', { name: /entrenamientos/i });
    const statsBtn = screen.getByRole('button', { name: /estadísticas/i });
    expect(trainingBtn).toBeInTheDocument();
    expect(statsBtn).toBeInTheDocument();

    fireEvent.click(statsBtn);
    expect(setActiveTab).toHaveBeenCalledWith('userStats');
  });
});