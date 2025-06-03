import React from 'react';
import Image from 'next/image';
import { CSSProperties } from 'react';

const styles: { [key: string]: CSSProperties } = {
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "10px 20px",
    borderBottom: "1px solid #e0e0e0",
    justifyContent: "space-between",
  },
  logoContainer: {
    width: "80px",
    height: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  headerDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  labName: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "4px",
    textAlign: "right",
  },
  subText: {
    fontSize: "10px",
    color: "#555",
    marginBottom: "2px",
    textAlign: "right",
  },
  invoiceId: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
    textAlign: "center",
  },
};

interface LabProps {
  invoiceId: string;
  logo: string | null;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstn: string;
}

const Header: React.FC<{ lab: LabProps }> = ({ lab }) => {
  // Validate the logo URL
  const isValidLogo = lab.logo && lab.logo !== "N/A" && (lab.logo.startsWith("http") || lab.logo.startsWith("/"));
  const logoSrc: string = isValidLogo ? lab.logo as string : "/default-logo.svg"; // Use a default image

  return (
    <div>
      <div style={styles.invoiceId}>Invoice ID: {lab.invoiceId}</div>

      <div style={styles.header}>
        <div style={styles.logoContainer}>
          <Image src={logoSrc} alt="Lab Logo" width={80} height={80} style={styles.logo} />
        </div>

        <div style={styles.headerDetails}>
          <div style={styles.labName}>{lab.name}</div>
          <div style={styles.subText}>Address: {lab.address}</div>
          <div style={styles.subText}>Phone: {lab.phone}</div>
          <div style={styles.subText}>Email: {lab.email}</div>
          <div style={styles.subText}>GSTN: {lab.gstn}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
