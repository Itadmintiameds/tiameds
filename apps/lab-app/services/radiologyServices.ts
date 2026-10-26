import api from '@/utils/api';
import { AxiosError } from 'axios';

export type RadiologySignatoryRole = 'REPORTING' | 'VERIFYING';
export type RadiologyReportStatus = 'DRAFT' | 'FINAL' | 'AMENDED';

export interface RadiologySignatory {
  doctorId: number;
  role: RadiologySignatoryRole;
  sortOrder?: number;
  // Snapshot taken by the backend when the report was saved; `designation` is the doctor's speciality
  doctorName?: string;
  designation?: string | null;
  qualification?: string | null;
  licenseNumber?: string | null;
}

export interface RadiologyReport {
  id: number;
  reportCode: string;
  visitId: number;
  testId: number;
  labId: number;
  templateId?: number | null;
  status: RadiologyReportStatus;
  clinicalHistory?: string | null;
  technique?: string | null;
  comparison?: string | null;
  // Free-form findings. The report editor stores its { title, sections[] } document here.
  findingsJson: Record<string, unknown>;
  impression?: string | null;
  signatories: RadiologySignatory[];
  finalizedAt?: string | null;
  finalizedBy?: string | null;
  version: number;
}

export interface SaveRadiologyReportPayload {
  clinicalHistory?: string;
  technique?: string;
  comparison?: string;
  findingsJson: Record<string, unknown>;
  impression?: string;
  signatories: { doctorId: number; role: RadiologySignatoryRole }[];
  // Required when updating an existing report; must be the version last read
  version?: number;
  // Required when changing a FINAL / AMENDED report
  reason?: string;
}

export interface RadiologyFormatSummary {
  id: number;
  documentName: string;
  contentType?: string | null;
  fileSize?: number;
  doctorId?: number | null;
  doctorName?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
}

// Text and tables of the uploaded Word file, in document order (formatting is not kept)
export type RadiologyFormatBlock =
  | { type: 'paragraph'; text: string; style?: string }
  | { type: 'table'; rows: string[][] };

export interface RadiologyFormatContent {
  id: number;
  documentName: string;
  doctorId?: number | null;
  doctorName?: string | null;
  uploadedAt?: string | null;
  // null for formats uploaded before the backend stored parsed content, or files it could not read
  content: { blocks: RadiologyFormatBlock[] } | null;
}

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) return error.response?.data?.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
};

const reportUrl = (labId: number | string, visitId: number | string, testId: number | string) =>
  `/lab/${labId}/radiology/visit/${visitId}/test/${testId}/report`;

// Returns null when the test has no radiology report yet
export const getRadiologyReport = async (
  labId: number | string,
  visitId: number | string,
  testId: number | string
): Promise<RadiologyReport | null> => {
  try {
    const response = await api.get(reportUrl(labId, visitId, testId));
    return response.data?.data ?? null;
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to fetch the radiology report'));
  }
};

export const listRadiologyReportsForVisit = async (
  labId: number | string,
  visitId: number | string
): Promise<RadiologyReport[]> => {
  try {
    const response = await api.get(`/lab/${labId}/radiology/visit/${visitId}/reports`);
    return response.data?.data ?? [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to fetch the radiology reports'));
  }
};

export const saveRadiologyReport = async (
  labId: number | string,
  visitId: number | string,
  testId: number | string,
  payload: SaveRadiologyReportPayload
): Promise<RadiologyReport> => {
  try {
    const response = await api.put(reportUrl(labId, visitId, testId), payload);
    return response.data?.data;
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to save the radiology report'));
  }
};

export const finalizeRadiologyReport = async (
  labId: number | string,
  visitId: number | string,
  testId: number | string,
  version?: number
): Promise<RadiologyReport> => {
  try {
    const response = await api.post(`${reportUrl(labId, visitId, testId)}/finalize`, { version });
    return response.data?.data;
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to finalize the radiology report'));
  }
};

// ---------------------------------------------------------------- report formats

const formatsUrl = (labId: number | string) => `/lab/${labId}/radiology/report-formats`;

export const listRadiologyFormats = async (labId: number | string): Promise<RadiologyFormatSummary[]> => {
  try {
    const response = await api.get(formatsUrl(labId));
    return response.data?.data ?? [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to fetch the report formats'));
  }
};

export const getRadiologyFormat = async (
  labId: number | string,
  formatId: number | string
): Promise<RadiologyFormatContent> => {
  try {
    const response = await api.get(`${formatsUrl(labId)}/${formatId}`);
    return response.data?.data;
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to fetch the report format'));
  }
};

// The format is saved under `documentName` (defaults to the file name) and then appears in the list
export const uploadRadiologyFormat = async (
  labId: number | string,
  file: File,
  options: { documentName?: string; doctorId?: number; doctorName?: string } = {}
): Promise<{ id: number; documentName: string; contentParsed: boolean }> => {
  const form = new FormData();
  form.append('file', file);
  if (options.documentName) form.append('documentName', options.documentName);
  if (options.doctorId) form.append('doctorId', String(options.doctorId));
  if (options.doctorName) form.append('doctorName', options.doctorName);
  try {
    const response = await api.post(formatsUrl(labId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data;
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to upload the report format'));
  }
};
