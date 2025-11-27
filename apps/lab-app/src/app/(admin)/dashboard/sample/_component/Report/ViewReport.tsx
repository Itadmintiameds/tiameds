import CommonReportViewWrapper from "../../../../component/patientDashboard/Report/CommonReportViewWrapper";
import { PatientData } from "@/types/sample/sample";

interface ViewReportProps {
    viewPatient: PatientData | null;
    hidePrintButton?: boolean;
}

const ViewReport = ({ viewPatient, hidePrintButton = false }: ViewReportProps) => {
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
            doctorName={viewPatient.doctorName}
            hidePrintButton={hidePrintButton}
        />
    );
};

export default ViewReport;