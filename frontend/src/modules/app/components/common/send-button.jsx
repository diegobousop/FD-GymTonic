import React from 'react'
import { GENERAL_ICONS } from '../../../../config/constants'


const SendButton = ({ onClick, type, children }) => {
  const content = (
    <div className="flex flex-row relative w-[288px] px-[15px] py-[10px] bg-[#212121] items-center justify-start mt-10 border border-transparent hover:border hover:border-[#ff0000] group-active:bg-[#ff0000] transition-colors duration-150">
      <p className="text-white">{children || 'Enviar'}</p>
      <img src={GENERAL_ICONS.LEFT_ARROW} alt="Flecha" className="w-[15px] h-[12.5px] absolute right-5 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200" />
    </div>
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

export default SendButton