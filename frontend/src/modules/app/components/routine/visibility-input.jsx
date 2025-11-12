import React, { useState, useEffect } from 'react'

import { SVG_ICONS } from '../../../../config/constants'


const VisibilityInput = ({
  label = 'Visibilidad',
  initialValue = 0,
  value: controlledValue,
  onChange,
  name,
  errors,
  errorMessage = '',
}) => {
  const [internalValue, setInternalValue] = useState(initialValue)

  const value = typeof controlledValue !== 'undefined' ? controlledValue : internalValue

  useEffect(() => {
    setInternalValue(initialValue)
  }, [initialValue])

  const handleChange = (e) => {
    const v = e.target.value === "true";
    if (onChange) {
      e.target.value = v
      onChange(e)
    } else {
      setInternalValue(v)
    }
  }

  return (
    <div className="mt-5 w-[288px]">
      <div className="flex items-center justify-between mb-1 text-xs text-[#c6c6c6]">
        <label htmlFor={name} className="m-0">{label}</label>
      </div>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className={
            "bg-[#262626] w-full h-[48px] text-[#f4f4f4] text-xs px-4 pr-10 focus:outline-none border-b mb-2 cursor-pointer appearance-none " +
            (errors ? 'border border-[#ff0000] focus:border-[#ff0000]' : 'border-transparent focus:border focus:border-[#ff0000]')
          }
        >
          <option value={true} className="bg-[#262626] text-[#f4f4f4] py-3">Público</option>
          <option value={false} className="bg-[#262626] text-[#f4f4f4] py-3">Privado</option>
        </select>

        <SVG_ICONS.DownIcon 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none text-white"
        />
      </div>
      <div className="flex items-center justify-between mb-1 text-xs text-[#c6c6c6]">
        <p className={`text-[#ff0000] ${!errorMessage ? 'invisible' : ''}`}>
          {errorMessage || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

export default VisibilityInput