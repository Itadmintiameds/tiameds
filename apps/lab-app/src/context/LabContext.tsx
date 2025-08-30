'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LabResponse } from '@/types/Lab';
import { LabFormData } from '@/types/LabFormData';
import { Patient } from '@/types/patient/patient';


interface LabContextType {
    labs: LabResponse[];
    setLabs: React.Dispatch<React.SetStateAction<LabResponse[]>>;
    currentLab: LabResponse | null;
    setCurrentLab: React.Dispatch<React.SetStateAction<LabResponse | null>>;
    formData: LabFormData;
    setFormData: React.Dispatch<React.SetStateAction<LabFormData>>;
    patientDetails: Patient | undefined;
    setPatientDetails: React.Dispatch<React.SetStateAction<Patient | undefined>>;
    refreshlab: boolean;
    setRefreshLab: React.Dispatch<React.SetStateAction<boolean>>;

    refreshDocterList: boolean;
    setRefreshDocterList: React.Dispatch<React.SetStateAction<boolean>>;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

interface LabProviderProps {
    children: ReactNode;
}

const LabProvider = ({ children }: LabProviderProps) => {
    const [labs, setLabs] = useState<LabResponse[]>([]);
    const [currentLab, setCurrentLab] = useState<LabResponse | null>(null);
    const [patientDetails, setPatientDetails] = useState<Patient>();
    const [formData, setFormData] = useState<LabFormData>({
        name: '',
        address: '',
        city: '',
        state: '',
        description: '',
    });
    const [refreshlab, setRefreshLab] = useState<boolean>(false);

    const [refreshDocterList, setRefreshDocterList] = useState<boolean>(false);


    return (
        <LabContext.Provider value={{
            labs,
            setLabs,
            currentLab,
            setCurrentLab,
            formData,
            setFormData,
            patientDetails,
            setPatientDetails,
            refreshlab,
            setRefreshLab,

            refreshDocterList,
            setRefreshDocterList

        }}>
            {children}
        </LabContext.Provider>
    );
};

// Utility functions for lab storage management
export const saveLabsToStorage = (labs: LabResponse[], currentLabIndex: number) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('userLabs', JSON.stringify({
            labs,
            currentLabIndex
        }));
    }
};

export const getLabsFromStorage = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('userLabs');
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return null;
};

export const useLabs = (): LabContextType => {
    const context = useContext(LabContext);
    if (!context) {
        throw new Error('useLabs must be used within a LabProvider');
    }
    return context;
};

export { LabProvider };
