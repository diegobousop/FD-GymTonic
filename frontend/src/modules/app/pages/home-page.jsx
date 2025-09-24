import React, { useState } from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link } from 'react-router-dom'


const HomePage = ({activePage}) => {

  const [currentPage, setCurrentPage] = useState(activePage || 'home')

  return (
    <div>

      <Link to="/routines/createRoutine" className='no-underline'>
                <div>   
                  <button className="px-14 py-8 text-white bg-black text-2xl">
                    <h1 className="text-[36px]">Crea tu rutina</h1>
                  </button>
                </div>
      </Link>
    </div>
  )
}

export default HomePage