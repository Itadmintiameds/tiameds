import api from '@/utils/api';
import { AxiosError } from 'axios';
import {
  ReportSettingsPayload,
  ReportSettingsResponse,
} from '@/types/reportSettings';
import { AiClinicalObservation } from '@/types/aiInsights';

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

export const getReportDataById = async (labId: string, reportId: string): Promise<Report | Report[]> => {
  try {
    const response = await api.get<{ data: Report | Report[]; message: string; status: string }>(
      `/lab/${labId}/report/by-id/${reportId}`
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


/*  OLD ONE API FOR REPORT  */
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

/* NEW ONE API FOR REPORT WITH TEST RESULT -- USE THIS ONE */
export const createReportWithTestResult = async (labId: string, reportPayload: { testData: ReportData[]; testResult: { testId: number; isFilled: boolean } }): Promise<ReportData[]> => {
  try {
    const response = await api.post<{ data: ReportData[]; message: string; status: string }>(`lab/${labId}/report`, reportPayload);
    return response.data.data; 
  } catch (error: unknown) {
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

    throw new Error(errorMessage);
  }
};

export const updateReportById = async (labId: number, reportId: string, reports: ReportData[]): Promise<ReportData[]> => {
  try {
    const invalidReports = reports.filter(report => !report.report_id);
    if (invalidReports.length > 0) {
      throw new Error('All reports must have report_id for updates');
    }

    const response = await api.put<{ data: ReportData[] }>(`/lab/${labId}/report/by-id/${reportId}`, reports);
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

    throw new Error(errorMessage);
  }
};

// ─── Report Settings ────────────────────────────────────────────────────────────

export const getReportSettings = async (labId: number): Promise<ReportSettingsResponse> => {
  try {
    const response = await api.get<{ data: ReportSettingsResponse; message: string; status: string }>(
      `/lab/${labId}/report-settings`
    );
    return response.data.data;
  } catch (error) {
    let errorMessage = 'An error occurred while fetching report settings.';

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

export const saveReportSettings = async (
  labId: number,
  payload: ReportSettingsPayload
): Promise<ReportSettingsResponse> => {
  try {
    const response = await api.post<{ data: ReportSettingsResponse; message: string; status: string }>(
      `/lab/${labId}/report-settings`,
      payload
    );
    return response.data.data;
  } catch (error) {
    let errorMessage = 'An error occurred while saving report settings.';

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

export const updateReportSettings = async (
  labId: number,
  payload: ReportSettingsPayload
): Promise<ReportSettingsResponse> => {
  try {
    const response = await api.put<{ data: ReportSettingsResponse; message: string; status: string }>(
      `/lab/${labId}/report-settings`,
      payload
    );
    return response.data.data;
  } catch (error) {
    let errorMessage = 'An error occurred while updating report settings.';

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

// ─── AI Clinical Observations ───────────────────────────────────────────────────

/**
 * AiClinicalObservationController#getObservations answers with *every* row it holds for
 * the visit, because its POST appends a new row instead of replacing the existing one.
 * Take the most recent -- that is the text the report was last generated from. A bare
 * object is accepted too, so this keeps working unchanged once the backend upserts into
 * a single record and returns it directly.
 */
const pickLatestObservation = (payload: unknown): AiClinicalObservation | null => {
  if (!payload || typeof payload !== 'object') return null;
  if (!Array.isArray(payload)) return payload as AiClinicalObservation;

  const rows = payload.filter(
    (row): row is AiClinicalObservation & { createdAt?: string } => !!row && typeof row === 'object'
  );
  if (rows.length === 0) return null;

  // Rows are appended, so insertion order is already newest-last; createdAt only has to
  // break the tie when the backend returns them in some other order. `>=` keeps the
  // later element on equal timestamps, preserving that insertion order.
  const createdAtMs = (row: { createdAt?: string }) => new Date(row.createdAt ?? 0).getTime() || 0;
  return rows.reduce((latest, row) => (createdAtMs(row) >= createdAtMs(latest) ? row : latest));
};

/**
 * Read the AI Clinical Observations stored against a visit, or null when none have
 * been generated yet. This is what makes the observations universal: whichever device
 * generates them first writes them here, and every later open — on any device, by any
 * user — reads that same text back instead of paying for another model call.
 */
export const getAiClinicalObservation = async (
  labId: number | string,
  visitId: number | string
): Promise<AiClinicalObservation | null> => {
  try {
    const response = await api.get(`/lab/${labId}/visit/${visitId}/ai-clinical-observation`);

    // The backend wraps payloads in {data, message, status}; unwrap that, but fall back
    // to a bare body so this keeps working either way. An empty list (the no-record
    // case, which this controller answers with 200 rather than 404) yields null.
    const body = response.data as { data?: unknown } | null;
    const payload = body && typeof body === 'object' && 'data' in body ? body.data : body;
    return pickLatestObservation(payload);
  } catch (error) {
    // No record yet is the normal first-open case, not a failure.
    if (error && (error as AxiosError).isAxiosError && (error as AxiosError).response?.status === 404) {
      return null;
    }

    let errorMessage = 'An error occurred while fetching AI clinical observations.';

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

/** Persist freshly generated AI Clinical Observations against a visit. */
export const saveAiClinicalObservation = async (
  labId: number | string,
  visitId: number | string,
  payload: AiClinicalObservation
): Promise<void> => {
  try {
    await api.post(`/lab/${labId}/visit/${visitId}/ai-clinical-observation`, payload);
  } catch (error) {
    let errorMessage = 'An error occurred while saving AI clinical observations.';

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

/**
 * Get a presigned S3 URL for uploading a report signature image.
 * Backend returns uploadUrl (for direct PUT) and fileUrl (final URL to store).
 * Frontend uploads the file directly to S3 using the presigned URL.
 */
export const getReportSignatureUploadUrl = async (
  labId: number | string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string; headers?: Record<string, string> }> => {
  try {
    const response = await api.post<{
      data: { uploadUrl: string; fileUrl: string; headers?: Record<string, string> };
      message: string;
      status: string;
    }>(`/lab/${labId}/report-settings/signature/upload-url`, {
      fileName,
      fileType,
    });
    return response.data.data;
  } catch (error) {
    let errorMessage = 'An error occurred while generating signature upload URL.';

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