import api from '@/utils/api';
import { TestList ,TestReferancePoint} from '@/types/test/testlist';
import { AxiosError } from 'axios';


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

export const downloadTestCsvExcel = async (labId: string): Promise<string> => {
  try {
      const response = await api.get(`/admin/lab/${labId}/download`, {
          responseType: 'blob',
      });

      return response.data.text(); // Convert Blob to text and return
  } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching the test reference range.';

      if (error instanceof Error && (error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }

      throw new Error(errorMessage);
  }
};

//get test by id
export const getTestById = async (labId: string, testId: Number): Promise<TestList> => {
  try {
    // admin/lab/2/test/6
    const response = await api.get<{ data: TestList; message: string; status: string }>(`admin/lab/${labId}/test/${testId}`);
    return response.data.data; // Extract the test object from the response
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while fetching test details.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// /lab/3/update/2
export const updateTest = async (labId: string, testId: string, test: TestList): Promise<void> => {
  try {
    await api.put(`/admin/lab/${labId}/update/${testId}`, test);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while updating test details.';

    if (error instanceof AxiosError && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};
// ======================================================== test referance range ========================================================

export const getTestReferanceRange = async (labId: string): Promise<TestReferancePoint[]> => {
  try {
    const response = await api.get<{ data: TestReferancePoint[]; message: string; status: string }>(`lab/test-reference/${labId}`);
    return response.data.data; // Extract the tests array from the response
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while fetching tests referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const updateTestReferanceRange = async (labId: string, testReferenceId: string, testref: TestReferancePoint): Promise<void> => {
  try {
    await api.put(`lab/test-reference/${labId}/${testReferenceId}`, testref);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while updating test referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const deleteTestReferanceRange = async (labId: Number, testReferenceId: Number) => {
  try {
    await api.delete(`lab/test-reference/${labId}/${testReferenceId}`);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while deleting test referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const addTestReferanceRange = async (labId: string, testref: TestReferancePoint): Promise<void> => {
  try {
    await api.post(`lab/test-reference/${labId}/add`, testref);
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while adding test referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const fetchTestReferenceRangeCsv = async (labId: string): Promise<string> => {
  try {
      const response = await api.get(`/lab/test-reference/${labId}/download`, {
          responseType: 'blob',
      });

      return response.data.text(); // Convert Blob to text and return
  } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching the test reference range.';

      if (error instanceof Error && (error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }

      throw new Error(errorMessage);
  }
};

export const uploadTestReferanceRangeCsv = async (labId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post(`/lab/test-reference/${labId}/csv/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while uploading test referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error (errorMessage);

  }
}
  

export const getTestReferanceRangeByTestName = async (labId: string, testName: string): Promise<TestReferancePoint> => {
  try {
    const response = await api.get<{ data: TestReferancePoint; message: string; status: string }>(`lab/test-reference/${labId}/test/${testName}`);
    return response.data.data; // Extract the tests array from the response
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while fetching tests referance range by test name.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}


// ======================================================== test referance range and test from master table =======================================================
export const getMasterTestsList = async (): Promise<TestList[]> => {
  try {
    const response = await api.get<{ data: TestList[]; message: string; status: string }>('super-admin/referance-and-test/test-price-list');
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


export const getMasterTestReferanceRange = async (): Promise<TestReferancePoint[]> => {
  try {
    const response = await api.get<{ data: TestReferancePoint[]; message: string; status: string }>('super-admin/referance-and-test/test-referance');
    return response.data.data; // Extract the tests array from the response
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while fetching tests referance range.';

    if (error instanceof Error && (error as any).response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const downloadMasterTestReferanceRangeCsv = async (): Promise<string> => {
  try {
      const response = await api.get(`/super-admin/referance-and-test/test-referance/download`, {
          responseType: 'blob',
      });

      return response.data.text();
  } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching the master test reference range.';

      if (error instanceof Error && (error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }

      throw new Error(errorMessage);
  }
};

// /testpricelist/download
export const downloadMasterTestPriceListCsv = async (): Promise<string> => {
  try {
      const response = await api.get(`/super-admin/referance-and-test/testpricelist/download`, {
          responseType: 'blob',
      });

      return response.data.text();
  } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching the master test price list.';

      if (error instanceof Error && (error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      throw new Error(errorMessage);
  }
};