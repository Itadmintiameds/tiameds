
import api from '@/utils/api';

interface Report {
  reportId: number;
  visitId: number;
  testName: string;
  testCategory: string;
  labId: number;
  referenceDescription: string;
  referenceRange : string;
  referenceDataAge: string;
  enteredValue: string;
  unit: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface ReportData {
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



export const getReportData = async (labId: string, visitId: string): Promise<Report []> => {
    try {
      const response = await api.get<{ data: Report[]; message: string; status: string }>(`lab/${labId}/report/${visitId}`);
      return response.data.data; // Extract the array of reports from the response
    } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching report details.';
  
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
  


export  const createReport = async (labId: string, reportData: ReportData []): Promise<ReportData  []> => {
   try {
    const response = await api.post<{ data: ReportData  []; message: string; status: string }>(`lab/${labId}/report`, reportData);
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


