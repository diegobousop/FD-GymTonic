import React from 'react'
import NavBar from '../components/common/navbar'

import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <NavBar />
      HomePage
              <Link to="/routines/createRoutine" className='no-underline'>
                <div>
                  <button className="px-14 py-8 text-white bg-black text-2xl"><h1 className="text-[36px]">Crea tu rutina</h1></button>
                </div>
              </Link>
    </div>
  )
}

export default HomePage