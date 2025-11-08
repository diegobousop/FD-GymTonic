import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import backend from "../../../../backend";

import { SVG_ICONS } from '../../../../config/constants'; 
import UserStats from './user-stats';

const CalendarCard = ({ user, selectedDay, setSelectedDay, setDayFilterActivated }) => {
  
  const [activeStartDate, setActiveStartDate] = useState(new Date())
  const [trainingData, setTrainingData] = useState([])
  const [routinesByDate, setRoutinesByDate] = useState({})
  const [eventDates, setEventDates] = useState(new Set())

  useEffect(() => {
    backend.routineService.getTrainingCalendarStats(
      activeStartDate.getFullYear(),
      (data) => {
        // Si la API te devuelve directamente el array mostrado en el ejemplo:
        const items = Array.isArray(data) ? data : (data?.trainings || [])
        setTrainingData(items)
        console.log("Datos del calendario de entrenamientos:", data);
      },
      (err) => console.error(err)
    )
  }, [activeStartDate])

  // Reagrupar cada vez que cambien los datos del backend
  useEffect(() => {
    const map = {}
    trainingData.forEach((t, i) => {
      if (!t.date) return
      if (!map[t.date]) map[t.date] = []
      map[t.date].push({ ...t, id: `${t.date}-${i}` })
    })
    setRoutinesByDate(map)
    setEventDates(new Set(Object.keys(map)))
  }, [trainingData])

  const ymd = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const parseYmd = (s) => {
    if (!s) return null
    if (s instanceof Date) {
      const d = new Date(s)
      d.setHours(0,0,0,0)
      return d
    }
    const str = typeof s === 'string' ? s.slice(0,10) : ''
    const [y, m, d] = str.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  const today = new Date()
  today.setHours(0,0,0,0)
  const from = new Date(today)
  from.setDate(today.getDate() - 27) // último 28 días (4 semanas)

  const thisWeekCount = trainingData.filter(t => {
    const d = parseYmd(t.date)
    return d && d >= from && d <= today
  }).length

  const last4WeeksCount = trainingData.filter(t => {
    const d = parseYmd(t.date)
    return d && d >= from && d <= today
  }).length

  const yearTrainingsCount = trainingData.filter(t => {
    const d = parseYmd(t.date)
    return d && d.getFullYear() === today.getFullYear()
  }).length

  return (
    <div className="flex flex-col h-full border-l-[1px] border-l-[#990000] w-[30%] p-4 ">
      
      <p className="text-white text-center mt-5">Última semana</p>
      <div className="flex flex-row gap-3 justify-center">
        {thisWeekCount >= 4 ? (
          <SVG_ICONS.FireIcon className="w-12 h-auto text-[#ff0000] "/>
        ) : null}
        <h1 className="text-[55px] text-center">{thisWeekCount}</h1>
      </div>
      <h1 className="text-white text-center text-[24px] mb-5">Entrenamientos</h1>

      <Calendar
        locale="es-ES"
        calendarType="iso8601"
        value={selectedDay}
        onChange={(d) => {
          setSelectedDay(d)
          setDayFilterActivated(true) 
        }}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
        view="month"
        showNeighboringMonth={false}
        minDate={new Date(2024, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
        selectRange={false}
        formatShortWeekday={(locale, date) =>
          date.toLocaleDateString('es-ES', { weekday: 'narrow' })
        }
        formatDay={(locale, date) => String(date.getDate())}
        formatMonthYear={(locale, date) =>
          date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        }
        prev2Label={null}
        next2Label={null}
        prevLabel="‹"
        nextLabel="›"
        tileDisabled={({ date, view }) =>
          view === 'month' && date.getDay() === 0 && date < new Date()
        }
        tileClassName={({ date, view }) => {
          if (view !== 'month') return undefined
          const classes = []
          if (date.getDay() === 0 || date.getDay() === 6) classes.push('rc-weekend')
          if (eventDates.has(ymd(date))) classes.push('rc-has-event')
          if (isSameDay(date, new Date())) classes.push('rc-today')
          return classes.join(' ')
        }}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null
          const key = ymd(date)
          const routines = routinesByDate[key] || []
          if (!routines.length) return null
          return (
            <div className="rc-dots" aria-hidden>
              {routines.slice(0, 5).map((_, i) => (
                <span key={i} className="rc-dot" />
              ))}
            </div>
          )
        }}
        className="react-calendar-custom mt-2"
      />

      {(() => {
        const key = ymd(selectedDay)
        const routines = routinesByDate[key] || []
        const tituloFecha = selectedDay.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })
        return (
          <div className="w-full mt-4 text-white">
            {routines.length === 0 ? (
              <p className="text-sm text-gray-400 mt-2"></p>
            ) : (
              <ul className="mt-2 space-y-2">
              </ul>
            )}
          </div>
        )
      })()}

      <style>{`
        @font-face {
          font-family: 'KabelLTStd-Book';
          src: url('../public/assets/fonts/KabelLTStd-Book.otf') format('opentype');
        }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Space+Grotesk:wght@300..700&display=swap');
        .react-calendar-custom,
        .react-calendar-custom * {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 18px;
        }
        .react-calendar-custom {
          background: #161616;
          color: #fff;
          border: none;
          border-radius: 0.375rem;
        }
        .react-calendar-custom .react-calendar__navigation {
          background: transparent;
          border: none;
        }
        .react-calendar-custom .react-calendar__navigation button {
          color: inherit;
        }
        .react-calendar-custom .react-calendar__tile {
          background: transparent;
          color: #e5e7eb;
          position: relative;
        }
        .react-calendar-custom .react-calendar__tile--now {
          background: rgba(255,255,255,0.06);
        }
        .react-calendar-custom .react-calendar__tile--active {
          background: #ef4444;
          color: #fff;
        }
        .react-calendar-custom .react-calendar__tile:enabled:hover,
        .react-calendar-custom .react-calendar__tile:enabled:focus {
          background: rgba(255,255,255,0.08);
        }
        .react-calendar-custom .react-calendar__month-view__weekdays__weekday abbr {
          font-family: 'KabelLTStd-Book';
          text-decoration: none;
          border-bottom: none;
        }
        .react-calendar-custom .rc-dot {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 9999px;
        }
        .react-calendar-custom .rc-dots {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 3px;
        }
        .react-calendar-custom .rc-has-event {
          color: #ffffff;
        }
      `}</style>

      <UserStats user={user} last4WeeksCount={last4WeeksCount} yearTrainingsCount={yearTrainingsCount} />
    </div>
  )
}

export default CalendarCard