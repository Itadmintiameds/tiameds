import CommonReportViewWrapper from "./CommonReportViewWrapper";
import { PatientData } from "@/types/sample/sample";

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData;
    doctorName?: string;
}

const ReportView = ({ viewReportDetailsbyId, viewPatient, doctorName }: ReportViewProps) => {
    return (
        <CommonReportViewWrapper
            visitId={viewReportDetailsbyId}
            patientData={viewPatient}
            doctorName={doctorName}
        />
    );
};

export default ReportView;














