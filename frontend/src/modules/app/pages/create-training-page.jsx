import {useState,useEffect} from "react";
import { useToast } from '../components/common/toast-provider'


import backend from "../../../backend";

import TextInput from '../components/common/text-input';
import ParagraphInput from '../components/common/paragraph-input';
import MinuteInput from '../components/routine/minute-input';
import VisibilityInput from '../components/routine/visibility-input';

import RoutineSelector from '../components/training/routine-selector';
import Spinner from '../components/common/spinner';
import TrainingButton from "../components/training/training-button";

import RoutineSeriesPanel from '../components/training/routine-series-panel';


const CreateTraining = () => {

    //control
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const { showToast } = useToast()

    //variables del form
    const [name, setName] = useState("");
    const [exerciseDescripcion, setExerciseDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [visibility, setVisibility] = useState(true);
    
    //errores del form
    const [nameErrors, setNameErrors] = useState(null);
    const [durationErrors, setDurationErrors] = useState(null);

    //Rutina seleccionada
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [selectRoutineExercises, setSelectRoutineExercises] = useState([]);
    const [selectedRoutineDetails, setSelectedRoutineDetails] = useState(() => {
      const saved = localStorage.getItem('selectedRoutineDetails');
      return saved ? JSON.parse(saved) : null;
    });

    // Guardar en localStorage cuando cambia selectedRoutineDetails
    useEffect(() => {
      if (selectedRoutineDetails) {
        localStorage.setItem('selectedRoutineDetails', JSON.stringify(selectedRoutineDetails));
      }
    }, [selectedRoutineDetails]);

    useEffect(() => {
        return () => {
            localStorage.removeItem('selectedRoutineDetails');
        };
    }, []);

    const onDeselect = () => {
      setName("");
      setExerciseDescription("");
      setDuration("");
      setVisibility(0);
      setSelectedRoutineDetails(null);
    }

    const validateTraining = () => {
      let validated = true;
      // Validar que haya una rutina seleccionada
      if (!selectedRoutine) {
        showToast('Debes seleccionar una rutina', 'error')
        validated = false;
      }
      // Validar nombre
      if (!name || name.trim() === "") {
        setNameErrors("El nombre es obligatorio");
        validated = false;
      } else if (name.length < 3) {
        setNameErrors("El nombre debe tener al menos 3 caracteres");
        validated = false;
      } else if (name.length > 100) {
        setNameErrors("El nombre no puede exceder 100 caracteres");
        validated = false;
      } else {
        setNameErrors(null);
      }

      // Validar duración
      if (!duration || duration === "") {
        setDurationErrors("La duración es obligatoria");
        validated = false;
      }
      if (isNaN(duration) || parseInt(duration) <= 0) {
        setDurationErrors("La duración debe ser un número positivo");
        validated = false;
      }
      if (parseInt(duration) > 1000) {
        setDurationErrors("La duración no puede exceder 1000 minutos");
        validated = false;
      } 

      return validated;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        // Validar antes de enviar
        if (!validateTraining()) {
          setLoading(false);
          return;
        }


        const exercises = selectedRoutineDetails.exercises.map((exercise) => ({
          id: exercise.id,
          series: exercise.series.map((serie) => ({
            numeroSerie: serie.numeroSerie,
            repeticiones: serie.repeticiones,
            peso: serie.peso,
          })),
        }));

        backend.routineService.createTraining(
          selectedRoutine.id,
          name,
          exerciseDescripcion,
          duration,
          visibility,
          exercises,
          (createdTraining) => {
            console.log("Training created successfully:", createdTraining);
            setValidationErrors({});
            showToast('Entrenamiento creado con éxito', 'success');
            setLoading(false);
          },
          (err) => {
            console.error("Error creating training:", err);
            setError(err);
            showToast('Error al crear el entrenamiento', 'error');
            setLoading(false);
          }
        );
    };

    useEffect(() => {
        if (selectedRoutine) {
          setLoading(true);
          backend.routineService.findRoutineDetails(
                selectedRoutine.id,
                (data) => {
                  setSelectedRoutineDetails(data);
                  setName(data.name);
                  setDuration(data.duration)
                  setLoading(false);
                },
                (err) => {
                  setError(err || "Error inesperado al cargar rutinas");
                  setLoading(false);
                }
              );
        }
      console.log("Selected Routine Details:", selectedRoutineDetails);
    }, [selectedRoutine]);

    if (loading){      
      return <Spinner size={100}/>
    }

  return (
    <div>
         {validationErrors.routine && (
           <div className="text-[#ff0000] text-sm mb-4 p-3 bg-[#262626] border border-[#ff0000]">
             {validationErrors.routine}
           </div>
         )}
         
         {validationErrors.exercises && (
           <div className="text-[#ff0000] text-sm mb-4 p-3 bg-[#262626] border border-[#ff0000]">
             {validationErrors.exercises}
           </div>
         )}

         <div className="flex flex-row border-b border-b-[#ff0000] gap-10">
            <RoutineSelector selectedRoutine={selectedRoutine} setSelectedRoutine={setSelectedRoutine} onDeselect={onDeselect} />

            <div className="flex flex-col">
              <TextInput
                  name="RoutineName"
                  label="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  errors={nameErrors}
                  errorMessage={nameErrors}
              />

              <ParagraphInput
                      name="exerciseDescription"
                      label="Descripcion"
                      placeholder={"Opcional"}
                      value={exerciseDescripcion}
                      onChange={(e) => setExerciseDescription(e.target.value)}
                      maxLength={300}
                      className="h-40 w-full"
                  />
                  
            </div>
            
            <div className="flex flex-col justify-start">

              <MinuteInput 
                  name="duration"
                  label="Duración"
                  placeholder=""
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  errors={durationErrors}
                  errorMessage={durationErrors}
              />

              <VisibilityInput
                  name="visibility"
                  label="Visibilidad"
                  initialValue={0}
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
              />

              <TrainingButton isLoading={loading} children="Crear" onClick={handleSubmit}></TrainingButton>
            </div>

         </div>


        <RoutineSeriesPanel
            routine={selectedRoutineDetails}
            isLoading={loading}
            onRoutineChange={setSelectedRoutineDetails}
        />


    </div>
  )
}

export default CreateTraining