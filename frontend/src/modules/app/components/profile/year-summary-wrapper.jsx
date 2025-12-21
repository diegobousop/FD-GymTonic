import { useEffect, useState, useContext } from 'react'
import backend from "../../../../backend"
import PropTypes from 'prop-types'
import YearSummaryCard from './year-summary-card'
import { UserContext } from '../common/user-provider'

const STATUE_OF_LIBERTY_WEIGHT = 225000 // kg

const YearSummaryWrapper = ({ year }) => {
  const { user } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  useEffect(() => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)

    // Fetch all user trainings for the year
    const fetchAllTrainings = async () => {
      let allTrainings = []
      let page = 0
      const size = 100
      let hasMore = true

      while (hasMore) {
        await new Promise((resolve) => {
          backend.routineService.viewUserTrainings(
            user.id,
            page,
            size,
            (data) => {
              const yearTrainings = data.items.filter(t => {
                const date = new Date(t.creationDate)
                return date.getFullYear() === year
              })
              allTrainings.push(...yearTrainings)
              
              // Check if we should continue fetching
              if (data.existMoreItems && data.items.length === size) {
                // Only continue if we got a full page and there are more items
                hasMore = true
                page++
              } else {
                hasMore = false
              }
              resolve()
            },
            (err) => {
              console.error('Error fetching trainings:', err)
              hasMore = false
              resolve()
            }
          )
        })
      }

      // Calculate statistics
      const calculatedStats = calculateStatistics(allTrainings)
      setStats(calculatedStats)
      setIsLoading(false)
    }

    fetchAllTrainings().catch((err) => {
      console.error('Error in fetchAllTrainings:', err)
      setError('Error al cargar los entrenamientos')
      setIsLoading(false)
    })
  }, [year, user])

  const calculateStatistics = (trainings) => {
    if (!trainings || trainings.length === 0) {
      return {
        totalTrainings: 0,
        mostUsedExercise: null,
        mostTrainedMuscleGroup: null,
        totalWeightLifted: 0,
        longestStreak: 0
      }
    }

    // Exercise frequency
    const exerciseCount = {}
    const muscleGroupCount = {}
    let totalWeight = 0
    const trainingDates = new Set()

    trainings.forEach(training => {
      if (training.exercises) {
        training.exercises.forEach(exercise => {
          // Count exercise usage
          const exerciseName = exercise.name
          exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1

          // Count muscle group usage
          const muscleGroup = exercise.grupoMuscular
          if (muscleGroup) {
            muscleGroupCount[muscleGroup] = (muscleGroupCount[muscleGroup] || 0) + 1
          }

          // Calculate total weight (peso * repeticiones for each serie)
          if (exercise.series) {
            exercise.series.forEach(serie => {
              totalWeight += (serie.peso || 0) * (serie.repeticiones || 0)
            })
          }
        })
      }

      // Track training dates for streak calculation
      if (training.creationDate) {
        const date = new Date(training.creationDate)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        trainingDates.add(dateKey)
      }
    })

    // Find most used exercise
    const exerciseKeys = Object.keys(exerciseCount)
    const mostUsedExercise = exerciseKeys.length > 0
      ? exerciseKeys.reduce((a, b) => exerciseCount[a] > exerciseCount[b] ? a : b)
      : null

    // Find most trained muscle group
    const muscleGroupKeys = Object.keys(muscleGroupCount)
    const mostTrainedMuscleGroup = muscleGroupKeys.length > 0
      ? muscleGroupKeys.reduce((a, b) => muscleGroupCount[a] > muscleGroupCount[b] ? a : b)
      : null

    // Calculate longest streak
    const sortedDates = Array.from(trainingDates).sort()
    let longestStreak = 0
    let currentStreak = 0
    let previousDate = null

    sortedDates.forEach(dateStr => {
      const currentDate = new Date(dateStr)
      currentDate.setHours(0, 0, 0, 0)
      
      if (previousDate) {
        const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      previousDate = currentDate
    })
    longestStreak = Math.max(longestStreak, currentStreak)

    return {
      totalTrainings: trainings.length,
      mostUsedExercise: mostUsedExercise ? {
        name: mostUsedExercise,
        count: exerciseCount[mostUsedExercise]
      } : null,
      mostTrainedMuscleGroup: mostTrainedMuscleGroup ? {
        name: mostTrainedMuscleGroup,
        count: muscleGroupCount[mostTrainedMuscleGroup]
      } : null,
      totalWeightLifted: totalWeight,
      longestStreak: longestStreak
    }
  }

  const cards = stats ? [
    {
      type: 'totalTrainings',
      title: 'Resumen de Gymtonic de ' + year,
      value: stats.totalTrainings,
      subtitle: 'entrenamientos totales'
    },
    {
      type: 'mostUsedExercise',
      title: 'Resumen de Gymtonic de ' + year,
      value: stats.mostUsedExercise?.name || 'N/A',
      subtitle: stats.mostUsedExercise 
        ? `Lo hiciste ${stats.mostUsedExercise.count} veces`
        : 'No hay datos'
    },
    {
      type: 'mostTrainedMuscleGroup',
      title: 'Resumen de Gymtonic de ' + year,
      value: stats.mostTrainedMuscleGroup?.name || 'N/A',
      subtitle: stats.mostTrainedMuscleGroup
        ? `Lo entrenaste ${stats.mostTrainedMuscleGroup.count} veces`
        : 'No hay datos'
    },
    {
      type: 'totalWeight',
      title: 'Resumen de Gymtonic de ' + year,
      value: stats.totalWeightLifted,
      statuesOfLiberty: stats.totalWeightLifted / STATUE_OF_LIBERTY_WEIGHT
    },
    {
      type: 'longestStreak',
      title: 'Resumen de Gymtonic de ' + year,
      value: stats.longestStreak,
      subtitle: 'días consecutivos'
    }
  ] : []

  const handleNext = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrev = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setTouchStart(touch.clientX)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    setTouchEnd(touch.clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentCardIndex < cards.length - 1) {
      handleNext()
    }
    if (isRightSwipe && currentCardIndex > 0) {
      handlePrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Cargando estadísticas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!stats || cards.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">No hay datos disponibles para este año</div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div 
        className="relative overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
        >
          {cards.map((card, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2">
              <YearSummaryCard card={card} year={year} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCardIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentCardIndex ? 'bg-blue-500' : 'bg-white opacity-50'
            }`}
            aria-label={`Ir a tarjeta ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {cards.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 md:-translate-x-12 text-white hover:text-blue-400 transition-colors text-4xl md:text-5xl"
            aria-label="Tarjeta anterior"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 md:translate-x-12 text-white hover:text-blue-400 transition-colors text-4xl md:text-5xl"
            aria-label="Tarjeta siguiente"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

YearSummaryWrapper.propTypes = {
  year: PropTypes.number.isRequired
}

export default YearSummaryWrapper

