import {useState} from "react";
import backend from "../../../backend";
import SendButton from "../../app/components/common/send-button";
import TextInput from "../../app/components/common/text-input";

import NavBar from '../../app/components/common/navbar'
import SideMenu from '../../app/components/common/side-menu'


const CreateRoutine = () => {

    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");
    const [exercises, setExercises] = useState("");
    const [success, setSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [activePage, setActivePage] = useState('create-routine')
    

    let form;

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Parsear los ejercicios desde el input de texto
    const parsedExercises = exercises
        .split(",") // separar por coma
        .map((id) => Number(id.trim())) // limpiar espacios y convertir a número
        .filter((id) => !isNaN(id) && id > 0); // filtrar IDs no válidos


    if (form.checkValidity() && !isNaN(duration) ) {
        // Si no hay ejercicios, los dejamos vacíos
        const finalExercises = parsedExercises.length > 0 ? parsedExercises : [];
        try {
            await backend.routineService.createRoutine(
                name.trim(),
                finalExercises, 
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

        <div>
              <NavBar activePage={activePage} />
              <div className="flex flex-row h-screen">
                <SideMenu activePage={activePage} setActivePage={setActivePage} />
                <main className="flex-1 p-8">
                  {/* Área principal en la que va el contenido de la funcionalidad */}
        
                
                    <div className="flex flex-col mt-10 justify-center items-center">
                        
                        
                        <h2 className="text-white">Creación de Rutina</h2>
                        <form ref={node => form = node} className="needs-validation" noValidate onSubmit={handleSubmit}>
                                <TextInput
                                name="RoutineName"
                                label="Nombre:"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />

                                <TextInput
                                name="RoutineDuration"
                                label="Duración:"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                maxLength="3"
                                type="number"
                                />

                                <TextInput
                                name="RoutineExercises"
                                label="Ejercicios (IDs):"
                                value={exercises}
                                onChange={(e) => setExercises(e.target.value)}
                                maxLength="20"
                                />

                                <SendButton onClick={handleSubmit}></SendButton>
                        </form>    
                            {backendErrors && <div className="text-red-500 text-xs mt-2">{backendErrors.globalError}</div>}
                            {success && <div className="text-green-500 text-xs mt-2">Rutina {name} creada Existosamente</div>}

                    </div>      
                </main>
              </div>
            </div>
        

    );

}

export default CreateRoutine;
