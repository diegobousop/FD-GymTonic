import React from 'react'
import PropTypes from 'prop-types'

const Spinner = ({size = 500}) => {
  return (
    <div className={`flex w-full h-[${size}px] items-center justify-center `}>
          <span className="w-12 h-12 border-8 border-[#ff0000] border-t-transparent rounded-full animate-spin " />
    </div>
  )
}

Spinner.propTypes = {
  size: PropTypes.number,
};

export default Spinner