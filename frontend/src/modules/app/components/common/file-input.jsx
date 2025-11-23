import  { useState } from 'react';
import PropTypes from 'prop-types';

const FileInput = ({
    label,
    onChange,
    name,
    errors,
    errorMessage = '',
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (onChange) {
            onChange(file);
        }
    };
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-[#f4f4f4]">{label}</label>
            <input
                type="file"
                name={name}
                onChange={handleFileChange}
                className={
                    "bg-[#262626] w-full h-[48px] text-[#f4f4f4] text-xs px-4 pr-10 focus:outline-none border-b mb-2 " +
                    (errors ? 'border border-[#ff0000] focus:border-[#ff0000]' : 'border-transparent focus:border focus:border-[#ff0000]')
                }
            />
            {errors && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
        </div>
    )
}

FileInput.propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    name: PropTypes.string,
    errors: PropTypes.bool,
    errorMessage: PropTypes.string,
};

export default FileInput;