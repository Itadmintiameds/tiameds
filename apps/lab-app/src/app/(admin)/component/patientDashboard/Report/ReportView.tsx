import CommonReportView from "./CommonReportView";
import { PatientData } from "@/types/sample/sample";

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData;
}

const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
    return (
        <CommonReportView
            visitId={viewReportDetailsbyId}
            patientData={viewPatient}
        />
    );
};

export default ReportView;














