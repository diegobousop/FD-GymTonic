import React, { useState } from 'react';
import TextInput from '../components/common/text-input';
import SendButton from '../components/common/send-button';
import { changePassword } from '../../../backend/userService';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setErrors({ globalError: 'Las contraseñas no coinciden' });
      return;
    }

    changePassword(
      oldPassword,
      newPassword,
      () => {
        setSuccess('Contraseña cambiada correctamente ✅');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
      (err) => setErrors({ globalError: err || 'Error al cambiar la contraseña' })
    );
  };

  return (
    <div className="ml-[5%] mt-[4%]">
      <h1 className="mb-10">Cambiar Contraseña</h1>
      <form onSubmit={handleChangePassword}>
        <div className="grid grid-cols-2 gap-4 w-[620px]">
          <TextInput
            name="oldPassword"
            label="Contraseña actual"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextInput
            name="newPassword"
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextInput
            name="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="col-span-1 mt-4">
            <SendButton onClick={handleChangePassword} />
          </div>
          <div className="col-span-1" />
        </div>

        {errors && <div className="text-red-500 text-xs mt-2">{errors.globalError}</div>}
        {success && <div className="text-green-500 text-xs mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default ChangePasswordPage;
