'use client';

import React from 'react';
import ModernReportPage from '@/components/ModernReportPage';

const DemoReportPage = () => {
  const sampleData = {
    reportId: 'RPT-2024-001',
    patient: {
      name: 'John Smith',
      age: 35,
      gender: 'Male' as const,
      patientId: 'PID-12345',
      dateOfBirth: '1989-03-15',
      contactNumber: '+1 (555) 123-4567',
      email: 'john.smith@email.com'
    },
    testResults: [
      {
        id: '1',
        testName: 'Complete Blood Count (CBC)',
        result: '7.2',
        normalRange: '4.5 - 11.0',
        unit: 'x10³/μL',
        status: 'Normal' as const,
        remarks: 'Within normal limits',
        category: 'Hematology'
      },
      {
        id: '2',
        testName: 'Hemoglobin',
        result: '14.2',
        normalRange: '13.5 - 17.5',
        unit: 'g/dL',
        status: 'Normal' as const,
        remarks: 'Good oxygen-carrying capacity',
        category: 'Hematology'
      },
      {
        id: '3',
        testName: 'Blood Glucose (Fasting)',
        result: '95',
        normalRange: '70 - 100',
        unit: 'mg/dL',
        status: 'Normal' as const,
        remarks: 'Normal glucose metabolism',
        category: 'Biochemistry'
      },
      {
        id: '4',
        testName: 'Total Cholesterol',
        result: '220',
        normalRange: '< 200',
        unit: 'mg/dL',
        status: 'Abnormal' as const,
        remarks: 'Slightly elevated, consider lifestyle changes',
        category: 'Biochemistry'
      },
      {
        id: '5',
        testName: 'Thyroid Stimulating Hormone (TSH)',
        result: '2.1',
        normalRange: '0.4 - 4.0',
        unit: 'mIU/L',
        status: 'Normal' as const,
        remarks: 'Normal thyroid function',
        category: 'Endocrinology'
      }
    ],
    doctorRemark: {
      doctorName: 'Sarah Johnson',
      designation: 'MD, Internal Medicine',
      remarks: 'The patient shows overall good health with most parameters within normal ranges. The slightly elevated cholesterol level should be monitored and managed through dietary modifications and regular exercise. I recommend a follow-up in 3 months to reassess the lipid profile. All other test results are satisfactory and indicate no immediate health concerns.',
      date: '2024-01-15',
      signature: 'verified'
    },
    status: 'Verified' as const,
    generatedDate: '2024-01-15T10:30:00Z',
    labName: 'Sunny3042 Diagnostic Center',
    labAddress: '123 Medical Plaza, Health City, HC 12345',
    labContact: '+1 (555) 987-6543'
  };

  const handlePrint = () => {
    console.log('Print functionality triggered');
    window.print();
  };

  const handleDownload = () => {
    console.log('Download functionality triggered');
  };

  const handleShare = () => {
    console.log('Share functionality triggered');
  };

  return (
    <div>
      <ModernReportPage 
        data={sampleData}
        onPrint={handlePrint}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
};

export default DemoReportPage;
