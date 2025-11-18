import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SearchBar from '../../../modules/app/components/common/searchbar';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  searchService: {
    getSearchSuggestions: jest.fn(),
  },
}));

jest.mock('../../../config/constants', () => ({
  SVG_ICONS: {
    SearchIcon: ({ className }) => <svg data-testid="search-icon" className={className} />,
  },
}));

jest.mock('../../../modules/app/components/common/spinner', () => {
  return function Spinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('SearchBar', () => {
  const mockSetQuery = jest.fn();
  const mockSetFilters = jest.fn();
  const mockOnSearch = jest.fn();
  const defaultFilters = { trainerName: '', muscleGroup: '', difficulty: '' };

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

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockSetQuery).toHaveBeenCalledWith('test');
  });

  it('llama onSearch cuando se envía el formulario', () => {
    renderSearchBar('test query');

    const form = screen.getByPlaceholderText('Buscar...').closest('form');
    fireEvent.submit(form);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('no busca cuando la consulta está vacía', () => {
    renderSearchBar('');

    const form = screen.getByPlaceholderText('Buscar...').closest('form');
    fireEvent.submit(form);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('alterna panel de filtros cuando se hace clic en el botón Filtrar', () => {
    renderSearchBar();

    const filterButton = screen.getByText('Filtrar');
    fireEvent.click(filterButton);

    expect(screen.getByText('Nombre del entrenador')).toBeInTheDocument();
    expect(screen.getByText('Grupo muscular')).toBeInTheDocument();
    expect(screen.getByText('Dificultad')).toBeInTheDocument();
  });

  it('actualiza valores de filtro cuando cambian', () => {
    const { container } = renderSearchBar();

    fireEvent.click(screen.getByText('Filtrar'));

    const filterPanel = container.querySelector('.absolute.z-40');
    const trainerInput = filterPanel.querySelector('input[type="text"]');
    fireEvent.change(trainerInput, { target: { value: 'John' } });

    expect(mockSetFilters).toHaveBeenCalledWith({
      ...defaultFilters,
      trainerName: 'John',
    });
  });

  it('limpia filtros cuando se hace clic en el botón Limpiar filtros', () => {
    const filters = { trainerName: 'John', muscleGroup: 'PECHO', difficulty: 'FACIL' };
    renderSearchBar('', filters);

    fireEvent.click(screen.getByText('Filtrar'));
    fireEvent.click(screen.getByText('Limpiar filtros'));

    expect(mockSetFilters).toHaveBeenCalledWith({
      trainerName: '',
      muscleGroup: '',
      difficulty: '',
    });
  });

  it('limpia sugerencias cuando se limpia el input', () => {
    renderSearchBar('test');

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: '' } });

    expect(mockSetQuery).toHaveBeenCalledWith('');
  });

  it('respeta restricción de longitud máxima', () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText('Buscar...');
    expect(input).toHaveAttribute('maxlength', '100');
  });

  it('actualiza filtro de grupo muscular', () => {
    const { container } = renderSearchBar();

    fireEvent.click(screen.getByText('Filtrar'));

    const selects = container.querySelectorAll('select');
    const muscleGroupSelect = selects[0]; // First select is muscle group
    fireEvent.change(muscleGroupSelect, { target: { value: 'PECHO' } });

    expect(mockSetFilters).toHaveBeenCalledWith({
      ...defaultFilters,
      muscleGroup: 'PECHO',
    });
  });

  it('actualiza filtro de dificultad', () => {
    const { container } = renderSearchBar();

    fireEvent.click(screen.getByText('Filtrar'));

    const selects = container.querySelectorAll('select');
    const difficultySelect = selects[1]; // Second select is difficulty
    fireEvent.change(difficultySelect, { target: { value: 'FACIL' } });

    expect(mockSetFilters).toHaveBeenCalledWith({
      ...defaultFilters,
      difficulty: 'FACIL',
    });
  });
});

