import React from 'react'

import { svgIcons } from '../../../../config/constants'    


const LogoutButton = ({ onClick, type, children, isLoading = false, className = '' }) => {
  const content = (
    <>
      {!isLoading ? (
        <div className={`flex flex-row relative w-[288px] h-[48px] px-[15px] py-[10px] bg-[#400000] items-center
         justify-start mt-8 border border-transparent hover:border hover:border-[#ff0000] group-active:bg-[#ff0000] transition-colors duration-150 ${className}`}>
          <p className="text-white">Cerrar sesión</p>
          <svgIcons.LogoutIcon className="w-6 h-6 text-white absolute right-4" />
        </div>
      ) : (
        <div className="flex flex-row w-[288px] h-[48px] px-[15px] py-[10px] bg-[#212121] items-center justify-center mt-8 border border-transparent hover:border hover:border-[#ff0000] group-active:bg-[#ff0000] transition-colors duration-150 ">
          <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin " />
        </div>
      )}
    </>
  )

  if (type) {
    return (
      <button type={type} onClick={onClick} className="p-0 m-0 bg-transparent border-0 group">
        {content}
      </button>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="p-0 m-0 bg-transparent border-0 group">
        {content}
      </button>
    )
  }

  return (
    <a href="/home" className="group inline-block">
      {content}
    </a>
  )
}

export default LogoutButton