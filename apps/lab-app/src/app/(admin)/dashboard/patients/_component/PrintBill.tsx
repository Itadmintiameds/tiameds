import Button from "@/app/(admin)/component/common/Button";
import { Bill } from '@/types/printbill/bill';
import { Document, Page } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import { CiMail } from "react-icons/ci";
import { FaCloudDownloadAlt, FaSpinner, FaWhatsapp } from "react-icons/fa";
import { toast } from 'react-toastify';
import BillingSummary from "./BillingSummary";
import Header from "./Header";
import HealthPackageDetails from "./HealthPackageDetails";
import PatientDetails from "./PatientDetails";
import TestDetails from "./TestDetails";

const PrintBill: React.FC<{ billingData: Bill }> = ({ billingData }) => {
  const [sendReportByEmail, setSendReportByEmail] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null); // Add useRef for capturing HTML element reference

  const generatePDF = async () => {
    const input = reportRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${billingData?.patient?.name || "Lab_Incoice"}.pdf`); // Use correct path to patient name
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const sendEmailInvoice = async () => {
    setSendReportByEmail(true);
    if (!billingData?.patient?.email) {
      toast.error("Patient email not available.");
      return;
    }
    const input = reportRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const pdfBlob = new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", pdfBlob, `${billingData.patient?.name || "Lab_Report"}.pdf`);
      formData.append("email", billingData.patient.email); // Ensure correct path to patient email

      const response = await fetch("/api/sendinvoice", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Report emailed successfully!");
        setSendReportByEmail(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send report via email.");
    }
  };

  return (
    <div>
      <div className="flex gap-2 justify-end my-2">
        <Button
          text=""
          onClick={generatePDF}
          className="bg-green-600 text-white p-1 text-sm rounded-lg hover:bg-green-800 transition duration-200 ease-in-out flex items-center gap-3"
        >
          <FaCloudDownloadAlt className="text-lg" />
        </Button>
        {
          sendReportByEmail ? (
            <FaSpinner className="animate-spin text-xs text-primary" />
          ) : (
            <Button
              text=""
              onClick={sendEmailInvoice}
              className="bg-blue-600 text-white p-1 text-sm rounded-lg hover:bg-blue-800 transition duration-200 ease-in-out flex items-center gap-3"
            >
              <CiMail className="text-lg" />
            </Button>
          )
        }
        <Button
          text=""
          onClick={() => window.print()}
          className="bg-green-600 text-white p-1 text-sm rounded-lg hover:bg-green-800 transition duration-200 ease-in-out flex items-center gap-3"
        >
          <FaWhatsapp className="text-lg" />
        </Button>
      </div>
      <div ref={reportRef}>
        <Document>
          <Page size="A4">
            <Header lab={billingData.lab} />
            <PatientDetails patient={billingData.patient} />
            <TestDetails tests={billingData.tests} />
            {billingData.healthPackages && (
              <HealthPackageDetails healthPackages={billingData.healthPackages} />
            )}
            <BillingSummary billingData={billingData} />
          </Page>
        </Document>
      </div>
    </div>
  );
};

export default PrintBill;

