import CommonReportViewWrapper from "./CommonReportViewWrapper";
import { PatientData } from "@/types/sample/sample";

// The single report-view entry point for the whole app. Patient Dashboard
// (PatientVisitListTable) and Sample Management (CompletedTable / CollectionTable /
// LabReport) both render this, so a report looks and behaves identically wherever it
// is opened from -- same Health Snapshot, same AI Clinical Observations, same cache.
// Sample Management imports it via the `Report/ViewReport` re-export.
interface ReportViewProps {
    viewPatient: PatientData | null;
    doctorName?: string;
    hidePrintButton?: boolean;
}

const ReportView = ({ viewPatient, doctorName, hidePrintButton = false }: ReportViewProps) => {
    if (!viewPatient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">No patient data available</p>
                </div>
            </div>
        );
    }

    return (
        <CommonReportViewWrapper
            visitId={viewPatient.visitId}
            patientData={viewPatient}
            doctorName={doctorName ?? viewPatient.doctorName}
            hidePrintButton={hidePrintButton}
        />
    );
};

export default ReportView;
