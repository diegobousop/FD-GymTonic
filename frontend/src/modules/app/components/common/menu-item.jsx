import React from 'react'
import PropTypes from 'prop-types'
import { SVG_ICONS } from '../../../../config/constants'


const { HomeIcon } = SVG_ICONS

const MenuItem = ({ title, activePage, onClick, page, icon: Icon }) => {
    const [pressed, setPressed] = React.useState(false)

    return (
        <button
            onClick={onClick}
            type="button"
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            style={{ transform: pressed ? 'translateY(1px) scale(0.970)' : undefined }}
            className={`flex w-full items-center justify-start py-3 px-3 mt-5 relative transform transition-all duration-150
                            active:translate-y-[1px] active:scale-[0.970]  ${activePage(page || 'see-more') ? 'bg-[#241515]' : 'bg-transparent hover:bg-[#241515]'}`}
                        >
            {Icon ? (
                <Icon className={`absolute left-4 w-[30px] h-auto ${activePage(page || 'see-more') ? 'text-[#ff0000]' : 'text-white'}`} />
            ) : (
                <HomeIcon className={`absolute left-4 w-[30px] h-auto ${activePage(page || 'see-more') ? 'text-[#ff0000]' : 'text-white'}`} />
            )}
            <h1 className={`text-[16px] ml-[50px] ${activePage(page || 'see-more') ? 'text-[#ff0000]' : 'text-white'}`}>{title}</h1>
        </button>
    )
}

MenuItem.propTypes = {
    title: PropTypes.string.isRequired,
    activePage: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    page: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
}

export default MenuItem