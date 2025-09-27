import {useState} from "react";
import backend from "../../../backend";
import SendButton from "../../app/components/common/send-button";
import TextInput from "../../app/components/common/text-input";

import NavBar from '../../app/components/common/navbar'
import SideMenu from '../../app/components/common/side-menu'

const CreateExercise = () => {
    
    const [exerciseName, setExerciseName] = useState("");
    const [exerciseDescripcion, setExerciseDescription] = useState("");
    const [grupoMuscular, setGrupoMuscular] = useState("");
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [activePage, setActivePage] = useState('create-exercise')



    let form;

    const handleSubmit = async (e) => {
    e.preventDefault();

        if(form.checkValidity()){
            try{
                await backend.exerciseService.addExercise(
                    exerciseName, exerciseDescripcion, grupoMuscular, 
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
            <h2 className="text-white"> Añadir ejercicio</h2>
            <form ref={node => form = node} className="need-validation" noValidate onSubmit={handleSubmit}>
                <TextInput 
                    name="exerciseName"
                    label="Nombre: "
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    />

                <TextInput 
                    name="exerciseDescription"
                    label="Descripcion: "
                    value={exerciseDescripcion}
                    onChange={(e) => setExerciseDescription(e.target.value)}
                    />

                <div className="flex flex-col my-2">
                    <label htmlFor="exerciseCategory" className="text-white mb-1">Categoría:</label>
                    <select
                        id="exerciseCategory"
                        name="exerciseCategory"
                        value={grupoMuscular} 
                        onChange={(e) => setGrupoMuscular(e.target.value)}
                        className="p-2 rounded"
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="PECHO">PECHO</option>
                        <option value="ESPALDA">ESPALDA</option>
                        <option value="PIERNA">PIERNA</option>
                        <option value="HOMBROS">HOMBROS</option>
                        <option value="BRAZOS">BRAZOS</option>
                        <option value="ABDOMEN">ABDOMEN</option>
                    </select>
                </div>

                <SendButton onClick={handleSubmit}></SendButton>
            
            </form>
                {backendErrors && <div className="text-red-500 text-xs mt-2">{backendErrors.globalError}</div>}
                {success && <div className="text-green-500 text-xs mt-2">Ejercicio {exerciseName} añadido existosamente</div>}
        </div>
    );
}

export default CreateExercise;