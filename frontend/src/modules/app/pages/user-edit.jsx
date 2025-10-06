
import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../components/common/user-provider'
import { updateProfile } from "../../../backend/userService"
import TextInput from '../components/common/text-input'
import SendButton from '../components/common/send-button'

import AvatarSelector from '../components/profile/avatar-selector'

const UserEdit = () => {
    const { user, setUser, refreshUser } = useContext(UserContext);
    const [email, setEmail] = useState(user?.email || '');
    const [firstname, setFirstname] = useState(user?.firstName || '');
    const [lastname, setLastname] = useState(user?.lastName || '');
    const [message, setMessage] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar?.name || 'default');

    const [isLoading, setIsLoading] = useState(false);

    if (!user) return <div>Cargando usuario...</div>;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const updatedUser = {
            ...user,
            email: email.trim() === '' ? user.email : email,
            firstName: firstname.trim() === '' ? user.firstName : firstname,
            lastName: lastname.trim() === '' ? user.lastName : lastname,
            avatar: { name: selectedAvatar }
        };
        updateProfile(updatedUser, (res) => {
            if (refreshUser) {
                refreshUser(); // Solo se llama después de éxito
            }
    setMessage('Perfil actualizado correctamente');
        }, (err) => {
            setMessage('Error al actualizar el perfil');
        });
        if (refreshUser) {
            refreshUser();
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col mt-5 ml-10">
            <form onSubmit={handleSubmit} className="">
            <div className="flex flex-row items-center gap-6">
                
                <div className="flex flex-col">
                    <TextInput
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={user.email}
                    />

                    <TextInput
                        label="Nombre"
                        type="text"
                        name="nombre"
                        value={firstname}
                        onChange={e => setFirstname(e.target.value)}
                        placeholder={user.firstName}
                    />

                    <TextInput
                        label="Apellidos"
                        type="text"
                        name="apellidos"
                        value={lastname}
                        onChange={e => setLastname(e.target.value)}
                        placeholder={user.lastName}
                    />
                </div>
                

                <AvatarSelector user={user} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} />
            </div>
            <div className="flex flex-row items-end">
                <SendButton
                onClick={handleSubmit}
                children="Guardar cambios"
                isLoading={isLoading}
                />
                {message && <div className=" text-white mb-3 ml-14">{message}</div>}
            </div>
            </form>
        </div>
    );
}

export default UserEdit