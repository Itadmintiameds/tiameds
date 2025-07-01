import api from '@/utils/api';
import { AxiosError } from 'axios';

export const getMembersOfLab = async (labId: number) => {
  try {
    const response = await api.get(`/user-management/get-members/${labId}`);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};


// /user-management/create-user/3
export const createMember = async (labId: number, data: any) => {
  try {
    const response = await api.post(`/user-management/create-user/${labId}`, data);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};


export const updateMember = async (labId: number, userId: number, data: any) => {
  try {
    const response = await api.put(`/user-management/update-user/${labId}/${userId}`, data);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
}


// @PutMapping("/reset-password/{labId}/{userId}")

export const resetMemberPassword = async (labId: number, userId: number, newPassword: string, confirmPassword: string) => {
  try {
    const response = await api.put(`/user-management/reset-password/${labId}/${userId}`, {
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};











//delete user in lab if you are the creator and in user table there is field that contain a creator id
export const deleteMember = async (userId: number) => {
  try {
    const response = await api.delete(`/user-management/delete-user/${userId}`);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};

// @GetMapping("/get-user/{userId}")

export const getMember = async (userId: number) => {
  try {
    const response = await api.get(`/user-management/get-user/${userId}`);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};



export const updateMemberDetails = async (userId: number, data: any) => {
  try {
    const response = await api.put(`/user-management/update-user/${userId}`, data);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};