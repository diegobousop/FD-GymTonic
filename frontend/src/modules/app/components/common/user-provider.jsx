import React from 'react'
import PropTypes from 'prop-types';

import { tryLoginFromServiceToken } from "../../../../backend/userService";

export const UserContext = React.createContext();

const defaultAvatar = 'https://ik.imagekit.io/940wz34p7/1.png?updatedAt=1758552818447';


export const UserProvider = ({children}) => {

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [pendingInvites, setPendingInvites] = React.useState(0);

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
        } else {
            tryLoginFromServiceToken(
                (authenticatedUser) => {
                    const userToSet = {
                        ...authenticatedUser?.user,
                        avatar: authenticatedUser?.user?.avatar || defaultAvatar
                    };
                    setUser(userToSet);
                    localStorage.setItem("user", JSON.stringify(userToSet));
                    setLoading(false);
                },
                () => {
                    console.error('Reauthentication required');
                    setLoading(false);
                }
            );
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("serviceToken");
        localStorage.removeItem("user");
        setUser(null);
    }

    const contextValue = React.useMemo(() => ({ user, setUser, handleLogout, loading, pendingInvites, setPendingInvites }), [user, loading, pendingInvites]);


  return (
      <UserContext.Provider value={contextValue}>
          {children}
      </UserContext.Provider>
  );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
