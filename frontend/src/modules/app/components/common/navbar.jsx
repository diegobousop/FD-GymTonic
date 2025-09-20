import React from 'react'

import SearchBar from './searchbar'

const Navbar = () => {


  return (
    <div className="flex flex-row items-center justify-start h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">

        <img
          src={process.env.PUBLIC_URL + "/assets/GymTonicLogo.png"}
          alt="logo"
          className="h-12 ml-4"
        />

        <div className="flex flex-row  ml-4 items-center w-full">

            <div className="flex flex-row grow w-full">
                <h1 className="text-white ml-10">Inicio</h1>
            </div>

            <div className="flex flex-row items-center justify-between gap-2 mr-2">
                <SearchBar />
                <img
                  src={process.env.PUBLIC_URL + "/assets/user1.png"}
                  alt="user1"
                  className=""
                />
            </div>

        </div>
        
    </div>
  )
}

export default Navbar