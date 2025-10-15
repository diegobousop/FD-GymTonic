import React from 'react'

const Spinner = () => {
  return (
    <div className="flex w-full h-[500px] items-center justify-center ">
          <span className="w-12 h-12 border-8 border-[#ff0000] border-t-transparent rounded-full animate-spin " />
    </div>
  )
}

export default Spinner