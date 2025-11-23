import React from 'react'
import PropTypes from 'prop-types'
import { svgIcons } from '../../../../config/constants'

const BubbleButton = ({ iconKey, icon: IconProp, ariaLabel, testId, size = 60, onClick, className = '' }) => {
  const Icon = IconProp || (iconKey ? svgIcons?.[iconKey] : null)

  const renderedIcon = (() => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) return Icon
    if (typeof Icon === 'function') return <Icon className="w-16 h-16" />
    if (typeof Icon === 'string') return <span dangerouslySetInnerHTML={{ __html: Icon }} />
    return null
  })()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-full bg-[#262626] flex items-center justify-center ${className} hover:bg-[#3a3a3a]`}
      style={{ width: size, height: size }}
      aria-label={ariaLabel || iconKey || 'bubble-button'}
      title={ariaLabel || iconKey || 'bubble-button'}
      data-testid={testId}
    >
      {renderedIcon}
    </button>
  )
}

BubbleButton.propTypes = {
  iconKey: PropTypes.string,
  icon: PropTypes.object,
  ariaLabel: PropTypes.string,
  testId: PropTypes.string,
  size: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string
}

export default BubbleButton