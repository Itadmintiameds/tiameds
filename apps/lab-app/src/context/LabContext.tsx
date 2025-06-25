'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LabResponse } from '@/types/Lab';
import { LabFormData } from '@/types/LabFormData';
import { Patient } from '@/types/patient/patient';
import { UserLogedType } from '@/types/loginUser/LogedUserType';

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
    loginedUser: UserLogedType;
    setLoginedUser: React.Dispatch<React.SetStateAction<UserLogedType>>;
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
    const [loginedUser, setLoginedUser] = useState<UserLogedType>({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: [],
        modules: null,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        enabled: false,
        is_verified: false,
    });
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
            loginedUser,
            setLoginedUser,
            refreshDocterList,
            setRefreshDocterList

        }}>
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
