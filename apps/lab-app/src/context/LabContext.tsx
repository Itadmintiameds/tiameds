'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LabResponse } from '@/types/Lab';

interface LabContextType {
    labs: LabResponse[];
    setLabs: React.Dispatch<React.SetStateAction<LabResponse[]>>;
    currentLab: LabResponse | null;
    setCurrentLab: React.Dispatch<React.SetStateAction<LabResponse | null>>;    
}

const LabContext = createContext<LabContextType | undefined>(undefined);

interface LabProviderProps {
    children: ReactNode;
}

const LabProvider = ({ children }: LabProviderProps) => {
    const [labs, setLabs] = useState<LabResponse[]>([]);
    const [currentLab, setCurrentLab] = useState<LabResponse | null>(null);

    return (
        <LabContext.Provider value={{ labs, setLabs, currentLab, setCurrentLab }}>  
            {children}
        </LabContext.Provider>
    );
};

export const useLabs = (): LabContextType => {
    const context = useContext(LabContext);
    if (!context) {
        throw new Error('useLabs must be used within a LabProvider');
    }
    return context;
};

export { LabProvider };
