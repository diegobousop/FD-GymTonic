import {useState} from "react";
import backend from "../../../backend";
import SendButton from "../../app/components/common/send-button";
import TextInput from "../../app/components/common/text-input";
import ParagraphInput from "../../app/components/common/paragraph-input";
import MultiSelectList from "../../app/components/common/multi-select-list";


const CreateExercise = () => {
    // Variables de form
    const [exerciseName, setExerciseName] = useState("");
    const [exerciseDescripcion, setExerciseDescription] = useState("");
    const [grupoMuscular, setGrupoMuscular] = useState("");
    const [numeroSeries, setNumeroSeries] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [equipment, setEquipment] = useState("");

    // Estados para la gestión de errores y éxito
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [activePage, setActivePage] = useState('create-exercise')

    //Errores
    const [exerciseNameErrors, setExerciseNameErrors] = useState(null);
    const [exerciseDescriptionErrors, setExerciseDescriptionErrors] = useState(null);
    const [grupoMuscularErrors, setGrupoMuscularErrors] = useState(null);
    const [numeroSeriesErrors, setNumeroSeriesErrors] = useState("");
    const [difficultyErrors, setDifficultyErrors] = useState(null);
    const [equipmentErrors, setEquipmentErrors] = useState(null);

    let form;

    const handleSubmit = async (e) => {
    e.preventDefault();

        const isValid = checkErrors();
        if (!isValid) return;

        if(form.checkValidity()){
            try{
                await backend.exerciseService.addExercise(
                    exerciseName, exerciseDescripcion, grupoMuscular, numeroSeries, difficulty, equipment,
                    (id) => {
                        setSuccess(true)
                        setBackendErrors(null)

                    },
                    (err) => {
                        setSuccess(false);
                        setBackendErrors(err || "Error inesperado");
                    }
                );
            } catch (ex){
                console.log(ex.message);
                setSuccess(false);
                setBackendErrors(ex.message || "Error inesperado");
            }
        } else {
            form.classList.add("was-validated");
        }
    };

    return(
        
        <form ref={node => form = node} className="need-validation" noValidate onSubmit={handleSubmit}>
            <div className="flex flex-row gap-10 ml-10 mt-5">
                <div  className="flex flex-col justify-center items-center">
                    <TextInput
                        name="exerciseName"
                        label="Nombre: "
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        errors={exerciseNameErrors}
                        errorMessage={exerciseNameErrors}
                        className="h-10 w-full"
                    />

                    <ParagraphInput
                        name="exerciseDescription"
                        label="Descripcion: "
                        value={exerciseDescripcion}
                        onChange={(e) => setExerciseDescription(e.target.value)}
                        errors={exerciseDescriptionErrors}
                        errorMessage={exerciseDescriptionErrors}
                        maxLength={300}
                        className="h-40 w-full"
                    />
                    <SendButton onClick={handleSubmit}></SendButton>

                    
                    
                    {backendErrors && <div className="text-red-500 text-xs mt-2">{backendErrors.globalError}</div>}
                    {success && <div className="text-green-500 text-xs mt-2">Ejercicio {exerciseName} añadido existosamente</div>}

            
            </div>

            <div className="flex flex-col">
                <div className="flex flex-row gap-10">
                    
                    <MultiSelectList
                        options={[
                            { id: 'PECHO', name: 'Pecho' },
                            { id: 'ESPALDA', name: 'Espalda' },
                            { id: 'PIERNA', name: 'Pierna' },
                            { id: 'HOMBRO', name: 'Hombro' },
                            { id: 'BRAZO', name: 'Brazo' },
                            { id: 'ABDOMEN', name: 'Abdomen' },
                            { id: 'FULLBODY', name: 'Fullbody' },


                        ]}
                        selected={grupoMuscular ? [grupoMuscular] : []}
                        onChange={(selected) => setGrupoMuscular(selected[0] || "")}
                        required={true}
                        label="Grupo Muscular"
                        errors={grupoMuscularErrors}
                        errorMessage={grupoMuscularErrors}
                    />

                    <MultiSelectList
                        options={[
                            { id: 'FACIL', name: 'FACIL' },
                            { id: 'INTERMEDIO', name: 'INTERMEDIO' },
                            { id: 'DIFICIL', name: 'DIFICIL' },
                        ]}
                        selected={difficulty ? [difficulty] : []}
                        onChange={(selected) => setDifficulty(selected[0] || "")}
                        required={true}
                        label="Dificultad"
                        errors={difficultyErrors}
                        errorMessage={difficultyErrors}
                    />

                    <MultiSelectList
                        options={[
                            { id: 'POLEA_CABLE', name: 'Polea/Cable' },
                            { id: 'MAQUINA', name: 'Máquina' },
                            { id: 'PESO_LIBRE', name: 'Peso Libre' },
                            { id: 'OTROS', name: 'Otros' },
                        ]}
                        selected={equipment ? [equipment] : []}
                        onChange={(selected) => setEquipment(selected[0] || "")}
                        required={true}
                        label="Equipamiento"
                        errors={equipmentErrors}
                        errorMessage={equipmentErrors}
                    />

                    <TextInput
                        name="numeroSeries"
                        label="Numero series:"
                        value={numeroSeries}
                        onChange={(e) => {
                            const value = Number(e.target.value);

                            if (value >= 0 && value <= 20) {
                                setNumeroSeries(value);
                                setNumeroSeriesErrors(null);
                            } else {
                                setNumeroSeriesErrors('El número de series debe estar entre 0 y 20');
                            }
                        }}
                        errors={numeroSeriesErrors}
                        errorMessage={numeroSeriesErrors}
                        className="h-10 w-full"
                        type="number"
                        maxLength={2}
                    />

                </div>
                
            </div>

        </div>
     </form>
        
    );

    function checkErrors(){
        const trimmedExerciseName = exerciseName.trim()
        const trimmedExerciseDescription = exerciseDescripcion.trim()
        const trimmedGrupoMuscular = grupoMuscular.trim()
        const trimmedDifficulty = difficulty.trim()
        const trimmedEquipment = equipment.trim()
        const numeroSeriesValue = Number(numeroSeries);
        let hasError = false

        const exerciseNameErr = !trimmedExerciseName ? 'El nombre del ejercicio es obligatorio' : null
        const exerciseDescriptionErr= !trimmedExerciseDescription ? 'La descripcion del ejercicio es obligatoria' : null
        const grupoMuscularErr = !trimmedGrupoMuscular ? 'El grupo muscular es obligatorio' : null
        const difficultyErr = !trimmedDifficulty ? 'La dificultad es obligatoria' : null
        const equipmentErr = !trimmedEquipment ? 'El equipamiento es obligatorio' : null
        let numeroSeriesErr = null;
        if (isNaN(numeroSeriesValue) || numeroSeriesValue < 0 || numeroSeriesValue > 20)
            numeroSeriesErr = 'El número de series debe estar entre 0 y 20';


        if(exerciseNameErr || exerciseDescriptionErr || grupoMuscularErr || numeroSeriesErr || difficultyErr || equipmentErr) hasError = true

        setExerciseNameErrors(exerciseNameErr)
        setExerciseDescriptionErrors(exerciseDescriptionErr)
        setGrupoMuscularErrors(grupoMuscularErr)
        setNumeroSeriesErrors(numeroSeriesErr)
        setDifficultyErrors(difficultyErr)
        setEquipmentErrors(equipmentErr)

        return !hasError;
    }
}



export default CreateExercise;