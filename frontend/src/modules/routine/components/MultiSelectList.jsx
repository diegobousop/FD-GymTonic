import React, { useState } from "react";

const MultiChecklist = ({ options, selected, onChange, label }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(sid => sid !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="font-semibold mb-2 text-white"
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      {open && (
        <ul className="bg-gray-800 rounded p-4">
          {options.map(opt => (
            <li key={opt.id} className="flex items-center mb-2 last:mb-0">
              <input
                type="checkbox"
                id={`check-${opt.id}`}
                checked={selected.includes(opt.id)}
                onChange={() => handleToggle(opt.id)}
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
      )}
    </div>
  );
};

export default MultiChecklist;