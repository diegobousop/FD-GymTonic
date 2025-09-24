import React, { useState } from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link } from 'react-router-dom'


const HomePage = () => {
 
  const [activePage, setActivePage] = useState('home')

  return (
    <div>
      <NavBar activePage={activePage} />
      <div className="flex flex-row h-screen">
        <SideMenu activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 p-8">
          {/* Área principal en la que va el contenido de la funcionalidad */}


          <Link to="/routines/createRoutine" className='no-underline'>
                <div>
                  <button className="px-14 py-8 text-white bg-black text-2xl">
                    <h1 className="text-[36px]">Crea tu rutina</h1>
                  </button>
                </div>
          </Link>
          

        </main>
      </div>
    </div>
  )
}

export default HomePage