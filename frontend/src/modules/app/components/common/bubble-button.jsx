import React from 'react'
import { SVG_ICONS } from '../../../../config/constants'

const BubbleButton = ({ iconKey, icon: IconProp, ariaLabel, testId, size = 60, onClick, className = '' }) => {
  const Icon = IconProp || (iconKey ? SVG_ICONS?.[iconKey] : null)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-full bg-[#262626] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={ariaLabel || iconKey || 'bubble-button'}
      title={ariaLabel || iconKey || 'bubble-button'}
      data-testid={testId}
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