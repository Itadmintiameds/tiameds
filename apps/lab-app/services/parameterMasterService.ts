import api from '@/utils/api';

export interface ParameterMaster {
  parameterId: number;
  parameterName: string;
  isActive: boolean;
}

interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

const extractError = (error: unknown, fallback: string): Error => {
  const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (apiMessage) return new Error(apiMessage);
  if (error instanceof Error) return new Error(error.message);
  return new Error(fallback);
};

// GET /lab/parameter-master — active parameters only
export const getParameters = async (): Promise<ParameterMaster[]> => {
  try {
    const response = await api.get<ApiEnvelope<ParameterMaster[]>>('/lab/parameter-master');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    throw extractError(error, 'An error occurred while fetching parameters.');
  }
};

// POST /lab/parameter-master — 400 if the name already exists (case-insensitive)
export const addParameter = async (parameterName: string): Promise<ParameterMaster> => {
  try {
    const response = await api.post<ApiEnvelope<ParameterMaster>>('/lab/parameter-master', {
      parameterName: parameterName.trim(),
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error, 'An error occurred while adding the parameter.');
  }
};

// PUT /lab/parameter-master/{id} — rename (400 if another parameter already has the name)
export const updateParameter = async (parameterId: number, parameterName: string): Promise<ParameterMaster> => {
  try {
    const response = await api.put<ApiEnvelope<ParameterMaster>>(`/lab/parameter-master/${parameterId}`, {
      parameterName: parameterName.trim(),
    });
    return response.data.data;
  } catch (error) {
    throw extractError(error, 'An error occurred while updating the parameter.');
  }
};

// GET /lab/parameter-master/deleted — inactive (soft-deleted) parameters
export const getInactiveParameters = async (): Promise<ParameterMaster[]> => {
  try {
    const response = await api.get<ApiEnvelope<ParameterMaster[]>>('/lab/parameter-master/deleted');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    throw extractError(error, 'An error occurred while fetching inactive parameters.');
  }
};

// PATCH /lab/parameter-master/{id}/activate — re-enable an inactive parameter
export const activateParameter = async (parameterId: number): Promise<ParameterMaster> => {
  try {
    const response = await api.patch<ApiEnvelope<ParameterMaster>>(`/lab/parameter-master/${parameterId}/activate`);
    return response.data.data;
  } catch (error) {
    throw extractError(error, 'An error occurred while activating the parameter.');
  }
};

// DELETE /lab/parameter-master/{id} — soft delete (sets isActive=false); used to deactivate
export const deleteParameter = async (parameterId: number): Promise<void> => {
  try {
    await api.delete(`/lab/parameter-master/${parameterId}`);
  } catch (error) {
    throw extractError(error, 'An error occurred while deleting the parameter.');
  }
};
