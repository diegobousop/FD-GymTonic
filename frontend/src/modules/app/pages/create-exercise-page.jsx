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
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [activePage, setActivePage] = useState('create-exercise')
    const [exerciseNameErrors, setExerciseNameErrors] = useState(null);
    const [exerciseDescriptionErrors, setExerciseDescriptionErrors] = useState(null);
    const [grupoMuscularErrors, setGrupoMuscularErrors] = useState(null);
    const [numeroSeriesErrors, setNumeroSeriesErrors] = useState("");

    let form;

    const handleSubmit = async (e) => {
    e.preventDefault();

        const isValid = checkErrors();
        if (!isValid) return;

        if(form.checkValidity()){
            try{
                await backend.exerciseService.addExercise(
                    exerciseName, exerciseDescripcion, grupoMuscular, numeroSeries,
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
                    label="Numero series: "
                    value={numeroSeries}
                    onChange={(e) => setNumeroSeries(e.target.value)}
                    errors={numeroSeriesErrors}
                    errorMessage={numeroSeriesErrors}
                    className="h-10 w-full"
                    type="number"
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
        const trimmedNumeroSeries = numeroSeries.trim()
        let hasError = false

        const exerciseNameErr = !trimmedExerciseName ? 'El nombre del ejercicio es obligatorio' : null
        const exerciseDescriptionErr= !trimmedExerciseDescription ? 'La descripcion del ejercicio es obligatoria' : null
        const grupoMuscularErr = !trimmedGrupoMuscular ? 'El grupo muscular es obligatorio' : null
        const numeroSeriesErr =!trimmedNumeroSeries ? 'Número de series obligatorio' : null

        if(exerciseNameErr || exerciseDescriptionErr || grupoMuscularErr || numeroSeriesErr) hasError = true

        setExerciseNameErrors(exerciseNameErr)
        setExerciseDescriptionErrors(exerciseDescriptionErr)
        setGrupoMuscularErrors(grupoMuscularErr)
        setNumeroSeriesErrors(numeroSeriesErr)

        return !hasError;
    }
}



export default CreateExercise;