import React from 'react'

const SearchBar = () => {
  return (
    <div className="flex items-center  overflow-hidden ml-10 h-12 w-[500px]">
        <input type="text" placeholder="Buscar" 
        className="p-2 h-12 w-full bg-[#262626] text-gray-300 text-[12px] border-b  border-gray-600" />
    </div>
  )
}

export default SearchBar