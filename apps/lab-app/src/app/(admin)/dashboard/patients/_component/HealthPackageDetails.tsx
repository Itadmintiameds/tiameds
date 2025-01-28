import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

// Define types for the test and health package details
interface Test {
  name: string;
  category: string;
  price: number;
}

interface HealthPackage {
  packageName: string;
  price: number;
  discount: number;
  netPrice: number;
  tests: Test[];
}

// Props type for HealthPackageDetails component
interface HealthPackageDetailsProps {
  healthPackages: HealthPackage[];
}

// Health Package Styles
const healthPackageStyles = StyleSheet.create({
  healthPackageDetails: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  healthPackageSubHeader: {
    fontSize: 14,
    color: "#2c3e50",
    textDecoration: "underline",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 6,
  },
  tableHeaderCell: {
    width: "33%",
    fontWeight: "bold",
    fontSize: 10,
    color: "#34495e",
    padding: 8,
    textAlign: "left",
    backgroundColor: "#ecf0f1",
  },
  tableCell: {
    width: "33%",
    fontSize: 10,
    color: "#7f8c8d",
    padding: 8,
    textAlign: "left",
  },
  divider: {
    marginVertical: 8,
    borderBottom: "1px solid #ddd",
  },
});

const HealthPackageDetails: React.FC<HealthPackageDetailsProps> = ({ healthPackages }) => {
  return (
    <View style={healthPackageStyles.healthPackageDetails}>
      <Text style={healthPackageStyles.healthPackageSubHeader}>Health Package Details</Text>
      <View style={healthPackageStyles.divider} />
      {healthPackages.map((pkg, index) => (
        <View key={index}>
          <View style={healthPackageStyles.table}>
            <View style={healthPackageStyles.tableRow}>
              <Text style={healthPackageStyles.tableHeaderCell}>Package Name</Text>
              <Text style={healthPackageStyles.tableHeaderCell}>Price</Text>
              <Text style={healthPackageStyles.tableHeaderCell}>Discount</Text>
              <Text style={healthPackageStyles.tableHeaderCell}>Net Price</Text>
            </View>
            <View style={healthPackageStyles.tableRow}>
              <Text style={healthPackageStyles.tableCell}>{pkg.packageName}</Text>
              <Text style={healthPackageStyles.tableCell}>₹{pkg.price}</Text>
              <Text style={healthPackageStyles.tableCell}>₹{pkg.discount}</Text>
              <Text style={healthPackageStyles.tableCell}>₹{pkg.netPrice}</Text>
            </View>
          </View>
          <View style={healthPackageStyles.divider} />
          <View style={healthPackageStyles.table}>
            <View style={healthPackageStyles.tableRow}>
              <Text style={healthPackageStyles.tableHeaderCell}>Test Name</Text>
              <Text style={healthPackageStyles.tableHeaderCell}>Category</Text>
              <Text style={healthPackageStyles.tableHeaderCell}>Price</Text>
            </View>
            {pkg.tests.map((test, testIndex) => (
              <View style={healthPackageStyles.tableRow} key={testIndex}>
                <Text style={healthPackageStyles.tableCell}>{test.name}</Text>
                <Text style={healthPackageStyles.tableCell}>{test.category}</Text>
                <Text style={healthPackageStyles.tableCell}>₹{test.price}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default HealthPackageDetails;
