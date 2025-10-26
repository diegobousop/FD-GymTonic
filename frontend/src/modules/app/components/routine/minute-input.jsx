import React, { useState, useEffect } from 'react'
import { GENERAL_ICONS } from '../../../../config/constants'


const MinuteInput = ({
  label = 'Duración',
  placeholder,
  maxLength = 100,
  initialValue = '',
  type = 'text',
  value: controlledValue,
  onChange,
  name,
  errors,
  errorMessage = '',
}) => {
  const [internalValue, setInternalValue] = useState(initialValue)
  const [showPassword, setShowPassword] = useState(false)


  const value = typeof controlledValue !== 'undefined' ? controlledValue : internalValue

  useEffect(() => {
    setInternalValue(initialValue)
  }, [initialValue])

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

  const handleChange = (e) => {
    const v = e.target.value.slice(0, maxLength)
    if (onChange) onChange(e)
    else setInternalValue(v)
  }

  return (
    <div className="mt-5 w-[288px]">
      <div className="flex items-center justify-between mb-1 text-xs text-[#c6c6c6]">
        <label htmlFor={name} className="m-0">{label}</label>
      </div>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={
            "bg-[#262626] w-full h-[48px] text-[#f4f4f4] text-xs px-4 pr-20 focus:outline-none border-b mb-2 " +
            (errors ? 'border border-[#ff0000] focus:border-[#ff0000]' : 'border-transparent focus:border focus:border-[#ff0000]')
          }
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6c6c6] text-xs pointer-events-none">
          minutos
        </span>
      </div>
      <div className="flex items-center justify-between mb-1 text-xs text-[#c6c6c6]">
        <p className={`text-[#ff0000] ${!errorMessage ? 'invisible' : ''}`}>
          {errorMessage || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

export default MinuteInput