import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainingButton from '../../../modules/app/components/training/training-button';

describe('TrainingButton', () => {
  it('renderiza botón por defecto como enlace anchor', () => {
    const { container } = render(<TrainingButton />);
    
    const anchor = container.querySelector('a[href="/home"]');
    expect(anchor).toBeInTheDocument();
    expect(screen.getByText('Crear')).toBeInTheDocument();
  });

  it('renderiza como botón cuando se proporciona type', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<TrainingButton type="submit" onClick={mockOnClick} />);
    
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeInTheDocument();
  });

  it('renderiza como botón cuando se proporciona onClick sin type', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<TrainingButton onClick={mockOnClick} />);
    
    const button = container.querySelector('button[type="button"]');
    expect(button).toBeInTheDocument();
  });

  it('llama onClick cuando se hace clic en el botón', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<TrainingButton onClick={mockOnClick} />);
    
    const button = container.querySelector('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('muestra texto "Crear" cuando no está cargando', () => {
    render(<TrainingButton />);
    
    expect(screen.getByText('Crear')).toBeInTheDocument();
  });

  it('muestra spinner cuando isLoading es true', () => {
    const { container } = render(<TrainingButton isLoading={true} />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Crear')).not.toBeInTheDocument();
  });

  it('no muestra spinner cuando isLoading es false', () => {
    const { container } = render(<TrainingButton isLoading={false} />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('renderiza icono de flecha cuando no está cargando', () => {
    const { container } = render(<TrainingButton />);
    
    const arrow = container.querySelector('img[alt="Flecha"]');
    expect(arrow).toBeInTheDocument();
  });

  it('no renderiza icono de flecha cuando está cargando', () => {
    const { container } = render(<TrainingButton isLoading={true} />);
    
    const arrow = container.querySelector('img[alt="Flecha"]');
    expect(arrow).not.toBeInTheDocument();
  });

  it('aplica clases de estilo correctas', () => {
    const { container } = render(<TrainingButton />);
    
    const buttonDiv = container.querySelector('.w-\\[288px\\].h-\\[48px\\]');
    expect(buttonDiv).toBeInTheDocument();
    expect(buttonDiv).toHaveClass('bg-[#212121]');
  });

  it('renderiza con clase group para efectos hover', () => {
    const { container } = render(<TrainingButton onClick={() => {}} />);
    
    const button = container.querySelector('button.group');
    expect(button).toBeInTheDocument();
  });

  it('funciona con type y onClick', () => {
    const mockOnClick = jest.fn();
    render(<TrainingButton type="button" onClick={mockOnClick} />);
    
    const button = screen.getByText('Crear').closest('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalled();
  });
});

