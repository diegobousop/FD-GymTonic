import React from 'react'

import SearchBar from './searchbar'

import { GENERAL_ICONS } from '../../../../config/constants'


const Navbar = () => {


  return (
    <div className="flex flex-row items-center justify-start h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">

        <img
          src={GENERAL_ICONS.APP_LOGO}
          alt="logo"
          className="h-12 ml-4"
        />

        <div className="flex flex-row  ml-4 items-center w-full">

            <div className="flex flex-row grow w-full">
                <h1 className="text-white ml-10">Inicio</h1>
            </div>

            <div className="flex flex-row items-center justify-between gap-2 mr-2">
                <SearchBar />
                <img src={GENERAL_ICONS.DEFAULT_AVATAR} alt="user avatar" className="h-[48px] w-[48px]" />
            </div>

        </div>
        
    </div>
  )
}

export default Navbar