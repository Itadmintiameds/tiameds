'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LabResponse } from '@/types/Lab';
import { LabFormData } from '@/types/LabFormData';

interface LabContextType {
    labs: LabResponse[];
    setLabs: React.Dispatch<React.SetStateAction<LabResponse[]>>;
    currentLab: LabResponse | null;
    setCurrentLab: React.Dispatch<React.SetStateAction<LabResponse | null>>;
    formData: LabFormData;
    setFormData: React.Dispatch<React.SetStateAction<LabFormData>>;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

interface LabProviderProps {
    children: ReactNode;
}

const LabProvider = ({ children }: LabProviderProps) => {
    const [labs, setLabs] = useState<LabResponse[]>([]);
    const [currentLab, setCurrentLab] = useState<LabResponse | null>(null);
    const [formData, setFormData] = useState<LabFormData>({
        name: '',
        address: '',
        city: '',
        state: '',
        description: '',
    });


    return (
        <LabContext.Provider value={{ labs, setLabs, currentLab, setCurrentLab , formData, setFormData}}>
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
