// import { jsPDF } from "jspdf";

// interface PrintBillProps {
//   billingData: any;  // Define the expected type for billingData
// }

// const PrintBill: React.FC<PrintBillProps> = ({ billingData }) => {

//   const handlePrint = () => {
//     const doc = new jsPDF();

//     // Page Setup
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(14);

//     // Header Section
//     doc.setFontSize(18);
//     doc.text("Billing Invoice", 105, 10, { align: "center" });
//     doc.setFontSize(12);

//     // Lab Details Section
//     doc.text("Lab Details", 10, 20);
//     doc.text(`Lab Name: ${billingData.lab.name}`, 10, 30);
//     doc.text(`Address: ${billingData.lab.address}`, 10, 40);
//     doc.text(`Phone: ${billingData.lab.phone}`, 10, 50);
//     doc.text(`Email: ${billingData.lab.email}`, 10, 60);
//     doc.text(`GSTN: ${billingData.lab.gstn}`, 10, 70);

//     doc.setLineWidth(0.5);
//     doc.line(10, 75, 200, 75); // Horizontal line for separation

//     // Patient & Doctor Details Section
//     doc.setFontSize(14);
//     doc.text("Patient & Doctor Details", 10, 85);
//     doc.setFontSize(12);
//     doc.text(`Patient Name: ${billingData.patient.name}`, 10, 95);
//     doc.text(`Age: ${billingData.patient.age}`, 10, 105);
//     doc.text(`Blood Group: ${billingData.patient.bloodGroup}`, 10, 115);
//     doc.text(`Phone: ${billingData.patient.phone}`, 10, 125);
//     doc.text(`Email: ${billingData.patient.email}`, 10, 135);
//     doc.text(`Address: ${billingData.patient.address}`, 10, 145);

//     doc.text(`Doctor Name: ${billingData.doctor.name}`, 110, 95);
//     doc.text(`Specialization: ${billingData.doctor.specialization}`, 110, 105);
//     doc.text(`Doctor Phone: ${billingData.doctor.phone}`, 110, 115);

//     doc.setLineWidth(0.5);
//     doc.line(10, 150, 200, 150); // Horizontal line for separation

//     // Visit Information Section
//     doc.setFontSize(14);
//     doc.text("Visit Information", 10, 160);
//     doc.setFontSize(12);
//     doc.text(`Visit Date: ${billingData.visitDate}`, 10, 170);
//     doc.text(`Visit Type: ${billingData.visitType}`, 10, 180);
    
//     doc.setLineWidth(0.5);
//     doc.line(10, 185, 200, 185); // Horizontal line for separation

//     // Tests and Packages Section
//     doc.setFontSize(14);
//     doc.text("Tests / Packages", 10, 195);
//     let yPosition = 205;
    
//     // Adding Tests
//     if (billingData.tests && billingData.tests.length > 0) {
//       billingData.tests.forEach((test: any) => {
//         doc.text(`Test Name: ${test.name}`, 10, yPosition);
//         doc.text(`Price: ₹${test.price}`, 150, yPosition);
//         yPosition += 10;
//       });
//     }

//     // Adding Health Packages
//     if (billingData.healthPackages && billingData.healthPackages.length > 0) {
//       billingData.healthPackages.forEach((pkg: any) => {
//         doc.text(`Package Name: ${pkg.packageName}`, 10, yPosition);
//         doc.text(`Price: ₹${pkg.price}`, 150, yPosition);
//         doc.text(`Discount: ₹${pkg.discount}`, 180, yPosition);
//         doc.text(`Net Price: ₹${pkg.netPrice}`, 200, yPosition);
//         yPosition += 10;

//         // List of tests within the package
//         pkg.tests.forEach((test: any) => {
//           doc.text(`Test: ${test.name}`, 20, yPosition);
//           doc.text(`Price: ₹${test.price}`, 150, yPosition);
//           yPosition += 10;
//         });
//       });
//     }

//     doc.setLineWidth(0.5);
//     doc.line(10, yPosition, 200, yPosition); // Horizontal line for separation

//     // Billing Information Section
//     doc.setFontSize(14);
//     doc.text("Billing Information", 10, yPosition + 10);
//     doc.setFontSize(12);
//     doc.text(`Billing ID: ${billingData.billingId}`, 10, yPosition + 20);
//     doc.text(`Payment Status: ${billingData.paymentStatus}`, 10, yPosition + 30);
//     doc.text(`Payment Method: ${billingData.paymentMethod}`, 10, yPosition + 40);
//     doc.text(`Payment Date: ${billingData.paymentDate}`, 10, yPosition + 50);
//     doc.text(`Discount: ₹${billingData.discount}`, 10, yPosition + 60);
//     doc.text(`GST Rate: ${billingData.gstRate}%`, 10, yPosition + 70);
//     doc.text(`GST Amount: ₹${billingData.gstAmount}`, 10, yPosition + 80);
//     doc.text(`CGST Amount: ₹${billingData.cgstAmount}`, 10, yPosition + 90);
//     doc.text(`SGST Amount: ₹${billingData.sgstAmount}`, 10, yPosition + 100);
//     doc.text(`IGST Amount: ₹${billingData.igstAmount}`, 10, yPosition + 110);
//     doc.text(`Net Amount: ₹${billingData.netAmount}`, 10, yPosition + 120);
//     doc.text(`Total Amount: ₹${billingData.totalAmount}`, 10, yPosition + 130);

//     // Footer Section (optional)
//     doc.setFontSize(10);
//     doc.text("Thank you for choosing our services.", 10, yPosition + 140);
//     doc.text("For queries, contact us at: support@example.com", 10, yPosition + 150);

//     // Save the generated PDF
//     doc.save('billing-invoice.pdf');
//   };

//   return (
//     <div>
//       <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 text-white">
//         Print Bill
//       </button>
//     </div>
//   );
// };

// export default PrintBill;
