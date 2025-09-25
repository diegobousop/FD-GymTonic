import React, { useState } from 'react'
import ViewAllRoutines from './viewAllRoutines-page'

const HomePage = ({activePage}) => {

  const [currentPage, setCurrentPage] = useState(activePage || 'home')

  return (
    <div>
      <ViewAllRoutines />
    </div>
  )
}

export default HomePage