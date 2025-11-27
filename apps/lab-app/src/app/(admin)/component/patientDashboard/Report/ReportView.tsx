import CommonReportViewWrapper from "./CommonReportViewWrapper";
import { PatientData } from "@/types/sample/sample";

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData;
}

const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
    return (
        <CommonReportViewWrapper
            visitId={viewReportDetailsbyId}
            patientData={viewPatient}
        />
    );
};

export default ReportView;














