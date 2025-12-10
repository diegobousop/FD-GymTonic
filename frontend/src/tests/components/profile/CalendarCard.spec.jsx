import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

// Congela la fecha de hoy para cálculos (10 Nov 2025)
beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2025-11-10T12:00:00Z'))
})
afterAll(() => {
  jest.useRealTimers()
})

/* Mocks */

const mockGetTrainingCalendarStats = jest.fn()

// Mock backend usado por el componente (ruta efectiva: ../../../../backend desde calendar-card)
jest.mock('../../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      getTrainingCalendarStatsForUser: (...args) => mockGetTrainingCalendarStats(...args)
    }
  }
}))

// Mock UserStats para inspeccionar los props
jest.mock('../../../modules/app/components/profile/user-stats', () => ({
  __esModule: true,
  default: ({ last4WeeksCount, yearTrainingsCount }) => (
    <div data-testid="user-stats">
      <span data-testid="last4">{last4WeeksCount}</span>
      <span data-testid="year">{yearTrainingsCount}</span>
    </div>
  )
}))

// Captura de props de Calendar para inspección posterior
let capturedCalendarProps = null
jest.mock('react-calendar', () => ({
  __esModule: true,
  default: (props) => {
    capturedCalendarProps = props
    return <div data-testid="calendar-mock" />
  }
}))

// Import del componente después de mocks
import CalendarCard from '../../../modules/app/components/profile/calendar-card'

const sampleTrainings = [
  // Dentro de la última semana (hoy y 6 días previos: 2025-11-10 a 2025-11-04)
  { date: '2025-11-10' },
  { date: '2025-11-09' },
  { date: '2025-11-08' },
  { date: '2025-11-07' },
  // Dentro de las últimas 4 semanas pero fuera de los últimos 7 días (rango 28 días: desde 2025-10-14)
  { date: '2025-10-20' },
  // En el año pero fuera de las últimas 4 semanas
  { date: '2025-01-15' }
]

describe('CalendarCard', () => {
  beforeEach(() => {
    mockGetTrainingCalendarStats.mockImplementation((userId, year, onSuccess) => {
      onSuccess(sampleTrainings)
    })
    capturedCalendarProps = null
    jest.clearAllMocks()
  })

  test('calcula correctamente thisWeekCount, last4WeeksCount y yearTrainingsCount', async () => {
    render(
      <CalendarCard
        user={{ id: 1, userName: 'tester' }}
        selectedDay={new Date('2025-11-10')}
        setSelectedDay={jest.fn()}
        setDayFilterActivated={jest.fn()}
      />
    )

    // Espera a que se procese el efecto de carga
    await waitFor(() => {
      // thisWeekCount = 4 (los 4 más recientes dentro de 7 días)
      expect(screen.getByRole('heading', { name: '4' })).toBeInTheDocument()
    })

    // UserStats mock expone los contadores
    // last4WeeksCount = 5 (los 4 de la semana + 20 Oct)
    expect(screen.getByTestId('last4').textContent).toBe('5')
    // yearTrainingsCount = 6 (todos del 2025)
    expect(screen.getByTestId('year').textContent).toBe('6')

    // FireIcon debería mostrarse porque thisWeekCount >= 4
    // Busca el svg por clases (escape necesario para corchetes y #)
    const fireIcon = document.querySelector('.w-12.h-auto.text-\\[\\#ff0000\\]')
    expect(fireIcon).not.toBeNull()

    // Verifica llamada al backend con el año actual
    expect(mockGetTrainingCalendarStats).toHaveBeenCalledWith(
      1,
      2025,
      expect.any(Function),
      expect.any(Function)
    )
  })

  test('llama de nuevo al backend al cambiar activeStartDate (año distinto)', async () => {
    render(
      <CalendarCard
        user={{ id: 1, userName: 'tester' }}
        selectedDay={new Date('2025-11-10')}
        setSelectedDay={jest.fn()}
        setDayFilterActivated={jest.fn()}
      />
    )

    await waitFor(() => expect(mockGetTrainingCalendarStats).toHaveBeenCalledTimes(1))

    // Simula cambio de mes/año (por ejemplo 1 Feb 2026)
    const newDate = new Date('2026-02-01')
    capturedCalendarProps.onActiveStartDateChange({ activeStartDate: newDate })

    await waitFor(() => expect(mockGetTrainingCalendarStats).toHaveBeenCalledTimes(2))
    expect(mockGetTrainingCalendarStats).toHaveBeenLastCalledWith(
      1,
      2026,
      expect.any(Function),
      expect.any(Function)
    )
  })

  test('tileClassName marca rc-has-event, rc-today y rc-weekend correctamente', async () => {
    render(
      <CalendarCard
        user={{ id: 1, userName: 'tester' }}
        selectedDay={new Date('2025-11-10')}
        setSelectedDay={jest.fn()}
        setDayFilterActivated={jest.fn()}
      />
    )

    await waitFor(() => capturedCalendarProps !== null)

    const { tileClassName } = capturedCalendarProps
    const today = new Date('2025-11-10')
    const sunday = new Date('2025-11-09') // domingo con evento
    const weekdayNoEvent = new Date('2025-11-06') // jueves sin evento

    const todayClasses = tileClassName({ date: today, view: 'month' })
    expect(todayClasses).toMatch(/rc-today/)
    expect(todayClasses).toMatch(/rc-has-event/)

    const sundayClasses = tileClassName({ date: sunday, view: 'month' })
    expect(sundayClasses).toMatch(/rc-weekend/)
    expect(sundayClasses).toMatch(/rc-has-event/)

    const weekdayClasses = tileClassName({ date: weekdayNoEvent, view: 'month' })
    expect(weekdayClasses).not.toMatch(/rc-weekend/)
    expect(weekdayClasses).not.toMatch(/rc-has-event/)
  })

  test('tileContent genera puntos cuando hay entrenamientos', async () => {
    render(
      <CalendarCard
        user={{ id: 1, userName: 'tester' }}
        selectedDay={new Date('2025-11-10')}
        setSelectedDay={jest.fn()}
        setDayFilterActivated={jest.fn()}
      />
    )
    await waitFor(() => capturedCalendarProps !== null)

    const { tileContent } = capturedCalendarProps
    // Fecha con entrenamientos (hoy)
    const withEvents = tileContent({ date: new Date('2025-11-10'), view: 'month' })
    expect(withEvents).not.toBeNull()
    // Fecha sin entrenamientos (11 Nov que no está en sampleTrainings)
    const noEvents = tileContent({ date: new Date('2025-11-11'), view: 'month' })
    expect(noEvents).toBeNull()
  })
})