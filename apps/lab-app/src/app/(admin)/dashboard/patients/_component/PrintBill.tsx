import { Document, Page } from "@react-pdf/renderer";
import React from "react";
import BillingSummary from "./BillingSummary";
import Header from "./Header";
import HealthPackageDetails from "./HealthPackageDetails";
import PatientDetails from "./PatientDetails";
import TestDetails from "./TestDetails";





const PrintBill: React.FC<{ billingData }> = ({ billingData }) => {
  console.log(billingData, "billingData");
  return (
    <Document>
      <Page size="A4">
        <Header lab={billingData.lab} />
        <PatientDetails patient={billingData.patient} />
        <TestDetails tests={billingData.tests} />
        <HealthPackageDetails healthPackages={billingData.healthPackages} />
        <BillingSummary billingData={billingData} />
      </Page>
    </Document>
  );
};
export default PrintBill;








// import React, { useRef } from "react";
// import { Document, Page, PDFViewer } from "@react-pdf/renderer";
// import BillingSummary from "./BillingSummary";
// import Header from "./Header";
// import HealthPackageDetails from "./HealthPackageDetails";
// import PatientDetails from "./PatientDetails";
// import TestDetails from "./TestDetails";
// import { IoIosPrint } from "react-icons/io";

// const PrintBill: React.FC<{ billingData: any }> = ({ billingData }) => {
//   const componentRef = useRef<any>(null);

//   const handlePrint = () => {
//     const printWindow = window.open("", "_blank");
//     const printContent = componentRef.current?.innerHTML;

//     if (printWindow && printContent) {
//       printWindow.document.write(`
//         <html>
//           <head>
//             <title>Print Bill</title>
//           </head>
//           <body>
//             <div>${printContent}</div>
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//       printWindow.print();
//     }
//   };

//   return (
//     <div>
//       {/* Button to trigger the print dialog */}
//       <button  className="bg-primary text-white px-4 py-2 rounded text-xs my-2 flex items-center"
//       onClick={handlePrint}>
//         <IoIosPrint className="mr-2" />
//         Print Bill</button>

//       {/* View the bill in the browser using PDFViewer */}
//       <div style={{ marginBottom: 20 }}>
//         <PDFViewer width="100%" height="600px">
//           <Document>
//             <Page size="A4">
//               <Header lab={billingData.lab} />
//               <PatientDetails patient={billingData.patient} />
//               <TestDetails tests={billingData.tests} />
//               <HealthPackageDetails healthPackages={billingData.healthPackages} />
//               <BillingSummary billingData={billingData} />
//             </Page>
//           </Document>
//         </PDFViewer>
//       </div>
//     </div>
//   );
// };

// export default PrintBill;
