'use client';

import React, { useRef, useState } from 'react';
import { 
  TbPrinter, 
  TbDownload, 
  TbShare, 
  TbClock, 
  TbUser, 
  TbCalendar,
  TbId,
  TbStethoscope,
  TbFileText,
  TbAlertCircle,
  TbCheck
} from 'react-icons/tb';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PatientInfo {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  patientId: string;
  dateOfBirth: string;
  contactNumber?: string;
  email?: string;
}

interface TestResult {
  id: string;
  testName: string;
  result: string;
  normalRange: string;
  unit: string;
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  remarks?: string;
  category: string;
}

interface DoctorRemark {
  doctorName: string;
  designation: string;
  remarks: string;
  date: string;
  signature?: string;
}

interface ReportData {
  reportId: string;
  patient: PatientInfo;
  testResults: TestResult[];
  doctorRemark: DoctorRemark;
  status: 'Completed' | 'Pending' | 'Verified';
  generatedDate: string;
  labName: string;
  labAddress: string;
  labContact: string;
}

interface ModernReportPageProps {
  data: ReportData;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const ModernReportPage: React.FC<ModernReportPageProps> = ({ 
  data, 
  onPrint, 
  onDownload, 
  onShare 
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Abnormal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Verified': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal': return <TbCheck className="w-4 h-4" />;
      case 'Abnormal': return <TbAlertCircle className="w-4 h-4" />;
      case 'Critical': return <TbAlertCircle className="w-4 h-4" />;
      case 'Pending': return <TbClock className="w-4 h-4" />;
      case 'Completed': return <TbCheck className="w-4 h-4" />;
      case 'Verified': return <TbCheck className="w-4 h-4" />;
      default: return <TbClock className="w-4 h-4" />;
    }
  };

  const handlePrint = async () => {
    if (onPrint) {
      onPrint();
      return;
    }

    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const printElement = reportRef.current.cloneNode(true) as HTMLDivElement;
      printElement.style.position = 'absolute';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.width = '210mm';
      printElement.style.backgroundColor = 'white';
      document.body.appendChild(printElement);

      const canvas = await html2canvas(printElement, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      document.body.removeChild(printElement);
      pdf.save(`report-${data.reportId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    handlePrint();
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: `Medical Report - ${data.patient.name}`,
        text: `Medical diagnostic report for ${data.patient.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Diagnostic Report</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data.status)}`}>
              {getStatusIcon(data.status)}
              <span className="ml-2">{data.status}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TbPrinter className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Print'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TbDownload className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <TbShare className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TbStethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{data.labName}</h2>
                  <p className="text-gray-600">{data.labAddress}</p>
                  <p className="text-sm text-gray-500">Contact: {data.labContact}</p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600 w-20 text-left">Report ID:</span>
                      <span className="font-medium text-gray-900 ml-2">{data.reportId}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-20 text-left">Generated:</span>
                      <span className="font-medium text-gray-900 ml-2">{new Date(data.generatedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TbUser className="w-5 h-5 mr-2 text-blue-600" />
              Patient Information
            </h3>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">NAME:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">{data.patient.name}</p>
              </div>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">AGE/SEX:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">{data.patient.age} years, {data.patient.gender}</p>
              </div>
              
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">REFERRED BY:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">Dr. {data.doctorRemark.doctorName}</p>
              </div>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">DATE OF REPORT:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">{new Date(data.generatedDate).toLocaleDateString()} at {new Date(data.generatedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
              
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">LAB NO:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">{data.labName}</p>
              </div>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">BILL NO:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">{data.patient.patientId}</p>
              </div>
              
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-500 w-24 text-left">OPD/IPD:</label>
                <p className="text-sm font-bold text-gray-900 ml-2">Out-Patient</p>
              </div>
              {data.patient.contactNumber && (
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-500 w-24 text-left">CONTACT:</label>
                  <p className="text-sm font-bold text-gray-900 ml-2">{data.patient.contactNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TbFileText className="w-5 h-5 mr-2 text-blue-600" />
              Test Results
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Normal Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.testResults.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{test.testName}</div>
                        <div className="text-sm text-gray-500">{test.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{test.result}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.normalRange}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {test.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor's Remarks */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TbStethoscope className="w-5 h-5 mr-2 text-blue-600" />
              Doctor's Remarks
            </h3>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TbStethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">Dr. {data.doctorRemark.doctorName}</h4>
                    <span className="text-sm text-gray-500">({data.doctorRemark.designation})</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{data.doctorRemark.remarks}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Date: {new Date(data.doctorRemark.date).toLocaleDateString()}</span>
                    {data.doctorRemark.signature && (
                      <span className="font-medium">Digital Signature Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  This is an electronically generated report. No physical signature required.
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  For any queries, please contact our lab at {data.labContact}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-300">
                  Generated on {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Powered by Modern Diagnostic System
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernReportPage;
