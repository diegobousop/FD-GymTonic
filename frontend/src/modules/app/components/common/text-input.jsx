import React, { useState, useEffect } from 'react'
import { GENERAL_ICONS } from '../../../../config/constants'


const TextInput = ({
  label = 'Nombre de Usuario',
  maxLength = 100,
  initialValue = '',
  type = 'text',
  value: controlledValue,
  onChange,
  name,
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
        <p className="m-0">{label}</p>
        {type !== 'password' && <span>{(value || '').length}/{maxLength}</span>}
      </div>

      <div className="relative">
        <input
          name={name}
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          maxLength={maxLength}
          className="bg-[#262626] w-full h-[48px] text-[#f4f4f4] text-xs px-4 pr-10 focus:outline-none border-b focus:border focus:border-[#ff0000]"
        />

        {type === 'password' && (
          <img
            src={showPassword ? GENERAL_ICONS.WATCH_PASSWORD_OPEN : GENERAL_ICONS.WATCH_PASSWORD_CLOSED}
            alt={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className={
              `absolute right-5 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-500 ` +
              (showPassword
                ? 'w-[15px] h-[11px] '
                : 'w-[15px] h-[15px]')
            }
            onClick={() => setShowPassword(!showPassword)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword) }}
            role="button"
            tabIndex={0}
          />
        )}
      </div>
    </div>
  )
}

export default TextInput