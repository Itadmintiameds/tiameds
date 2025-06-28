import api from '@/utils/api';
import { AxiosError } from 'axios';

interface Report {
  reportId: number;
  id?: string; // Optional if sometimes present
  visitId: number;
  visit_id?: string; // Alternative to visitId
  testName: string;
  testCategory: string;
  labId: number;
  patientName?: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange?: string;
  referenceDataAge?: string; // Alternative to referenceAgeRange
  enteredValue: string;
  unit: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}
interface ReportData {
  report_id?: string; // Optional for create, required for update
  visit_id: string;
  testName: string;
  testCategory: string;
  patientName: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange: string;
  enteredValue: string;
  unit: string;
}

// export const getReportData = async (labId: string, visitId: string): Promise<Report[]> => {
//   try {
//     const response = await api.get<{ data: Report[]; message: string; status: string }>(`lab/${labId}/report/${visitId}`);
//     return response.data.data; // Extract the array of reports from the response
//   } catch (error: unknown) {
//     let errorMessage = 'An error occurred while fetching report details.';

//     if (error instanceof Error) {
//       const axiosError = error as { response?: { data?: { message?: string } } };
//       if (axiosError.response?.data?.message) {
//         errorMessage = axiosError.response.data.message;
//       } else {
//         errorMessage = error.message;
//       }
//     }
//     throw new Error(errorMessage);
//   }
// };

export const getReportData = async (labId: string, visitId: string): Promise<Report[]> => {
  try {
    const response = await api.get<{ data: Report[]; message: string; status: string }>(
      `lab/${labId}/report/${visitId}`
    );
    return response.data.data;
  } catch (error) {
    let errorMessage = 'An error occurred while fetching report details.';

    if (error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const createReport = async (labId: string, reportData: ReportData[]): Promise<ReportData[]> => {
  try {
    const response = await api.post<{ data: ReportData[]; message: string; status: string }>(`lab/${labId}/report`, reportData);
    return response.data.data; // Return the created reports
  }
  catch (error: unknown) {
    let errorMessage = 'An error occurred while creating the report.';

    if (error instanceof Error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = error.message;
      }
    }

    throw new Error(errorMessage);
  }
}

// update the report by id only one feild of the status is updated  is patch method
export const createReportbyId = async (labId: string, visitId: string) => {
  try {
    const response = await api.put<{ data: ReportData; message: string; status: string }>(
      `lab/${labId}/complete-visit/${visitId}`
    );
    return response.data.data; // Return the created report
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while creating the report by ID.';

    if (error instanceof Error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
};

// cancel the report by id
export const cancelReportById = async (labId: string, visitId: string) => {
  try {
    const response = await api.put<{ data: ReportData; message: string; status: string }>(
      `lab/${labId}/cancled-visit/${visitId}`
    );
    return response.data.data; // Return the canceled report
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while canceling the report by ID.';

    if (error instanceof Error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
};


export const updateReports = async (labId: number, reports: ReportData[]): Promise<ReportData[]> => {
  try {
    const invalidReports = reports.filter(report => !report.report_id);
    if (invalidReports.length > 0) {
      throw new Error('All reports must have report_id for updates');
    }
    console.log('Sending update payload:', reports); // Debug log
    const response = await api.put<{ data: ReportData[] }>(`lab/${labId}/report`, reports);
    return response.data.data;
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while updating the report.';

    if (error instanceof Error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = error.message;
      }
    }
    console.error('Error updating reports:', error);
    throw new Error(errorMessage);
  }
};