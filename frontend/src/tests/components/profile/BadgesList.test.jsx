import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BadgesList from '../../../modules/app/components/profile/BadgesList';
import backend from '../../../backend';

// Mock backend
jest.mock('../../../backend', () => ({
  badgeService: {
    getEarnedBadges: jest.fn(),
    getMissingBadges: jest.fn()
  }
}));

// Mock Spinner
jest.mock('../../../modules/app/components/common/spinner', () => {
    return function MockSpinner() {
        return <div data-testid="spinner">Loading...</div>;
    };
});

describe('BadgesList', () => {
  const userId = 1;
  
  const mockEarnedBadges = [
    {
      id: 1,
      name: 'WORKOUT_1',
      description: 'First workout',
      earnedDate: new Date('2023-01-01').getTime() // Timestamp or date string
    }
  ];

  const mockMissingBadges = [
    {
      id: 2,
      name: 'WORKOUT_10',
      description: 'Ten workouts'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows spinner while loading', async () => {
     // Return promise that doesn't resolve immediately
     backend.badgeService.getEarnedBadges.mockImplementation(() => new Promise(() => {}));
     backend.badgeService.getMissingBadges.mockImplementation(() => new Promise(() => {}));
     
     render(<BadgesList userId={userId} />);
     expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders earned and missing badges', async () => {
    backend.badgeService.getEarnedBadges.mockImplementation((uid, onSuccess) => onSuccess(mockEarnedBadges));
    backend.badgeService.getMissingBadges.mockImplementation((uid, onSuccess) => onSuccess(mockMissingBadges));

    render(<BadgesList userId={userId} />);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // The text "WORKOUT 1" appears in the circle and below it. We expect 2 elements.
    const workout1Texts = screen.getAllByText('WORKOUT 1');
    expect(workout1Texts).toHaveLength(2);
    expect(workout1Texts[0]).toBeInTheDocument();
    
    expect(screen.getByText('First workout')).toBeInTheDocument();
    
    // The text "WORKOUT 10" appears in the circle and below it (for missing badge)
    const workout10Texts = screen.getAllByText('WORKOUT 10');
    expect(workout10Texts).toHaveLength(1); // Actually, looking at the component, for missing badges it shows "LOCK" in the circle, and name below.
    // Wait, let's check the component code again.
    
    expect(workout10Texts[0]).toBeInTheDocument();
    expect(screen.getByText('Ten workouts')).toBeInTheDocument();
    expect(screen.getByText('LOCK')).toBeInTheDocument();
  });

  it('renders no info message when empty', async () => {
    backend.badgeService.getEarnedBadges.mockImplementation((uid, onSuccess) => onSuccess([]));
    backend.badgeService.getMissingBadges.mockImplementation((uid, onSuccess) => onSuccess([]));

    render(<BadgesList userId={userId} />);

    await waitFor(() => {
       expect(screen.getByText('No badges info available.')).toBeInTheDocument();
    });
  });
  
  it('handles error gracefully and stops loading', async () => {
     backend.badgeService.getEarnedBadges.mockImplementation((uid, onSuccess, onError) => onError({}));
     backend.badgeService.getMissingBadges.mockImplementation((uid, onSuccess) => onSuccess([]));

     render(<BadgesList userId={userId} />);
     
     await waitFor(() => {
         expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
     });     
  });

  it('does not fetch if no userId', () => {
      render(<BadgesList userId={null} />);
      expect(backend.badgeService.getEarnedBadges).not.toHaveBeenCalled();
  });

});

