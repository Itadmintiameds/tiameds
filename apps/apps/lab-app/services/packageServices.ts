import api from '@/utils/api';
import { Package } from '@/types/package/package';


export const createPackage = async (labId: number, packageData: Package) => {    
    try {
        const response = await api.post(`/admin/lab/${labId}/package`, packageData);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while creating package.');       
    }
}

export const getPackage = async (labId: number) => {
    try {
        const response = await api.get(`/admin/lab/${labId}/packages`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching packages:', error.message || error); // Log the actual error message
        throw new Error('An error occurred while fetching packages.');
    }
};


export const updatePackage = async (labId: number, packageId: number, packageData: Package) => {
    try {
        const response = await api.put(`/admin/lab/${labId}/package/${packageId}`, packageData);
        return response.data;
    } catch (error: any) {
        console.error('Error updating package:', error.message || error); // Log the actual error message
        throw new Error('An error occurred while updating package.');
    }
};


export const packageDelete = async (labId: number, packageId: number) => {
    try {
        const response = await api.delete(`/admin/lab/${labId}/package/${packageId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting package:', error.message || error); // Log the actual error message
        throw new Error('An error occurred while deleting package.');
    }
}


export const getHealthPackageById= async (labId: number, packageId: number) => {
    try {
        const response = await api.get(`/admin/lab/${labId}/package/${packageId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching package:', error.message || error); // Log the actual error message
        throw new Error('An error occurred while fetching package.');
    }
}





