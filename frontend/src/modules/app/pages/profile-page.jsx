import React, { useState } from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link } from 'react-router-dom'


const ProfilePage = () => {

  const [activePage, setActivePage] = useState('profile')

  return (
    <div>
      <NavBar activePage={activePage}  />
      <div className="flex flex-row h-screen">

        <SideMenu activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 p-8">
          {/* Área principal que puede cambiar según activePage */}
          {activePage === 'home' && (
            <div>
              <Link to="/routines/createRoutine" className='no-underline'>
                <div>
                  <button className="px-14 py-8 text-white bg-black text-2xl">
                    <h1 className="text-[36px]">Crea tu rutina</h1>
                  </button>
                </div>
              </Link>
            </div>
          )}

          {activePage === 'profile' && (
            <div>
              <h2 className="text-2xl text-white">Perfil de usuario (contenido de ejemplo)</h2>
            </div>
          )}

        </main>

      </div>

    </div>
  )
}

export default ProfilePage