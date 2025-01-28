import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

// Compact billing summary styles
const billingSummaryStyles = StyleSheet.create({
  billingSummary: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12, // Reduced margin for compactness
    padding: 8, // Reduced padding
    backgroundColor: "#f9f9f9", // Subtle background
    borderRadius: 6, // Smaller border radius
    borderWidth: 1,
    borderColor: "#ddd", // Light border color
  },
  billingSummarySubHeader: {
    fontSize: 14, // Smaller font size for the header
    color: "#2c3e50", // Blue color for the subheader
    textDecoration: "underline",
    fontWeight: "bold",
    marginBottom: 8, // Reduced margin
    textAlign: "center",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    width: "32%", // Columns take 1/3 of the space each
    marginBottom: 6, // Reduced margin for compactness
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 11, // Reduced font size
    marginBottom: 3, // Reduced margin for compactness
  },
  text: {
    fontSize: 11, // Consistent font size for all text
    color: "#555",
    marginBottom: 3, // Reduced margin for a compact design
  },
  footerText: {
    fontSize: 10, // Smaller footer text
    color: "#888", // Lighter text for footer information
    textAlign: "center",
    marginTop: 10, // Reduced space after the table
  },
});




interface BillingData {
  totalAmount: number;
  discount: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  netAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
}

const BillingSummary: React.FC<{ billingData: BillingData }> = ({ billingData }) => {
  return (
    <View style={billingSummaryStyles.billingSummary}>
      <Text style={billingSummaryStyles.billingSummarySubHeader}>Billing Summary</Text>
      <View style={billingSummaryStyles.row}>
        <View style={billingSummaryStyles.column}>
          <Text style={billingSummaryStyles.boldText}>Total Amount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.totalAmount}</Text>
          <Text style={billingSummaryStyles.boldText}>Discount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.discount}</Text>
          <Text style={billingSummaryStyles.boldText}>GST Rate:</Text>
          <Text style={billingSummaryStyles.text}>{billingData.gstRate}%</Text>
        </View>
        <View style={billingSummaryStyles.column}>
          <Text style={billingSummaryStyles.boldText}>GST Amount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.gstAmount}</Text>
          <Text style={billingSummaryStyles.boldText}>CGST Amount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.cgstAmount}</Text>
          <Text style={billingSummaryStyles.boldText}>SGST Amount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.sgstAmount}</Text>
        </View>
        <View style={billingSummaryStyles.column}>
          <Text style={billingSummaryStyles.boldText}>Net Amount:</Text>
          <Text style={billingSummaryStyles.text}>₹{billingData.netAmount}</Text>
          <Text style={billingSummaryStyles.boldText}>Payment Status:</Text>
          <Text style={billingSummaryStyles.text}>{billingData.paymentStatus}</Text>
          <Text style={billingSummaryStyles.boldText}>Payment Method:</Text>
          <Text style={billingSummaryStyles.text}>{billingData.paymentMethod}</Text>
        </View>
      </View>
      <Text style={billingSummaryStyles.footerText}>Payment Date: {billingData.paymentDate}</Text>
    </View>
  );
};

export default BillingSummary;
