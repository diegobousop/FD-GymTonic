import React, { useEffect } from 'react'

import SearchBar from './searchbar'

import { GENERAL_ICONS } from '../../../../config/constants'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const PAGE_TITLES = {
  home: 'Inicio',
  profile: 'Perfil'
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const Navbar = ({activePage}) => {

  useEffect(() => {
    console.log('Navbar activePage:', activePage)
  }, [activePage])

  const title = PAGE_TITLES[activePage] || capitalize(activePage) || 'Inicio'

  return (
    <div className="flex flex-row items-center justify-start h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
        <Link to="/home">
          <img
            src={GENERAL_ICONS.APP_LOGO}
            alt="logo"
            className="h-12 ml-14"
          />
        </Link>


        <div className="flex flex-row  ml-4 items-center w-full">

            <div className="flex flex-row grow w-full">
                <h1 className="text-white ml-24">{title}</h1>
            </div>

            <div className="flex flex-row items-center justify-between gap-4 mr-2">
                <SearchBar />
                <Link to="/profile">
                    <img src={GENERAL_ICONS.DEFAULT_AVATAR} alt="user avatar" className=" w-[52px] h-auto" />
                </Link>
            </div>

        </div>
        
    </div>
  )
}

Navbar.propTypes = {
  activePage: PropTypes.string
}

export default Navbar