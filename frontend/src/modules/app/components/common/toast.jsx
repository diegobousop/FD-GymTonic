import React, { useEffect, useState } from 'react'
import { svgIcons } from '../../../../config/constants'


const Toast = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onClose()
      }, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const toastConfig = {
    success: {
      icon: svgIcons.AcceptIcon,
      borderColor: '#ff0000',
    },
    declined: {
      icon: svgIcons.CancelIcon,
    },
    error: {
      icon: svgIcons.CancelIcon,
    },
    canceled: {
      icon: svgIcons.CancelIcon,
    }
  }

  const config = toastConfig[type] || toastConfig.error
  const Icon = config.icon

  return (
    <div className={`fixed bottom-5 right-5 bg-[#161616] text-white px-3 py-4 shadow-lg flex items-center gap-3 z-50 border-l-4 ${config.borderColor} ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
      <Icon className={`w-6 h-6 ${config.iconColor}`} />
      <p>{message}</p>
      <button onClick={handleClose} className="ml-2">
        <svgIcons.CancelIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast