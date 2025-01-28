import React from 'react';
import Image from 'next/image';  // You can use this for static images in Next.js
import { CSSProperties } from 'react';

const styles: { [key: string]: CSSProperties } = {
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff", // Clean white background
    padding: "10px 20px", // Reduced padding for compactness
    borderBottom: "1px solid #e0e0e0", // Lighter divider for a subtle effect
    justifyContent: "space-between",
  },
  logoContainer: {
    width: "80px",
    height: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light gray background for logo container
    borderRadius: "8px", // Slightly rounded corners
    overflow: "hidden", // Ensures the logo stays within the container
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain", // For proper image resizing
  },
  headerDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", // Align text to the right
  },
  labName: {
    fontSize: "20px", // Smaller font size for lab name to save space
    fontWeight: "bold",
    color: "#333", // Darker text for better contrast
    marginBottom: "4px",
    textAlign: "right",
  },
  subText: {
    fontSize: "10px", // Smaller font size for details
    color: "#555", // Subtle gray text for details
    marginBottom: "2px",
    textAlign: "right",
  },
  invoiceId: {
    fontSize: "14px", // Font size for invoice ID
    fontWeight: "bold", // Bold to make it stand out
    color: "#333", // Dark color for readability
    marginBottom: "8px", // Space between invoice ID and the logo
    textAlign: "center", // Center aligned
  },
};

interface LabProps {
  invoiceId: string;
  logo: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstn: string;
}

const Header: React.FC<{ lab: LabProps }> = ({ lab }) => {
  return (
    <div>
      {/* Invoice ID on top */}
      <div style={styles.invoiceId}>Invoice ID: {lab.invoiceId}</div>

      <div style={styles.header}>
        {/* Invoice ID on top */}

        {/* Logo Section */}
        <div style={styles.logoContainer}>
          {lab.logo ? (
            <Image src={lab.logo} alt="Logo" width={80} height={80} style={styles.logo} />
          ) : (
            <Image src="/tiamed1.svg" alt="logo" width={100} height={100} />
          )}
        </div>

        {/* Lab Details Section */}
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
