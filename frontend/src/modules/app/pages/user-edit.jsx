
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
    const [cardNumber, setCardNumber] = useState(user?.cardNumber ?? '');

    const [isLoading, setIsLoading] = useState(false);
    const [premiumStatusChanged, setPremiumStatusChanged] = useState(null); // 'upgraded' | 'downgraded' | null

    const [emailErrors, setEmailErrors] = React.useState(null)
    const [firstnameErrors, setFirstnameErrors] = React.useState(null)
    const [lastnameErrors, setLastnameErrors] = React.useState(null)
    const [cardNumberErrors, setCardNumberErrors] = React.useState(null)

    if (!user) return <div>Cargando usuario...</div>;

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = checkErrors()
        if (!isValid) return;

        setIsLoading(true);
        setPremiumStatusChanged(null); // Reset premium status message
        
        const wasPremium = user.premium;
        const updatedUser = {
            ...user,
            email: email.trim() === '' ? user.email : email,
            firstName: firstname.trim() === '' ? user.firstName : firstname,
            lastName: lastname.trim() === '' ? user.lastName : lastname,
            avatar: { name: selectedAvatar },
            // if the user left the card empty, send null so backend treats it as not provided
            cardNumber: (cardNumber || '').trim() === '' ? null : (cardNumber || '').trim(),
        };
        updateProfile(updatedUser, (res) => {
            // Check if premium status changed
            const isNowPremium = res.premium;
            
            if (!wasPremium && isNowPremium) {
                setPremiumStatusChanged('upgraded');
                setMessage('Te has convertido en usuario premium');
            } else if (wasPremium && !isNowPremium) {
                setPremiumStatusChanged('downgraded');
                setMessage('Has dejado de ser usuario premium');
            } else {
                setMessage('Perfil actualizado correctamente');
            }
            
            if (refreshUser) {
                refreshUser(); // Solo se llama después de éxito
            }
            setIsLoading(false);
        }, (err) => {
            setMessage('Error al actualizar el perfil');
            setIsLoading(false);
        });
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
                        errors={emailErrors}
                        errorMessage={emailErrors}
                    />

                    <TextInput
                        label="Nombre"
                        type="text"
                        name="nombre"
                        value={firstname}
                        onChange={e => setFirstname(e.target.value)}
                        placeholder={user.firstName}
                        errors={firstnameErrors}
                        errorMessage={firstnameErrors}
                    />

                    <TextInput
                        label="Apellidos"
                        type="text"
                        name="apellidos"
                        value={lastname}
                        onChange={e => setLastname(e.target.value)}
                        placeholder={user.lastName}
                        errors={lastnameErrors}
                        errorMessage={lastnameErrors}
                    />
                    {user.role === 'TRAINER' && (
                        <TextInput
                            label="Tarjeta de crédito"
                            type="text"
                            name="cardNumber"
                            value={cardNumber || ''}
                            onChange={e => setCardNumber(e.target.value)}
                            maxLength={16}
                            errors={cardNumberErrors}
                            errorMessage={cardNumberErrors}
                            />
                    )}

                </div>
                

                <AvatarSelector user={user} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} />
            </div>
            <div className="flex flex-row items-end">
                <SendButton
                onClick={handleSubmit}
                children="Guardar cambios"
                isLoading={isLoading}
                />
                {message && (
                    <div className={`mb-3 ml-14 font-semibold ${
                        premiumStatusChanged === 'upgraded' 
                            ? 'text-yellow-400 text-lg' 
                            : premiumStatusChanged === 'downgraded'
                            ? 'text-orange-400'
                            : 'text-white'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
            </form>
        </div>
    );

        function checkErrors(){

        const trimmedEmail = email.trim()
        const trimmedFirstName = firstname.trim()
        const trimmedLastName = lastname.trim()
        const trimmedCardNumber = (cardNumber || '').trim()

        let hasError = false

        const isEmailValid = (value) => {
            return /^\S+@\S+\.\S+$/.test(value)
        }
        const hasDigits = (value) => /\d/.test(value)

        const emailErr = !trimmedEmail ? 'El correo electrónico es obligatorio' : (!isEmailValid(trimmedEmail) ? 'Introduce un correo electrónico válido' : null)
        const firstNameErr = !trimmedFirstName ? 'El nombre es obligatorio' : (hasDigits(trimmedFirstName) ? 'El nombre no puede contener números' : null)
        const lastNameErr = !trimmedLastName ? 'Los apellidos son obligatorios' : (hasDigits(trimmedLastName) ? 'Los apellidos no pueden contener números' : null)

        // cardNumber solo se valida si el usuario ha introducido algo (no vamos a obligar hacerte premium)
        let cardNumberErr = null
        if (trimmedCardNumber.length > 0) {
            if (trimmedCardNumber.length !== 16) {
                cardNumberErr = 'El número de tarjeta debe tener 16 dígitos'
            } else if (!/^\d{16}$/.test(trimmedCardNumber)) {
                cardNumberErr = 'El número de tarjeta debe contener solo números'
            }
        }

        if (emailErr || firstNameErr || lastNameErr || cardNumberErr) {
            hasError = true
        }

        // update states once
        setEmailErrors(emailErr)
        setFirstnameErrors(firstNameErr)
        setLastnameErrors(lastNameErr)
        setCardNumberErrors(cardNumberErr)

        return !hasError
        }
}

export default UserEdit