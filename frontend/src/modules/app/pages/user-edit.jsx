
import React, { useState, useContext } from 'react'
import { UserContext } from '../components/common/user-provider'
import { updateProfile } from "../../../backend/userService"

const UserEdit = () => {
    const { user, setUser } = useContext(UserContext);
    const [email, setEmail] = useState(user?.email || '');
    const [firstname, setFirstname] = useState(user?.firstName || '');
    const [lastname, setLastname] = useState(user?.lastName || '');
    const [message, setMessage] = useState('');

    if (!user) return <div>Cargando usuario...</div>;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Si el campo está vacío, se mantiene el valor antiguo
        const updatedUser = {
            ...user,
            email: email.trim() === '' ? user.email : email,
            firstName: firstname.trim() === '' ? user.firstName : firstname,
            lastName: lastname.trim() === '' ? user.lastName : lastname,
        };
        updateProfile(updatedUser, (res) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('Perfil actualizado correctamente');
        }, (err) => {
            setMessage('Error al actualizar el perfil');
        });
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-auto ">
            <h2 className="text-2xl font-bold mb-4 text-white">Editar usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-white">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={user.email}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-white">Nombre</label>
                    <input
                        type="text"
                        value={firstname}
                        onChange={e => setFirstname(e.target.value)}
                        placeholder={user.firstName}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-white">Apellido</label>
                    <input
                        type="text"
                        value={lastname}
                        onChange={e => setLastname(e.target.value)}
                        placeholder={user.lastName}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Guardar cambios</button>
            </form>
            {message && <div className="mt-4 text-center text-white">{message}</div>}
        </div>
    );
}

export default UserEdit