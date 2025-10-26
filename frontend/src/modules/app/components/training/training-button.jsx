import React from 'react'
import { GENERAL_ICONS } from '../../../../config/constants'


const TrainingButton = ({ onClick, type, children, isLoading = false }) => {
  const content = (
    <>
      {!isLoading ? (
        <div className="flex flex-row relative w-[288px] h-[48px] px-[15px] py-[10px] bg-[#212121] items-center
         justify-start mt-1 border border-transparent hover:border hover:border-[#ff0000] group-active:bg-[#ff0000] transition-colors duration-150 ">
          <p className="text-white">Crear</p>
          <img src={GENERAL_ICONS.LEFT_ARROW} alt="Flecha" className="w-[15px] h-[12.5px] absolute right-5 top-1/2 transform
           -translate-y-1/2 cursor-pointer transition-all duration-200" />
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

export default TrainingButton