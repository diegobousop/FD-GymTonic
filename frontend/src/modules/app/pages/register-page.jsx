import React, { useContext } from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/common/text-input'
import SendButton from '../components/common/send-button'
import MultiSelectList from '../components/common/multi-select-list';
import FileInput from '../components/common/file-input';

import { signUp, getGenders } from '../../../backend/userService';
import { UserContext } from '../components/common/user-provider';

import backend from '../../../backend';


const RegisterPage = () => {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [role, setRole] = React.useState(null)
  const [file, setFile] = React.useState(null)
  const [image, setImage] = React.useState([]);
  const [logo, setLogo] = React.useState(null);
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [genderOptions, setGenderOptions] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(false)

  const [userNameErrors, setUserNameErrors] = React.useState(null)
  const [passwordErrors, setPasswordErrors] = React.useState(null)
  const [firstNameErrors, setFirstNameErrors] = React.useState(null)
  const [lastNameErrors, setLastNameErrors] = React.useState(null)
  const [emailErrors, setEmailErrors] = React.useState(null)
  const [confirmPasswordErrors, setConfirmPasswordErrors] = React.useState(null)
  const [roleErrors, setRoleErrors] = React.useState(null)
  const [fileErrors, setFileErrors] = React.useState(null)
  const [heightErrors, setHeightErrors] = React.useState(null)
  const [weightErrors, setWeightErrors] = React.useState(null)
  const [birthDateErrors, setBirthDateErrors] = React.useState(null)
  const [genderErrors, setGenderErrors] = React.useState(null)
  const [globalError, setGlobalError] = React.useState(null)

    useEffect(() => {
      const fetchImages = async () => { 
        backend.imageService.getImageByName('running',
          (response) => {
            setImage(response);
          }, 
          (error) => {
            console.error(error);
          });
  
          backend.imageService.getImageByName('logo',
          (response) => {
            setLogo(response);
          }, 
          (error) => {
            console.error(error);
          });
      }
      fetchImages();
    },[])

    
    useEffect(() => {
      const fetchGenders = async () => {
          setIsLoading(true);
          getGenders((data) => {
            const options = data.map(gender => ({ 
              id: gender, 
              name: translateGender(gender) 
              }));
          setGenderOptions(options);
          setIsLoading(false);
            }, () => {
            setIsLoading(false);
          });
        };
      fetchGenders();
    }, []);

    
    // Función para traducir géneros al español
    const translateGender = (gender) => {
      const translations = {
        'MALE': 'Masculino',
        'FEMALE': 'Femenino',
        'OTHER': 'Otro'
      };
      return translations[gender] || gender;
    };

    // Función para convertir fecha de yyyy-MM-dd a dd-MM-yyyy
    const formatDateForBackend = (dateString) => {
      if (!dateString) return '';
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateString;
    };
    
      const handleRegister = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        const isValid = checkErrors();
        if (!isValid) return; 

        const user = {
          userName: username,
          password,
          firstName,
          lastName,
          email,
          role,
          height: height ? parseFloat(height) : 0,
          weight: weight ? parseFloat(weight) : 0,
          birthDate: birthDate ? formatDateForBackend(birthDate) : '',
          gender: gender || ''
        }
        setIsLoading(true)
        try {
          await signUp(
            user,
            (authenticatedUser) => {
              // Set user in context
              const userToSet = {
                ...authenticatedUser.user,
              };
              setUser(userToSet);
              localStorage.setItem("user", JSON.stringify(userToSet));
              
              window.location.href = '/gym-tonic/#/home'
            },
            (err) => {
              setUserNameErrors(err.globalError || 'Error al registrarse')
              setIsLoading(false)
            }
          )
        } catch (ex) {
          setGlobalError(ex || 'Error inesperado')
          setIsLoading(false)
        }
      }


  return (
    <div >
        <div className="flex flex-row items-center justify-between h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
          <Link to="/start" className="mr-4"> 
            <img
              src={logo?.base64}
              alt="logo"
              className="h-12 ml-20"
            />
          </Link>

          <Link to="/login" className="mr-14">
                  <div className="border-4 border-[#ff0000] px-[40px] py-[10px]">
                      <h1 className="text-white font-bold text-2xl">ACCESO</h1>
                  </div>
          </Link>
    
        </div>

   
      <div className="flex flex-row">
        <img src={image?.base64} alt="Imagen" className="w-[37%]" />
        <div className="ml-[5%] mt-[3%] mb-10">
          <form onSubmit={handleRegister}>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 w-[680px]">
              {/* Sección: Credenciales */}
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-white border-b border-red-600 pb-2 mb-4">
                  📝 Información de Cuenta
                </h2>
              </div>
              
              <TextInput 
                name="username" 
                label="Nombre de usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                errors={userNameErrors} 
                errorMessage={userNameErrors} 
              />
              <TextInput 
                name="email" 
                label="Correo electrónico" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                errors={emailErrors} 
                errorMessage={emailErrors} 
              />

              <TextInput 
                name="password" 
                label="Contraseña" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}  
                errors={passwordErrors} 
                errorMessage={passwordErrors} 
              />
              <TextInput 
                name="confirmPassword" 
                label="Confirmar contraseña" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                errors={confirmPasswordErrors} 
                errorMessage={confirmPasswordErrors} 
              />

              {/* Sección: Datos Personales */}
              <div className="col-span-2 mt-4">
                <h2 className="text-xl font-semibold text-white border-b border-red-600 pb-2 mb-4">
                  👤 Datos Personales
                </h2>
              </div>

              <TextInput 
                name="firstName" 
                label="Nombre" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                errors={firstNameErrors} 
                errorMessage={firstNameErrors} 
              />
              <TextInput 
                name="lastName" 
                label="Apellidos" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}  
                errors={lastNameErrors} 
                errorMessage={lastNameErrors} 
              />

              <TextInput 
                name="height" 
                label="Altura (cm)" 
                type="number"
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                errors={heightErrors} 
                errorMessage={heightErrors}
              />
              <TextInput 
                name="weight" 
                label="Peso (kg)" 
                type="number"
                step="0.1"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                errors={weightErrors} 
                errorMessage={weightErrors}
              />

              <TextInput 
                name="birthDate" 
                label="Fecha de nacimiento" 
                type="date"
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                errors={birthDateErrors} 
                errorMessage={birthDateErrors}
              />

              <MultiSelectList 
                options={genderOptions} 
                selected={gender ? [gender] : []}
                onChange={(selected) => {setGender(selected[0] || '')}}
                label="Género"
                required={true}
                errors={genderErrors}
                errorMessage={genderErrors}
              />

              {/* Sección: Rol y Certificación */}
              <div className="col-span-2 mt-4">
                <h2 className="text-xl font-semibold text-white border-b border-red-600 pb-2 mb-4">
                  🏋️ Rol en la Plataforma
                </h2>
              </div>

              <MultiSelectList 
                options={[{id:"TRAINER", name:"TRAINER"},{id:"USER", name:"USER"}]} 
                selected={role !== null ? [role] : []}
                onChange={(selected) => {setRole(selected[0] || null)}}
                label="Rol"
                required={true}
                errors={roleErrors}
                errorMessage={roleErrors}
              />
              {role === "TRAINER" && (
                <FileInput
                  label="Diploma o certificación"
                  errors={fileErrors}
                  errorMessage={fileErrors}
                  onChange={setFile}
                />
              )}
              
              <div className="col-span-2 mt-6 flex auto justify-center w-full">
                <SendButton onClick={handleRegister} isLoading={isLoading}>
                </SendButton>
              </div>
              
              {globalError && <p className="col-span-2 mt-1 text-sm text-red-500">{globalError}</p>}
            
            </div>
          </form>
        </div>
      </div>
    </div>
  )


  function checkErrors() {
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    let hasError = false

    
    const isEmailValid = (value) => {
      return /^\S+@\S+\.\S+$/.test(value)
    }
    const hasDigits = (value) => /\d/.test(value)

    const usernameErr = !trimmedUsername ? 'El nombre de usuario es obligatorio' : (trimmedUsername.length < 3 ? 'El nombre de usuario debe tener al menos 3 caracteres' : null)
    const emailErr = !trimmedEmail ? 'El correo electrónico es obligatorio' : (!isEmailValid(trimmedEmail) ? 'Introduce un correo electrónico válido' : null)
    const passwordErr = !password ? 'La contraseña es obligatoria' : (password.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null)
    const confirmPwdErr = (!password && !confirmPassword) ? '\u00A0' : (password !== confirmPassword ? 'Las contraseñas no coinciden' : null)
    const firstNameErr = !trimmedFirstName ? 'El nombre es obligatorio' : (hasDigits(trimmedFirstName) ? 'El nombre no puede contener números' : null)
    const lastNameErr = !trimmedLastName ? 'Los apellidos son obligatorios' : (hasDigits(trimmedLastName) ? 'Los apellidos no pueden contener números' : null)
    const roleErr = !role ? 'El rol es obligatorio' : null
    const fileErr = (role === "TRAINER" && !file) ? 'El Diploma/Certificación es obligatorio' : null
    let weightErr = !weight ? 'El peso es obligatorio' : (isNaN(weight) ? 'El peso debe ser un número' : null)
    let heightErr = !height ? 'La altura es obligatoria' : (isNaN(height) ? 'La altura debe ser un número' : null)
    let birthDateErr = !birthDate ? 'La fecha de nacimiento es obligatoria' : (!isValidDate(birthDate) ? 'La fecha no es válida' : null)
    const genderErr = !gender ? 'El género es obligatorio' : null


    if (height) {
      heightErr = isNaN(height) ? 'La altura debe ser un número' : (height < 0 ? 'La altura no puede ser negativa' : null)
    }
    if (weight) {
      weightErr = isNaN(weight) ? 'El peso debe ser un número' : (weight < 0 ? 'El peso no puede ser negativo' : null)
    }

    if (usernameErr || emailErr || passwordErr || confirmPwdErr || firstNameErr || lastNameErr || roleErr || fileErr || heightErr || weightErr || birthDateErr || genderErr) {
      hasError = true
    }

    // update states once
    setUserNameErrors(usernameErr)
    setEmailErrors(emailErr)
    setPasswordErrors(passwordErr || (password !== confirmPassword ? '\u00A0' : null))
    setConfirmPasswordErrors(confirmPwdErr)
    setFirstNameErrors(firstNameErr)
    setLastNameErrors(lastNameErr)
    setRoleErrors(roleErr)
    setFileErrors(fileErr)
    setHeightErrors(heightErr)
    setWeightErrors(weightErr)
    setBirthDateErrors(birthDateErr)
    setGenderErrors(genderErr)

    return !hasError
  }

    // Función para validar fecha
    function isValidDate(dateString){
      if (!dateString) return false;
      
      // Verificar formato yyyy-MM-dd
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateString)) return false;
      
      const date = new Date(dateString);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) return false;
      
      // Verificar que no sea una fecha futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) return false;
      
      // Verificar que la persona tenga al menos 13 años
      const minAge = 13;
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - minAge);
      if (date > minDate) return false;
      
      // Verificar que la persona no tenga más de 120 años
      const maxAge = 120;
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - maxAge);
      if (date < maxDate) return false;
      
      return true;
    };


}
export default RegisterPage