import api from '@/utils/api';
import { TestList } from '@/types/test/testlist';


export const getTests = async (labId: string): Promise<TestList[]> => {
  try {
    const response = await api.get<{ data: TestList[]; message: string; status: string }>(`admin/lab/${labId}/tests`);
    return response.data.data; // Extract the tests array from the response
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while fetching tests.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};


//delete test
export const deleteTest = async (testId: string, labId: string): Promise<void> => {
  try {
    await api.delete(`/admin/lab/${labId}/remove/${testId}`);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while deleting test.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};


//add test 
export const addTest = async (labId: string, test: TestList): Promise<void> => {
  try {
    await api.post(`/admin/lab/${labId}/add`, test);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while adding test.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};


//upload test csv
export const uploadTestCsv = async (labId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post(`/admin/lab/test/${labId}/csv/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while uploading test.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};


//download test csv
export const downloadTestCsv = async (labId: string): Promise<void> => {
  try {
    const response = await api.get(`/admin/lab/${labId}/download`, {
      responseType: 'blob', // Important for handling file responses
    });

    // Create a blob URL
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');

    // Set the file name and trigger the download
    link.href = url;
    link.setAttribute('download', 'test_price_list.csv'); // Default file name
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while downloading the test.';

    // Enhanced error handling
    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};
