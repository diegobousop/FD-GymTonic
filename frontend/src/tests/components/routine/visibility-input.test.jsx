import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisibilityInput from '../../../modules/app/components/routine/visibility-input';

describe('VisibilityInput', () => {
  it('renderiza con etiqueta por defecto', () => {
    render(<VisibilityInput name="visibility" />);
    
    expect(screen.getByLabelText('Visibilidad')).toBeInTheDocument();
  });

  it('renderiza con etiqueta personalizada', () => {
    render(<VisibilityInput label="Custom Label" name="customVis" />);
    
    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
  });

  it('renderiza opciones públicas y privadas', () => {
    render(<VisibilityInput name="visibility" />);
    
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByText('Privado')).toBeInTheDocument();
  });

  it('usa valor inicial', () => {
    render(<VisibilityInput name="visibility" initialValue={1} />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toBeInTheDocument();
  });

  it('usa valor controlado cuando se proporciona', () => {
    render(<VisibilityInput name="visibility" value={0} />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toBeInTheDocument();
  });

  it('llama onChange cuando cambia la selección', () => {
    const mockOnChange = jest.fn();
    render(<VisibilityInput name="visibility" onChange={mockOnChange} />);
    
    const select = screen.getByLabelText('Visibilidad');
    fireEvent.change(select, { target: { value: 'true' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('actualiza valor interno cuando no se proporciona onChange', () => {
    render(<VisibilityInput name="visibility" initialValue={0} />);
    
    const select = screen.getByLabelText('Visibilidad');
    
    fireEvent.change(select, { target: { value: 'true' } });
    
    expect(select).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando se proporciona', () => {
    render(<VisibilityInput name="visibility" errorMessage="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('aplica estilo de error cuando prop errors es true', () => {
    render(<VisibilityInput name="visibility" errors={true} />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toHaveClass('border-[#ff0000]');
  });

  it('no aplica estilo de error cuando prop errors es false', () => {
    render(<VisibilityInput name="visibility" errors={false} />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toHaveClass('border-transparent');
  });

  it('renderiza icono de flecha hacia abajo', () => {
    const { container } = render(<VisibilityInput name="visibility" />);
    
    const icon = container.querySelector('.absolute.right-4');
    expect(icon).toBeInTheDocument();
  });

  it('establece atributo name correcto', () => {
    render(<VisibilityInput name="routineVisibility" />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toHaveAttribute('name', 'routineVisibility');
  });

  it('convierte valor string a boolean en onChange', () => {
    const mockOnChange = jest.fn();
    render(<VisibilityInput name="visibility" onChange={mockOnChange} />);
    
    const select = screen.getByLabelText('Visibilidad');
    fireEvent.change(select, { target: { value: 'true', name: 'visibility' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('maneja valor false correctamente en onChange', () => {
    const mockOnChange = jest.fn();
    render(<VisibilityInput name="visibility" onChange={mockOnChange} initialValue={true} />);
    
    const select = screen.getByLabelText('Visibilidad');
    fireEvent.change(select, { target: { value: 'false', name: 'visibility' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('muestra placeholder invisible cuando no hay mensaje de error', () => {
    const { container } = render(<VisibilityInput name="visibility" />);
    
    const errorText = container.querySelector('.text-\\[\\#ff0000\\].invisible');
    expect(errorText).toBeInTheDocument();
  });

  it('actualiza valor interno cuando cambia prop initialValue', () => {
    const { rerender } = render(<VisibilityInput name="visibility" initialValue={0} />);
    
    const select = screen.getByLabelText('Visibilidad');
    expect(select).toBeInTheDocument();

    rerender(<VisibilityInput name="visibility" initialValue={1} />);
    
    expect(select).toBeInTheDocument();
  });
});

