import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/common/text-input'
import SendButton from '../components/common/send-button'

import { login } from '../../../backend/userService';

import { GENERAL_ICONS } from '../../../config/constants'


const imageUrl = 'https://ik.imagekit.io/940wz34p7/tioMazao.png?updatedAt=1758576677345'

const LoginPage = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
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


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(null)
    try {
      await login(
        username,
        password,
        (user) => {
          window.location.href = "/gym-tonic/#/home";
        },
        (err) => {
          setErrors(err || 'Error en autenticación')
        }
      )
    } catch (ex) {
      setErrors(ex.message || 'Error inesperado')
    }

  }

  return (
    <div >
        <div className="flex flex-row items-center justify-between h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
          <Link to="/start"> 
            <img
              src={GENERAL_ICONS.APP_LOGO}
              alt="logo"
              className="h-12 ml-20"
            />
          </Link>

          <Link to="/register" className="mr-14">
                  <div className="border-4 border-[#ff0000] px-[40px] py-[10px]">
                      <h1 className="text-white font-bold text-2xl">REGISTRARSE</h1>
                  </div>
          </Link>
    
        </div>
      <div className="flex flex-row">
        <img src={imageUrl} alt="Imagen" className="w-[37%]" />
        <div className="ml-[5%] mt-[8%]">
          <h1 className="mb-10">Bienvenido/a de vuelta!</h1>
          <form onSubmit={handleLogin}>
            <TextInput
              name="username"
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextInput
              name="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errors && <div className="text-red-500 text-xs mt-2">{errors.globalError}</div>}

            <SendButton type="submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage