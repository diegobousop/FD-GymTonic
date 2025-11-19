import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvatarSelector from '../../../modules/app/components/profile/avatar-selector';
import backend from '../../../backend';

jest.mock('../../../backend', () => ({
  imageService: {
    getAllAvatars: jest.fn()
  }
}));

jest.mock('../../../modules/app/components/common/pager', () => {
  return function MockPager({ back, next }) {
    return (
      <div data-testid="pager">
        <button onClick={back.onClick} disabled={!back.enabled}>Back</button>
        <button onClick={next.onClick} disabled={!next.enabled}>Next</button>
      </div>
    );
  };
});

jest.mock('../../../modules/app/components/common/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('AvatarSelector', () => {
  const mockSetSelectedAvatar = jest.fn();

  const mockAvatarsResponse = {
    items: [
      { name: 'avatar1', avatarBase64: 'data:image/png;base64,avatar1' },
      { name: 'avatar2', avatarBase64: 'data:image/png;base64,avatar2' },
      { name: 'avatar3', avatarBase64: 'data:image/png;base64,avatar3' }
    ],
    existMoreItems: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    backend.imageService.getAllAvatars.mockImplementation((page, size, onSuccess) => {
      onSuccess(mockAvatarsResponse);
    });
  });

  it('muestra spinner mientras carga', async () => {
    let resolveGetAvatars;
    backend.imageService.getAllAvatars.mockImplementation((page, size, onSuccess) => {
      return new Promise(resolve => {
        resolveGetAvatars = () => {
          onSuccess(mockAvatarsResponse);
          resolve();
        };
      });
    });

    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('renderiza avatares después de cargar', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);
  });

  it('muestra imágenes de avatar con src y alt correctos', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'data:image/png;base64,avatar1');
      expect(images[0]).toHaveAttribute('alt', 'avatar1');
    });
  });

  it('resalta avatar seleccionado', async () => {
    render(<AvatarSelector selectedAvatar="avatar2" setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      const selectedImage = images.find(img => img.alt === 'avatar2');
      expect(selectedImage).toHaveClass('border-white');
    });
  });

  it('llama setSelectedAvatar cuando se hace clic en avatar', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      fireEvent.click(images[0]);
    });

    expect(mockSetSelectedAvatar).toHaveBeenCalledWith('avatar1');
  });

  it('renderiza componente paginador', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pager')).toBeInTheDocument();
    });
  });

  it('habilita botón siguiente cuando existen más elementos', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('deshabilita botón atrás en primera página', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });
  });

  it('obtiene siguiente página cuando se hace clic en botón siguiente', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.imageService.getAllAvatars).toHaveBeenCalledWith(
        1,
        4,
        expect.any(Function),
        expect.any(Function)
      );
    }, { timeout: 3000 });
  });

  it('habilita botón atrás después de navegar hacia adelante', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Hacer clic en siguiente para avanzar a página 1
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(backend.imageService.getAllAvatars).toHaveBeenLastCalledWith(
        1,
        4,
        expect.any(Function),
        expect.any(Function)
      );
    });

    // Ahora el botón atrás debe estar habilitado ya que estamos en página 1
    await waitFor(() => {
      const backButton = screen.getByText('Back');
      expect(backButton).not.toBeDisabled();
    });
  });

  it('muestra mensaje de error en error de API', async () => {
    backend.imageService.getAllAvatars.mockImplementation((page, size, onSuccess, onError) => {
      onError(new Error('API Error'));
    });

    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los avatares')).toBeInTheDocument();
    });
  });

  it('muestra error cuando la respuesta es inválida', async () => {
    backend.imageService.getAllAvatars.mockImplementation((page, size, onSuccess) => {
      onSuccess({ items: null });
    });

    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.getByText('La respuesta del backend no contiene avatares válidos.')).toBeInTheDocument();
    });
  });

  it('renderiza texto de etiqueta', async () => {
    render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      expect(screen.getByText('Avatares')).toBeInTheDocument();
    });
  });

  it('renderiza avatares en diseño de cuadrícula', async () => {
    const { container } = render(<AvatarSelector selectedAvatar={null} setSelectedAvatar={mockSetSelectedAvatar} />);
    
    await waitFor(() => {
      const grid = container.querySelector('.grid.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });
});

