import React from 'react'
import { Link } from 'react-router-dom';

const LoginNavBar = () => {
  return (
    
    <div className="flex flex-row items-center justify-between h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">

        <img
          src={process.env.PUBLIC_URL + "/assets/GymTonicLogo.png"}
          alt="logo"
          className="h-12 ml-10"
        />
        
        <Link to="/login" className="mr-4">
            <div className="border-4 border-[#ff0000] px-[40px] py-[10px]">
                <h1 className="text-white font-bold text-2xl">ACCESO</h1>
            </div>
        </Link>

    </div>
  )
}

export default LoginNavBar