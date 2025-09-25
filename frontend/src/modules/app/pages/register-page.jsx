import React, { useContext } from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/common/text-input'
import SendButton from '../components/common/send-button'

import { signUp } from '../../../backend/userService';
import { UserContext } from '../components/common/user-provider';

import { GENERAL_ICONS } from '../../../config/constants'

const imageUrl = 'https://ik.imagekit.io/940wz34p7/tioRunning-background.png?updatedAt=1758618074898'


const RegisterPage = () => {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [errors, setErrors] = React.useState(null)



    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevOverscroll = document.body.style.overscrollBehavior;
    
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
    
        return () => {
          document.body.style.overflow = prevOverflow;
          document.body.style.overscrollBehavior = prevOverscroll;
        };
      }, []);
    
    
      const handleRegister = async (e) => {
        e.preventDefault();
        setErrors(null)

        if (password !== confirmPassword) {
          setErrors('Las contraseñas no coinciden')
          return
        }

        const user = {
          userName: username,
          password,
          firstName,
          lastName,
          email,
          role: 0,
          avatar: 'fff'
        }

        try {
          await signUp(
            user,
            (authenticatedUser) => {
              // Set user in context
              const userToSet = {
                ...authenticatedUser?.user,
                avatar: authenticatedUser?.user?.avatar || 'https://ik.imagekit.io/940wz34p7/1.png?updatedAt=1758552818447'
              };
              setUser(userToSet);
              localStorage.setItem("user", JSON.stringify(userToSet));
              
              window.location.href = '/gym-tonic/#/home'
            },
            (err) => setErrors(err || 'Error al registrarse')
          )
        } catch (ex) {
          setErrors(ex || 'Error inesperado')
        }
      }


  return (
    <div >
        <div className="flex flex-row items-center justify-between h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
          <Link to="/start" className="mr-4"> 
            <img
              src={GENERAL_ICONS.APP_LOGO}
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
        <img src={imageUrl} alt="Imagen" className="w-[37%]" />
        <div className="ml-[5%] mt-[4%]">
          <h1 className="mb-10">Bienvenido/a a Gym Tonic</h1>
          <form onSubmit={handleRegister}>

            <div className="grid grid-cols-2 gap-4 w-[620px]">
                <TextInput name="username" label="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextInput name="email" label="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                
                <TextInput name="password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextInput name="confirmPassword" label="Confirmar contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <TextInput name="firstName" label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <TextInput name="lastName" label="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} />


              <div className="col-span-1 mt-4">
                <SendButton onClick={handleRegister} />
              </div>
              
              <div className="col-span-1" />
            </div>
             {errors && <div className="text-red-500 text-xs mt-2">{errors.globalError}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage