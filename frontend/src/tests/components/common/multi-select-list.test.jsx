import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiSelectList from '../../../modules/app/components/common/multi-select-list';

describe('MultiSelectList', () => {
  const mockOptions = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' }
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza con etiqueta', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select Options"
      />
    );

    expect(screen.getByText('Select Options')).toBeInTheDocument();
  });

  it('renderiza todas las opciones', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('muestra estado marcado para elementos seleccionados', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[1, 2]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    const checkbox1 = screen.getByLabelText('Option 1');
    const checkbox2 = screen.getByLabelText('Option 2');
    const checkbox3 = screen.getByLabelText('Option 3');

    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();
    expect(checkbox3).not.toBeChecked();
  });

  it('llama onChange cuando se selecciona un elemento', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    const checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([1]);
  });

  it('llama onChange cuando se deselecciona un elemento', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[1, 2]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    const checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([2]);
  });

  it('alterna visibilidad de lista cuando se hace clic en etiqueta', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: 'Select' });
    fireEvent.click(toggleButton);

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renderiza botones de paginación cuando se proporciona setPage', () => {
    const mockSetPage = jest.fn();

    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        page={1}
        setPage={mockSetPage}
        existMoreItems={true}
      />
    );

    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('no renderiza botones de paginación cuando no se proporciona setPage', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
  });

  it('llama setPage con valor incrementado cuando se hace clic en Siguiente', () => {
    const mockSetPage = jest.fn();

    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        page={0}
        setPage={mockSetPage}
        existMoreItems={true}
      />
    );

    fireEvent.click(screen.getByText('Siguiente'));

    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it('llama setPage con valor decrementado cuando se hace clic en Anterior', () => {
    const mockSetPage = jest.fn();

    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        page={1}
        setPage={mockSetPage}
        existMoreItems={true}
      />
    );

    fireEvent.click(screen.getByText('Anterior'));

    expect(mockSetPage).toHaveBeenCalledWith(0);
  });

  it('deshabilita botón Anterior en primera página', () => {
    const mockSetPage = jest.fn();

    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        page={0}
        setPage={mockSetPage}
        existMoreItems={true}
      />
    );

    const anteriorButton = screen.getByText('Anterior');
    expect(anteriorButton).toBeDisabled();
  });

  it('deshabilita botón Siguiente cuando no hay más elementos', () => {
    const mockSetPage = jest.fn();

    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        page={1}
        setPage={mockSetPage}
        existMoreItems={false}
      />
    );

    const siguienteButton = screen.getByText('Siguiente');
    expect(siguienteButton).toBeDisabled();
  });

  it('muestra mensaje de error cuando prop errors es true', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        errors={true}
        errorMessage="Please select at least one option"
      />
    );

    expect(screen.getByText('Please select at least one option')).toBeInTheDocument();
  });

  it('muestra mensaje de error por defecto cuando no se proporciona errorMessage', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        errors={true}
      />
    );

    expect(screen.getByText('Debes seleccionar al menos un elemento.')).toBeInTheDocument();
  });

  it('no muestra error cuando prop errors es false', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Select"
        errors={false}
        errorMessage="Error message"
      />
    );

    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('aplica estilo negrita a etiquetas de opciones seleccionadas', () => {
    render(
      <MultiSelectList
        options={mockOptions}
        selected={[1]}
        onChange={mockOnChange}
        label="Select"
      />
    );

    const label1 = screen.getByText('Option 1');
    const label2 = screen.getByText('Option 2');

    expect(label1).toHaveClass('font-bold');
    expect(label2).not.toHaveClass('font-bold');
  });
});

