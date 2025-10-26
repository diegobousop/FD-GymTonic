import { SVG_ICONS } from '../../../../config/constants'



const MiniPager = ({ back, next }) => (
  <nav aria-label="page navigation" className="">
    <ul className="flex justify-center space-x-4">
      <li>
        <button
          onClick={back.onClick}
          disabled={!back.enabled}
          className={`p-3 bg-[#262626] ${back.enabled ? 'hover:bg-[#3a3a3a]' : ''}`}
        >
          <SVG_ICONS.BackIcon className={`w-[10px] h-auto ${back.enabled ? 'text-white' : 'text-gray-500'}`} />
        </button>
      </li>

      <li>
        <button
          onClick={next.onClick}
          disabled={!next.enabled}
          className={`p-3 bg-[#262626] ${next.enabled ? 'hover:bg-[#3a3a3a]' : ''}`}
        >
          <SVG_ICONS.NextIcon className={`w-[10px] h-auto ${next.enabled ? 'text-white' : 'text-gray-500'}`} />
        </button>
      </li>
    </ul>
  </nav>
);

export default MiniPager;
