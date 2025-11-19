import React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import FileInput from '../../../modules/app/components/common/file-input';

describe('FileInput', () => {
  it('renderiza etiqueta e input', () => {
    const { container } = render(
      <FileInput label="Upload" name="myFile" onChange={jest.fn()} />
    );

    expect(screen.getByText('Upload')).toBeInTheDocument();
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('llama onChange con archivo seleccionado', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <FileInput label="Select file" name="file" onChange={handleChange} />
    );

    const input = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it('muestra mensaje de error cuando prop errors es true', () => {
    render(
      <FileInput
        label="Document"
        name="doc"
        onChange={jest.fn()}
        errors
        errorMessage="Required"
      />
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
