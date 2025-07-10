import React, { createContext, useContext, useState, useEffect } from 'react';

const CommunityContext = createContext();

export function CommunityProvider({ children }) {
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [user, setUser] = useState(null);

  // Inicializa usuario y comunidad al montar la app
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);

      // Fuerza la comunidad para usuarios normales
      if (storedUser && !storedUser.is_staff && storedUser.community_id) {
        setSelectedCommunity(String(storedUser.community_id));
      }
      // Staff: deja el selector libre
      else if (storedUser && storedUser.is_staff) {
        setSelectedCommunity('');
      }
    } catch {
      setUser(null);
      setSelectedCommunity('');
    }
  }, []);

  // Si el usuario cambia (login/logout), vuelve a aplicar la lógica
  useEffect(() => {
    if (user && !user.is_staff && user.community_id) {
      setSelectedCommunity(String(user.community_id));
    } else if (user && user.is_staff) {
      setSelectedCommunity('');
    }
  }, [user]);

  // Hook para limpiar el contexto (logout)
  function clearCommunityContext() {
    setSelectedCommunity('');
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <CommunityContext.Provider
      value={{
        selectedCommunity,
        setSelectedCommunity,
        user,
        setUser,
        clearCommunityContext,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useCommunity() {
  return useContext(CommunityContext);
}



// import React, { createContext, useContext, useState } from 'react';

// const CommunityContext = createContext();

// export function CommunityProvider({ children }) {
//   const [selectedCommunity, setSelectedCommunity] = useState('');

//   return (
//     <CommunityContext.Provider value={{ selectedCommunity, setSelectedCommunity }}>
//       {children}
//     </CommunityContext.Provider>
//   );
// }

// export function useCommunity() {
//   return useContext(CommunityContext);
// }

///////////////////////////

// import React, { createContext, useContext, useState, useEffect } from 'react';

// const CommunityContext = createContext();

// export function CommunityProvider({ children }) {
//   const [selectedCommunity, setSelectedCommunity] = useState('');
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     try {
//       const storedUser = JSON.parse(localStorage.getItem('user'));
//       setUser(storedUser);

//       if (storedUser && !storedUser.is_staff && storedUser.community_id) {
//         setSelectedCommunity(String(storedUser.community_id));
//       } else if (storedUser && storedUser.is_staff) {
//         setSelectedCommunity('');
//       }
//     } catch {
//       setUser(null);
//       setSelectedCommunity('');
//     }
//   }, []);

//   return (
//     <CommunityContext.Provider value={{ selectedCommunity, setSelectedCommunity, user }}>
//       {children}
//     </CommunityContext.Provider>
//   );
// }

// export function useCommunity() {
//   return useContext(CommunityContext);
// }
