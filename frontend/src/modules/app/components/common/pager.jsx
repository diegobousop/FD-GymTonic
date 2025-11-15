import { svgIcons } from '../../../../config/constants'



const Pager = ({ back, next }) => (
  <nav aria-label="page navigation" className="mt-6">
    <ul className="flex justify-center space-x-4">
      <li>
        <button
          onClick={back.onClick}
          disabled={!back.enabled}
          className={`p-3 bg-[#262626] ${back.enabled ? 'hover:bg-[#3a3a3a]' : ''}`}
        >
          <svgIcons.BackIcon className={`w-[30px] h-auto ${back.enabled ? 'text-white' : 'text-gray-500'}`} />
        </button>
      </li>

      <li>
        <button
          onClick={next.onClick}
          disabled={!next.enabled}
          className={`p-3 bg-[#262626] ${next.enabled ? 'hover:bg-[#3a3a3a]' : ''}`}
        >
          <svgIcons.NextIcon className={`w-[30px] h-auto ${next.enabled ? 'text-white' : 'text-gray-500'}`} />
        </button>
      </li>
    </ul>
  </nav>
);

export default Pager;
