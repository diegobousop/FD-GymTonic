import {useState} from "react";
import backend from "../../../backend";
import SendButton from "../../app/components/common/send-button";
import TextInput from "../../app/components/common/text-input";
import ParagraphInput from "../../app/components/common/paragraph-input";
import MultiSelectList from "../../app/components/common/multi-select-list";


const CreateExercise = () => {

    const [exerciseName, setExerciseName] = useState("");
    const [exerciseDescripcion, setExerciseDescription] = useState("");
    const [grupoMuscular, setGrupoMuscular] = useState("");
    const [numeroSeries, setNumeroSeries] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [equipment, setEquipment] = useState("");
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [activePage, setActivePage] = useState('create-exercise')
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
        <div  className="flex flex-col mt-10 justify-center items-center">
            <form ref={node => form = node} className="need-validation" noValidate onSubmit={handleSubmit}>
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
                    min={0}
                    max={20}
                />
                <MultiSelectList
                    options={[
                        { id: 'PECHO', name: 'PECHO' },
                        { id: 'ESPALDA', name: 'ESPALDA' },
                        { id: 'PIERNA', name: 'PIERNA' },
                        { id: 'HOMBROS', name: 'HOMBROS' },
                        { id: 'BRAZOS', name: 'BRAZOS' },
                        { id: 'ABDOMEN', name: 'ABDOMEN' },
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
                        { id: 'POLEA_CABLE', name: 'POLEA/CABLE' },
                        { id: 'MAQUINA', name: 'MAQUINA' },
                        { id: 'PESO_LIBRE', name: 'PESO LIBRE' },
                        { id: 'OTROS', name: 'OTROS' },
                    ]}
                    selected={equipment ? [equipment] : []}
                    onChange={(selected) => setEquipment(selected[0] || "")}
                    required={true}
                    label="Equipamiento"
                    errors={equipmentErrors}
                    errorMessage={equipmentErrors}
                />

                <SendButton onClick={handleSubmit}></SendButton>

            </form>
                {backendErrors && <div className="text-red-500 text-xs mt-2">{backendErrors.globalError}</div>}
                {success && <div className="text-green-500 text-xs mt-2">Ejercicio {exerciseName} añadido existosamente</div>}
        </div>
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