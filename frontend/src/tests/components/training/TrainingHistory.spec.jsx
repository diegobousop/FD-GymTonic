import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'

// Mock Spinner y Pager para controlar estados y paginación
jest.mock('../../../modules/app/components/common/spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner">Loading...</div>
}))
jest.mock('../../../modules/app/components/common/pager', () => ({
  __esModule: true,
  default: ({ back, next }) => (
    <div>
      <button data-testid="pager-back" disabled={!back.enabled} onClick={back.onClick}>Back</button>
      <button data-testid="pager-next" disabled={!next.enabled} onClick={next.onClick}>Next</button>
    </div>
  )
}))

// Mock backend.routineService antes de importar el componente
const mockViewUserTrainings = jest.fn()
const mockViewDayTrainings = jest.fn()

jest.mock('../../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      viewUserTrainings: (...args) => mockViewUserTrainings(...args),
      viewDayTrainings: (...args) => mockViewDayTrainings(...args)
    }
  }
}))

// Import del componente después de mocks
import TrainingHistory from '../../../modules/app/components/training/training-history'

const baseUser = {
  avatar: { avatarBase64: 'data:image/png;base64,AAA' },
  userName: 'tester'
}

const makeTraining = (id = 1) => ({
  id,
  name: `Entrenamiento ${id}`,
  description: `Descripción ${id}`,
  creationDate: '2025-11-10T10:15:00Z',
  duration: 42,
  exercises: [
    { name: 'Sentadilla', exerciseImageBase64: 'data:image/png;base64,EEE' },
    { name: 'Press banca', exerciseImageBase64: 'data:image/png;base64,FFF' }
  ],
  public: true,
  routineId: 7,
  routineName: 'Rutina Fuerza',
  creatorUserName: 'coach'
})

describe('TrainingHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  

  test('estado vacío sin filtro (ningún entrenamiento)', async () => {
    mockViewUserTrainings.mockImplementation((userId,page, size, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false })
    })

    render(
      <MemoryRouter>
        <TrainingHistory
          user={baseUser}
          dayFilterActivated={false}
          setFilterActivated={jest.fn()}
          selectedDay={new Date(2025, 10, 10)}
        />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Ningún entrenamiento registrado/i)).toBeInTheDocument()
    )
  })

  test('modo filtro día: llama a viewDayTrainings y muestra etiqueta de día', async () => {
    const selected = new Date(2025, 10, 10) // 10 Nov 2025
    mockViewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: [makeTraining(2)], existMoreItems: false })
    })

    render(
      <MemoryRouter>
        <TrainingHistory
          user={baseUser}
            dayFilterActivated={true}
            setFilterActivated={jest.fn()}
            selectedDay={selected}
        />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Entrenamiento 2/i)).toBeInTheDocument()
    )

    expect(mockViewDayTrainings).toHaveBeenCalledWith(
      0,
      5,
      selected.getDate(),
      selected.getMonth() + 1,
      selected.getFullYear(),
      expect.any(Function),
      expect.any(Function)
    )
  })

  test('paginación: al hacer click en Next llama a viewUserTrainings con página siguiente', async () => {
    // Primera llamada (page 0)
    mockViewUserTrainings.mockImplementationOnce((userId,page, size, onSuccess) => {
      onSuccess({ items: [makeTraining(1)], existMoreItems: true })
    })
    // Segunda llamada (page 1)
    mockViewUserTrainings.mockImplementationOnce((userId,page, size, onSuccess) => {
      onSuccess({ items: [makeTraining(2)], existMoreItems: false })
    })

    render(
      <MemoryRouter>
        <TrainingHistory
          user={baseUser}
          dayFilterActivated={false}
          setFilterActivated={jest.fn()}
          selectedDay={new Date(2025, 10, 10)}
        />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Entrenamiento 1/i)).toBeInTheDocument()
    )

    const nextBtn = screen.getByTestId('pager-next')
    expect(nextBtn).toBeEnabled()
    fireEvent.click(nextBtn)

    await waitFor(() =>
      expect(screen.getByText(/Entrenamiento 2/i)).toBeInTheDocument()
    )

    expect(mockViewUserTrainings).toHaveBeenNthCalledWith(1,undefined, 0, 5, expect.any(Function), expect.any(Function))
    expect(mockViewUserTrainings).toHaveBeenNthCalledWith(2, undefined,1, 5, expect.any(Function), expect.any(Function))
  })

  test('estado vacío con filtro día muestra mensaje específico', async () => {
    const selected = new Date(2025, 10, 10)
    mockViewDayTrainings.mockImplementation((page, size, day, month, year, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false })
    })

    render(
      <MemoryRouter>
        <TrainingHistory
          user={baseUser}
          dayFilterActivated={true}
          setFilterActivated={jest.fn()}
          selectedDay={selected}
        />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Ningún entrenamiento registrado para el/i)).toBeInTheDocument()
    )
  })

  test('muestra duración y número de ejercicios', async () => {
    mockViewUserTrainings.mockImplementation((userId,page, size, onSuccess) => {
      onSuccess({ items: [makeTraining(5)], existMoreItems: false })
    })

    render(
      <MemoryRouter>
        <TrainingHistory
          user={baseUser}
          dayFilterActivated={false}
          setFilterActivated={jest.fn()}
          selectedDay={new Date(2025, 10, 10)}
        />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText(/Entrenamiento 5/i)).toBeInTheDocument()
    )

    expect(screen.getByText(/42 min/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/Rutina Fuerza/i)).toBeInTheDocument()
  })
})