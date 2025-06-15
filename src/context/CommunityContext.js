// src/context/CommunityContext.js
import React, { createContext, useContext, useState } from 'react';

const CommunityContext = createContext();

export function CommunityProvider({ children }) {
  const [selectedCommunity, setSelectedCommunity] = useState('');
  return (
    <CommunityContext.Provider value={{ selectedCommunity, setSelectedCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
