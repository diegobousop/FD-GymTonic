import React from 'react'
import { SVG_ICONS } from '../../../../config/constants'

const BubbleButton = ({ iconKey, icon: IconProp, size = 60, onClick, className = '' }) => {
  // Si te pasan la clave, busca el icono en el mapa; si te pasan el componente, úsalo directamente.
  const Icon = IconProp || (iconKey ? SVG_ICONS?.[iconKey] : null)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-full bg-[#262626] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={iconKey || 'bubble-button'}
    >
      {Icon
        ? (React.isValidElement(Icon)
            ? Icon
            : typeof Icon === 'function'
              ? <Icon className="w-16 h-16" />
              : typeof Icon === 'string'
                ? <span dangerouslySetInnerHTML={{ __html: Icon }} />
                : null)
        : null}
    </button>
  )
}

export default BubbleButton