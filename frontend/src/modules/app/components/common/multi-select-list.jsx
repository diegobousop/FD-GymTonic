import React, { useState } from "react";
import PropTypes from 'prop-types'


const MultiChecklist = ({ options, selected, onChange, label, page=0, 
  setPage, existMoreItems=false, errors, errorMessage='', required=false }) => {
  const [open, setOpen] = useState(true);

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(sid => sid !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  

  return (
    <div className="flex flex-col gap-2 mt-3">
      <button
        type="button"
        className="text-xs text-start"
        onClick={() => setOpen(!open)}
      >
        <p>{label}</p>
      </button>
      {open && (
        <div>
          <ul className="bg-[#262626] rounded p-4 flex flex-col max-h-60 overflow-y-auto">
            {options.map(opt => (
              <li key={opt.id} className="flex items-center mb-2 last:mb-0">
                <input
                  type="checkbox"
                  id={`check-${opt.id}`}
                  checked={selected.includes(opt.id)}
                  onChange={() => {
                    handleToggle(opt.id);
                  }}
                  className="mr-2 accent-red-600"
                />
                <label
                  htmlFor={`check-${opt.id}`}
                  className={`cursor-pointer text-white ${selected.includes(opt.id) ? "font-bold" : ""}`}
                >
                  {opt.name}
                </label>
              </li>
            ))}
          </ul>

          {setPage && (
            <div className="flex justify-between mt-2">
              <button
                type="button"
                className="text-white px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Anterior
              </button>
              <button
                type="button"
                className="text-white px-2 py-1 rounded bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={!existMoreItems}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
      {errors && (
        <div className="text-red-500 text-sm mt-2">{errorMessage || "Debes seleccionar al menos un elemento."}</div>
      )}
    </div>
  );
};

MultiChecklist.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  selected: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  page: PropTypes.number,
  setPage: PropTypes.func,
  existMoreItems: PropTypes.bool,
  errors: PropTypes.bool,
  errorMessage: PropTypes.string,
  required: PropTypes.bool,
};

export default MultiChecklist;