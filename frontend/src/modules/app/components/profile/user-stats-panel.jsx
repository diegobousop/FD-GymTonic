import React from 'react'
import UserStatsPentagrams from './user-stats-pentagrams'
import MyProfileTabSelector from './my-profile-tab-selector'

const UserStatsPanel = () => {
  return (
    <div className="flex flex-col">
        <MyProfileTabSelector/>
        <UserStatsPentagrams/>
    </div>
  )
}

export default UserStatsPanel