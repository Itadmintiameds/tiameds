import { StyleSheet, Text, View } from "@react-pdf/renderer";

const patientStyles = StyleSheet.create({
  patientDetails: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  patientSubHeader: {
    fontSize: 14,
    color: "#34495e",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    textDecoration: "underline",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    width: "23%", // 4 columns with equal width (24% for a small margin)
  },
  boldText: {
    fontWeight: "bold",
    color: "#2c3e50",
    fontSize: 10,
    marginBottom: 4,
  },
  patientDetailText: {
    fontSize: 10,
    color: "#7f8c8d",
    wordWrap: "break-word",
  },
});

interface Patient {
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  Gender: string;
}

const PatientDetails = ({ patient }: { patient: Patient }) => {
  return (
    <View style={patientStyles.patientDetails}>
      <Text style={patientStyles.patientSubHeader}>Patient Details</Text>

      {/* First Row */}
      <View style={patientStyles.row}>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Name:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.name}</Text>
        </View>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Age:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.age}</Text>
        </View>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Phone:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.phone}</Text>
        </View>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Gender:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.Gender}</Text>
        </View>
      </View>

      {/* Second Row */}
      <View style={patientStyles.row}>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Email:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.email}</Text>
        </View>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Blood Group:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.bloodGroup}</Text>
        </View>
        <View style={patientStyles.column}>
          <Text style={patientStyles.boldText}>Address:</Text>
          <Text style={patientStyles.patientDetailText}>{patient.address}</Text>
        </View>
        {/* Empty column to maintain 4-column layout */}
        <View style={patientStyles.column}></View>
      </View>
    </View>
  );
};

export default PatientDetails;
