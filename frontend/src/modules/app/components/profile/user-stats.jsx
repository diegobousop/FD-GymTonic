import React from 'react'

const fmt = (n) => new Intl.NumberFormat('es-ES').format(Number(n ?? 0))

const UserStats = ({ user, last4WeeksCount, yearTrainingsCount, forbidden = false }) => {

  if (forbidden) {
    return null
  }


  return (
    <div className="border-t border-t-[#990000] mt-6 pt-4 px-5">
      <p className="text-white text-[25px] mb-3">Mis estadísticas</p>

      <dl className="w-full border border-[#333] rounded divide-y divide-[#333]">
        <div className="grid grid-cols-[70%_30%]">
          <dt className="text-[14px] text-white truncate px-3 py-2 bg-[#1a1a1a]">
            Entrenamientos este mes
          </dt>
          <dd className="text-[14px] text-white text-right font-semibold px-3 py-2 bg-[#262626]">
            {fmt(last4WeeksCount)}
          </dd>
        </div>
        <div className="grid grid-cols-[70%_30%]">
          <dt className="text-[14px] text-white truncate px-3 py-2 bg-[#1a1a1a]">
            Entrenamientos este año
          </dt>
          <dd className="text-[14px] text-white text-right font-semibold px-3 py-2 bg-[#262626]">
            {fmt(yearTrainingsCount)}
          </dd>
        </div>
      </dl>
    </div>
  )
}



export default UserStats