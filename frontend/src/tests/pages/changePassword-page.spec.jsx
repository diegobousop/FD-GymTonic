import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordPage from '../../modules/app/pages/changePassword-page';
import { UserContext } from '../../modules/app/components/common/user-provider';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../backend/userService', () => ({
  changePassword: jest.fn(),
}));

import { changePassword } from '../../backend/userService';

describe('ChangePasswordPage', () => {
  const user = { username: 'testUser' };

  const renderComponent = (contextUser = user) =>
    render(
      <UserContext.Provider value={{ user: contextUser }}>
        <ChangePasswordPage />
      </UserContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza los campos del formulario', () => {
    renderComponent();

    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  test('muestra error si las contraseñas no coinciden', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: '654321' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  test('muestra error si no hay usuario en el contexto', async () => {
    renderComponent(null);

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Usuario no identificado')).toBeInTheDocument();
  });

  test('llama a changePassword y muestra éxito', async () => {
    changePassword.mockImplementation((_user, _oldPass, _newPass, onSuccess) => {
      onSuccess();
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'oldPass' } });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'newPass123' } });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'newPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() =>
      expect(screen.getByText('Contraseña cambiada correctamente ✅')).toBeInTheDocument()
    );
    expect(changePassword).toHaveBeenCalledWith(
      user,
      'oldPass',
      'newPass123',
      expect.any(Function),
      expect.any(Function)
    );
  });

  test('muestra error si changePassword falla', async () => {
    changePassword.mockImplementation((_user, _oldPass, _newPass, _onSuccess, onError) => {
      onError('Error al cambiar');
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'oldPass' } });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'newPass123' } });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'newPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Error al cambiar')).toBeInTheDocument();
  });
});
