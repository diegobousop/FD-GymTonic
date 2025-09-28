 import {useState,useEffect} from "react";
import backend from "../../../backend";
import SendButton from "../components/common/send-button";
import TextInput from "../components/common/text-input";
import MultiSelectList from "../components/common/multi-select-list";


const CreateRoutine = () => {

    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");
    const [exercises, setExercises] = useState([]);
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [selectedExercises, setSelectedExercises] = useState([]);
    

    let form;

    useEffect(() => {
        backend.exerciseService.getAllExercises(
        0,
        (block) => setExercises(block.items),
        (err) => setExercises([])
        );
    }, []);


    const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.checkValidity() && !isNaN(duration) ) {
        try {
            await backend.routineService.createRoutine(
                name.trim(),
                selectedExercises, 
                Number(duration),
                (routine) => {
                    setSuccess(true)
                    setBackendErrors(null)
                },
                (err) => {
                // Callback de error
                setSuccess(false);
                setBackendErrors(err || "Error inesperado");
                }

            );


        } catch (ex) {
        setSuccess(false);
        setBackendErrors(ex.message || "Error inesperado");
        }
    } else {
        form.classList.add("was-validated");
    }
    };

    return (
            <div className="flex flex-col mt-10 justify-center items-center">
                <form ref={node => form = node} className="needs-validation" noValidate onSubmit={handleSubmit}>
                    <TextInput
                        name="RoutineName"
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />

                    <TextInput
                        name="RoutineDuration"
                        label="Duración"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        maxLength="3"
                        type="number"
                        />

                    <MultiSelectList
                        options={exercises}
                        selected={selectedExercises}
                        onChange={setSelectedExercises}
                        label="Ejercicios"
                        />
                    <SendButton onClick={handleSubmit}></SendButton>
                </form>    

                        {backendErrors && <div className="text-red-500 text-xs mt-2">{backendErrors.globalError}</div>}
                        {success && <div className="text-green-500 text-xs mt-2">Rutina creada Exitosamente</div>}
            </div>       

    );

}

export default CreateRoutine;
