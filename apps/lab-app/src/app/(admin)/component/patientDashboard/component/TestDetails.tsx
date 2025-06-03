import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

// Test Details Styles
const testStyles = StyleSheet.create({
  testDetails: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15, // Reduced margin for compactness
    padding: 10, // Reduced padding for a more compact layout
    backgroundColor: "#ffffff", // White background for a clean look
    borderRadius: 6, // Slightly smaller border radius
    borderWidth: 1,
    borderColor: "#e0e0e0", // Subtle light gray border
  },
  testSubHeader: {
    fontSize: 14, // Slightly smaller font size for the subheader
    color: "#2c3e50", // Darker shade for better contrast
    textDecoration: "underline",
    fontWeight: "bold",
    marginBottom: 8, // Reduced margin for compactness
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse", // Ensures no space between table cells
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 6, // Reduced padding for compactness
  },
  tableHeaderCell: {
    width: "50%", // Equal width for columns
    fontWeight: "bold",
    fontSize: 10, // Smaller font size for header
    color: "#34495e", // Darker header text color
    padding: 8, // Reduced padding for a more compact feel
    textAlign: "left", // Align text to the left for readability
    backgroundColor: "#ecf0f1", // Light gray background for the header
  },
  tableCell: {
    width: "50%",
    fontSize: 10, // Smaller font for text
    color: "#7f8c8d", // Softer text color for readability
    padding: 8, // Reduced padding for better compactness
    textAlign: "left", // Left-aligned text
  },
  divider: {
    marginVertical: 8, // Reduced space between sections for compactness
    borderBottom: "1px solid #ddd", // Thin divider for separation
  },
});

interface Test {
  name: string;
  price: number;
}

interface TestDetailsProps {
  tests: Test[];
}

const TestDetails: React.FC<TestDetailsProps> = ({ tests }) => {
  return (
    <View style={testStyles.testDetails}>
      <Text style={testStyles.testSubHeader}>Test Details</Text>
      <View style={testStyles.divider} /> {/* Divider line between header and table */}
      <View style={testStyles.table}>
        <View style={testStyles.tableRow}>
          <Text style={testStyles.tableHeaderCell}>Test Name</Text>
          <Text style={testStyles.tableHeaderCell}>Price</Text>
        </View>
        {tests.map((test, index) => (
          <View style={testStyles.tableRow} key={index}>
            <Text style={testStyles.tableCell}>{test.name}</Text>
            <Text style={testStyles.tableCell}>₹{test.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TestDetails;
