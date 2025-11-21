import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PropTypes from 'prop-types';

import SearchBar from '../../../modules/app/components/common/searchbar';

// Mock del backend
jest.mock('../../../backend', () => ({
  searchService: {
    getSearchSuggestions: jest.fn(),
  },
}));

// Mock de los iconos
jest.mock('../../../config/constants', () => ({
  svgIcons: {
    SearchIcon: ({ className }) => <svg data-testid="search-icon" className={className} />,
  },
}));

// Validación de props para el mock de SearchIcon
const { SearchIcon } = require('../../../config/constants').svgIcons;
SearchIcon.propTypes = {
  className: PropTypes.string,
};

// Mock del spinner
jest.mock('../../../modules/app/components/common/spinner', () => {
  return function Spinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('SearchBar', () => {
  const mockSetQuery = jest.fn();
  const mockSetFilters = jest.fn();
  const mockOnSearch = jest.fn();
  const defaultFilters = { trainerName: '', muscleGroup: '', difficulty: '', equipment: '' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSearchBar = (query = '', filters = defaultFilters) => {
    return render(
      <SearchBar
        query={query}
        setQuery={mockSetQuery}
        filters={filters}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
      />
    );
  };

  it('renderiza input de búsqueda y botones', () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('Filtrar')).toBeInTheDocument();
  });

  it('llama setQuery cuando se escribe en el input de búsqueda', () => {
    renderSearchBar();
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'test' } });
    expect(mockSetQuery).toHaveBeenCalledWith('test');
  });

  it('llama onSearch cuando se envía el formulario', () => {
    renderSearchBar('test query');
    fireEvent.submit(screen.getByPlaceholderText('Buscar...').closest('form'));
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('no busca cuando la consulta está vacía', () => {
    renderSearchBar('');
    fireEvent.submit(screen.getByPlaceholderText('Buscar...').closest('form'));
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('alterna panel de filtros cuando se hace clic en el botón Filtrar', () => {
    renderSearchBar();
    fireEvent.click(screen.getByText('Filtrar'));
    expect(screen.getByText('Nombre del entrenador')).toBeInTheDocument();
    expect(screen.getByText('Grupo muscular')).toBeInTheDocument();
    expect(screen.getByText('Dificultad')).toBeInTheDocument();
    expect(screen.getByText('Equipamiento')).toBeInTheDocument();
  });

  it('actualiza valores de filtro cuando cambian', () => {
    const { container } = renderSearchBar();
    fireEvent.click(screen.getByText('Filtrar'));
    const trainerInput = container.querySelector('.absolute.z-40 input[type="text"]');
    fireEvent.change(trainerInput, { target: { value: 'John' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ ...defaultFilters, trainerName: 'John' });
  });

  it('limpia filtros cuando se hace clic en Limpiar filtros', () => {
    const filters = { trainerName: 'John', muscleGroup: 'PECHO', difficulty: 'FACIL', equipment: 'POLEA_CABLE' };
    renderSearchBar('', filters);
    fireEvent.click(screen.getByText('Filtrar'));
    fireEvent.click(screen.getByText('Limpiar filtros'));
    expect(mockSetFilters).toHaveBeenCalledWith({ trainerName: '', muscleGroup: '', difficulty: '', equipment: '' });
  });

  it('limpia sugerencias cuando se limpia el input', () => {
    renderSearchBar('test');
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: '' } });
    expect(mockSetQuery).toHaveBeenCalledWith('');
  });

  it('respeta restricción de longitud máxima', () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText('Buscar...')).toHaveAttribute('maxlength', '100');
  });

  it('actualiza filtro de grupo muscular', () => {
    const { container } = renderSearchBar();
    fireEvent.click(screen.getByText('Filtrar'));
    fireEvent.change(container.querySelectorAll('select')[0], { target: { value: 'PECHO' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ ...defaultFilters, muscleGroup: 'PECHO' });
  });

  it('actualiza filtro de dificultad', () => {
    const { container } = renderSearchBar();
    fireEvent.click(screen.getByText('Filtrar'));
    fireEvent.change(container.querySelectorAll('select')[1], { target: { value: 'FACIL' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ ...defaultFilters, difficulty: 'FACIL' });
  });

  it('actualiza filtro de equipamiento', () => {
    const { container } = renderSearchBar();
    fireEvent.click(screen.getByText('Filtrar'));
    fireEvent.change(container.querySelectorAll('select')[2], { target: { value: 'MAQUINA' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ ...defaultFilters, equipment: 'MAQUINA' });
  });
});
