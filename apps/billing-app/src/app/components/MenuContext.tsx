"use client";

import React, { createContext, useContext, useState } from "react";

// Define the context types
interface MenuContextType {
  activePrimary: string | null;
  activeSecondary: string | null;
  setActivePrimary: (menu: string | null) => void;
  setActiveSecondary: (submenu: string | null) => void;
}

// Create the context
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Custom hook to use the context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};

// Provider to wrap the application
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePrimary, setActivePrimary] = useState<string | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<string | null>(null);

  return (
    <MenuContext.Provider value={{ activePrimary, activeSecondary, setActivePrimary, setActiveSecondary }}>
      {children}
    </MenuContext.Provider>
  );
};
