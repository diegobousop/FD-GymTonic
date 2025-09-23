import React from 'react'
import { GENERAL_ICONS } from '../../../../config/constants'

// Accept an optional onClick. If provided, render a button that calls it. Otherwise keep link behavior.
const SendButton = ({ onClick }) => {
  const content = (
    <div className="flex flex-row  relative w-[288px] px-[15px] py-[10px] bg-[#212121] items-center justify-start mt-10  border border-transparent hover:border hover:border-[#ff0000] ">
      <p className="text-white">Enviar</p>
      <img src={GENERAL_ICONS.LEFT_ARROW} alt="Flecha" className="w-[15px] h-[12.5px] absolute right-5 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200" />
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="p-0 m-0 bg-transparent border-0">
        {content}
      </button>
    )
  }

  return (
    <a href="/home" className="">
      {content}
    </a>
  )
}

export default SendButton