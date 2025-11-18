import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParagraphInput from '../../../modules/app/components/common/paragraph-input';

describe('ParagraphInput', () => {
  it('renderiza con props por defecto', () => {
    render(<ParagraphInput name="test" />);
    
    expect(screen.getByLabelText('Nombre de Usuario')).toBeInTheDocument();
  });

  it('renderiza con etiqueta personalizada', () => {
    render(<ParagraphInput name="test" label="Descripción" />);
    
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
  });

  it('renderiza con placeholder', () => {
    render(<ParagraphInput name="test" placeholder="Escribe aquí..." />);
    
    expect(screen.getByPlaceholderText('Escribe aquí...')).toBeInTheDocument();
  });

  it('muestra contador de caracteres', () => {
    render(<ParagraphInput name="test" maxLength={100} initialValue="Test" />);
    
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('no muestra contador de caracteres para tipo password', () => {
    render(<ParagraphInput name="test" type="password" maxLength={100} />);
    
    expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
  });

  it('maneja evento onChange', () => {
    const mockOnChange = jest.fn();
    render(<ParagraphInput name="test" onChange={mockOnChange} />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    fireEvent.change(textarea, { target: { value: 'New value' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('actualiza valor interno cuando no se proporciona onChange', () => {
    render(<ParagraphInput name="test" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    fireEvent.change(textarea, { target: { value: 'New value' } });
    
    expect(textarea.value).toBe('New value');
  });

  it('aplica longitud máxima', () => {
    const mockOnChange = jest.fn();
    render(<ParagraphInput name="test" maxLength={10} onChange={mockOnChange} />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    fireEvent.change(textarea, { target: { value: '12345678901234567890' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('usa valor controlado cuando se proporciona', () => {
    render(<ParagraphInput name="test" value="Controlled" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea.value).toBe('Controlled');
  });

  it('actualiza cuando cambia initialValue', () => {
    const { rerender } = render(<ParagraphInput name="test" initialValue="Initial" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea.value).toBe('Initial');

    rerender(<ParagraphInput name="test" initialValue="Updated" />);
    expect(textarea.value).toBe('Updated');
  });

  it('muestra mensaje de error cuando se proporciona', () => {
    render(<ParagraphInput name="test" errorMessage="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('aplica estilo de error cuando prop errors es true', () => {
    render(<ParagraphInput name="test" errors={true} />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveClass('border-[#ff0000]');
  });

  it('renderiza botón de alternar contraseña para tipo password', () => {
    render(<ParagraphInput name="test" type="password" />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('alterna visibilidad de contraseña cuando se hace clic en botón', () => {
    render(<ParagraphInput name="test" type="password" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(textarea).toHaveAttribute('type', 'text');
  });

  it('alterna visibilidad de contraseña con tecla Enter', () => {
    render(<ParagraphInput name="test" type="password" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    
    expect(textarea).toHaveAttribute('type', 'text');
  });

  it('alterna visibilidad de contraseña con tecla Espacio', () => {
    render(<ParagraphInput name="test" type="password" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.keyDown(toggleButton, { key: ' ' });
    
    expect(textarea).toHaveAttribute('type', 'text');
  });

  it('no alterna contraseña con otras teclas', () => {
    render(<ParagraphInput name="test" type="password" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.keyDown(toggleButton, { key: 'a' });
    
    expect(textarea).toHaveAttribute('type', 'password');
  });

  it('renderiza con atributos correctos de textarea', () => {
    render(<ParagraphInput name="test" maxLength={200} />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea).toHaveAttribute('name', 'test');
    expect(textarea).toHaveAttribute('maxLength', '200');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('maneja valor vacío', () => {
    render(<ParagraphInput name="test" />);
    
    const textarea = screen.getByLabelText('Nombre de Usuario');
    expect(textarea.value).toBe('');
  });

  it('muestra placeholder de error invisible cuando no hay error', () => {
    const { container } = render(<ParagraphInput name="test" />);
    
    const errorElement = container.querySelector('.invisible');
    expect(errorElement).toBeInTheDocument();
  });
});

