const Pager = ({ back, next }) => (
  <nav aria-label="page navigation" className="mt-6">
    <ul className="flex justify-center space-x-4">
      <li>
        <button
          onClick={back.onClick}
          disabled={!back.enabled}
          className={`px-4 py-2 rounded ${
            back.enabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          Back
        </button>
      </li>

      <li>
        <button
          onClick={next.onClick}
          disabled={!next.enabled}
          className={`px-4 py-2 rounded ${
            next.enabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </li>
    </ul>
  </nav>
);

export default Pager;
