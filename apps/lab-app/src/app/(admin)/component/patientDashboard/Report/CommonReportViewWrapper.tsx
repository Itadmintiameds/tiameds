import { useEffect, useState } from "react";
import { useLabs } from "@/context/LabContext";
import { getReportData } from "../../../../../../services/reportServices";
import { PatientData } from "@/types/sample/sample";
import CommonReportView from "./CommonReportView";
import CommonReportView2 from "./CommonReportView2";
import type { ConsolidatedReport } from "./CommonReportView2";
import { TbInfoCircle } from "react-icons/tb";

interface CommonReportViewWrapperProps {
    visitId: number;
    patientData: PatientData;
    doctorName?: string;
    hidePrintButton?: boolean;
}

interface ApiReport {
    reportId: number;
    testRows?: unknown;
    reportCode?: string;
    patientCode?: string;
    visitCode?: string;
}

const CommonReportViewWrapper = (props: CommonReportViewWrapperProps) => {
    const { visitId } = props;
    const { currentLab } = useLabs();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [reports, setReports] = useState<ConsolidatedReport[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentLab?.id || !visitId) return;
            setLoading(true);
            setError(undefined);
            try {
                const response = await getReportData(currentLab.id.toString(), visitId.toString());
                if (Array.isArray(response)) {
                    setReports(response as unknown as ConsolidatedReport[]);
                } else {
                    setReports(null);
                }
            } catch (err) {
                setError("Failed to load report data");
                setReports(null);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentLab?.id, visitId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading report..</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <TbInfoCircle className="mb-4 text-5xl text-red-500" />
                <h3 className="mb-2 text-xl font-bold text-gray-700">Unable to load report</h3>
                <p className="max-w-md text-gray-600">{error}</p>
            </div>
        );
    }

    // Check if any report has testRows with more than 1 item (new consolidated format)
    // OR if reports have the new format fields (reportCode, patientCode, visitCode) with testRows array
    const isNewFormat = (() => {
        if (!Array.isArray(reports) || reports.length === 0) return false;
        
        // Check if ANY report has testRows with length > 1
        const hasMultiRowReport = reports.some((report) => {
            const testRows = (report as ApiReport).testRows;
            return Array.isArray(testRows) && (testRows as unknown[]).length > 1;
        });
        
        if (hasMultiRowReport) return true;
        
        // Check if reports have new format fields (reportCode, patientCode, visitCode) and testRows array exists
        const hasNewFormatFields = reports.some((report) => {
            const apiReport = report as ApiReport;
            return (
                Array.isArray(apiReport.testRows) &&
                (apiReport.reportCode || apiReport.patientCode || apiReport.visitCode)
            );
        });
        
        return hasNewFormatFields;
    })();

    if (isNewFormat && Array.isArray(reports)) {
        return <CommonReportView2 {...props} reportsData={reports} />;
    }

    return <CommonReportView {...props} />;
};

export default CommonReportViewWrapper;

