import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/common/text-input'
import SendButton from '../components/common/send-button'

import { login } from '../../../backend/userService';
import { UserContext } from '../components/common/user-provider';

import { GENERAL_ICONS } from '../../../config/constants'


const imageUrl = 'https://ik.imagekit.io/940wz34p7/tioMazao.png?updatedAt=1758576677345'

const LoginPage = () => {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [userNameErrors, setUserNameErrors] = useState(null)
  const [passwordErrors, setPasswordErrors] = useState(null)




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

    if (isLoading) return; 
    if (!username) {
      setUserNameErrors('El nombre de usuario es obligatorio')
      
    }
    if (!password) {
      setPasswordErrors('La contraseña es obligatoria')
    }
    if (!username || !password) return;

    setIsLoading(true)
    try {
      await login(
        username,
        password,
        (authenticatedUser) => {
          const userToSet = {
            ...authenticatedUser?.user,
            avatar: authenticatedUser?.user?.avatar || 'https://ik.imagekit.io/940wz34p7/1.png?updatedAt=1758552818447'
          };
          setUser(userToSet);
          localStorage.setItem("user", JSON.stringify(userToSet));
          
          window.location.href = "/gym-tonic/#/home";
        },
        (err) => {
          setUserNameErrors('\u00A0')
          setPasswordErrors(err.globalError || 'Error en autenticación')
          setIsLoading(false)

        }
      )
    } catch (ex) {
      setErrors(ex.message || 'Error inesperado')
      setIsLoading(false)
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
              errors={userNameErrors}
              errorMessage={userNameErrors}
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

            <SendButton type="submit" isLoading={isLoading} />
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage