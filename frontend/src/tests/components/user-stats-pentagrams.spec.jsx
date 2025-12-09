import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserStatsPentagrams, { PentagramChart } from '../../../src/modules/app/components/profile/user-stats-pentagrams';

const mockUseFrame = jest.fn();
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: (cb) => mockUseFrame(cb),
}));
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Html: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
  Sphere: ({ children, onPointerOver, onPointerOut }) => (
    <div 
      data-testid="sphere" 
      onMouseOver={onPointerOver} 
      onMouseOut={onPointerOut}
    >
      {children}
    </div>
  ),
}));

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

  test('PentagramChart animation logic in useFrame', () => {
    const originalScale = HTMLElement.prototype.scale;
    const originalRotation = HTMLElement.prototype.rotation;
    const originalPosition = HTMLElement.prototype.position;

    const mockSetScalar = jest.fn();
    const mockLerp = jest.fn();

    Object.defineProperty(HTMLElement.prototype, 'scale', {
      get() {
        if (!this._scale) this._scale = { setScalar: mockSetScalar, x: 1, y: 1, z: 1 };
        return this._scale;
      },
      configurable: true
    });
    Object.defineProperty(HTMLElement.prototype, 'rotation', {
      get() {
        if (!this._rotation) this._rotation = { x: 0, y: 0, z: 0 };
        return this._rotation;
      },
      configurable: true
    });
    Object.defineProperty(HTMLElement.prototype, 'position', {
      get() {
        if (!this._position) this._position = { x: 0, y: 0, z: 0, lerp: mockLerp };
        return this._position;
      },
      configurable: true
    });

    // Render the component
    const data = [
        { label: 'A', value: 10, normalized: 1 },
        { label: 'B', value: 5, normalized: 0.5 },
        { label: 'C', value: 8, normalized: 0.8 },
        { label: 'D', value: 3, normalized: 0.3 },
        { label: 'E', value: 7, normalized: 0.7 }
    ];
    
    render(<PentagramChart data={data} />);
    
    const state = { clock: { getElapsedTime: () => 1.0 } };
    
    mockUseFrame.mock.calls.forEach(([callback]) => {
        callback(state);
    });

    expect(mockSetScalar).toHaveBeenCalled();
    
    // Cleanup
    if (originalScale) HTMLElement.prototype.scale = originalScale;
    else delete HTMLElement.prototype.scale;
    
    if (originalRotation) HTMLElement.prototype.rotation = originalRotation;
    else delete HTMLElement.prototype.rotation;
    
    if (originalPosition) HTMLElement.prototype.position = originalPosition;
    else delete HTMLElement.prototype.position;
  });

  test('PentagramChart interaction logic (hover/unhover)', () => {
    jest.useFakeTimers();
    const data = [
        { label: 'A', executionCount: 100 },
        { label: 'B', executionCount: 50 },
        { label: 'C', executionCount: 80 },
        { label: 'D', executionCount: 30 },
        { label: 'E', executionCount: 70 }
    ];

    render(<PentagramChart data={data} valueKey="executionCount" />);

    const spheres = screen.getAllByTestId('sphere');
    expect(spheres.length).toBe(5);

    //Hover
    const mockStopPropagation = jest.fn();
    
    act(() => {
        fireEvent.mouseOver(spheres[0], { stopPropagation: mockStopPropagation });
    });


    const badges = screen.getAllByText('100');
    const badge = badges.find(el => el.className.includes('rounded-full'));
    expect(badge).toBeInTheDocument();

    act(() => {
        fireEvent.mouseOut(spheres[0]);
    });
    expect(badge).toBeInTheDocument();
    act(() => {
        jest.runAllTimers();
    });

    expect(badge).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});