'use client';

import React, { useState } from 'react';
import { formatMedicalReport, formatMedicalReportToHTML } from '@/utils/reportFormatter';

const sampleReports = {
  'ANTENATAL USG': {
    "note": "Sex of fetus will not be disclosed",
    "testName": "ANTENATAL USG",
    "impression": "Twin live intrauterine gestation of 21-22 weeks, monochorionic diamniotic twins",
    "limitations": [
      "Accuracy ~70% due to technical reasons (liquor, fetal position, gestational age)",
      "Complete fetal heart evaluation requires fetal 2D ECHO"
    ],
    "organReview": ["Brain parenchyma normal", "Spine and CVJ normal"],
    "observations": ["Twin live intrauterine gestation", "Liquor AFI: 10-11 cms"],
    "fetalParameters": {
      "Fetus I": {
        "AC": "16.5 cm (21w4d)",
        "FL": "3.5 cm (21w1d)",
        "HC": "19.2 cm (21w4d)"
      },
      "Fetus II": {
        "AC": "15.1 cm (20w2d)",
        "FL": "3.3 cm (20w2d)",
        "HC": "18.3 cm (20w5d)"
      }
    }
  },
  'CBC': {
    "testName": "Complete Blood Count",
    "impression": "Normal CBC values within reference ranges",
    "values": {
      "Hemoglobin": "14.2 g/dL",
      "Hematocrit": "42.5%",
      "White Blood Cells": "7.2 x 10³/μL",
      "Platelets": "285 x 10³/μL"
    },
    "referenceRanges": {
      "Hemoglobin": "12.0-16.0 g/dL",
      "Hematocrit": "36.0-46.0%",
      "White Blood Cells": "4.5-11.0 x 10³/μL",
      "Platelets": "150-450 x 10³/μL"
    }
  },
  'MRI Brain': {
    "testName": "MRI Brain with Contrast",
    "impression": "No acute intracranial abnormality",
    "findings": [
      "No evidence of acute infarct or hemorrhage",
      "No mass lesions or space-occupying lesions",
      "Ventricular system normal in size and configuration",
      "No abnormal enhancement following contrast administration"
    ],
    "technique": "Multiplanar T1 and T2 weighted images with and without gadolinium contrast",
    "recommendations": "Clinical correlation recommended"
  }
};

const ReportFormatterDemo: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('ANTENATAL USG');
  const [customJson, setCustomJson] = useState<string>('');

  const currentReport = selectedReport === 'Custom' ? customJson : JSON.stringify(sampleReports[selectedReport as keyof typeof sampleReports], null, 2);

  const formattedText = formatMedicalReport(currentReport);
  const formattedHTML = formatMedicalReportToHTML(currentReport);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">Medical Report Formatter Demo</h3>
          <p className="text-sm text-gray-600">Select a sample report or enter custom JSON to see the formatted output</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sample Report
                </label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ANTENATAL USG">ANTENATAL USG</option>
                  <option value="CBC">Complete Blood Count</option>
                  <option value="MRI Brain">MRI Brain</option>
                  <option value="Custom">Custom JSON</option>
                </select>
              </div>

              {selectedReport === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom JSON Input
                  </label>
                  <textarea
                    value={customJson}
                    onChange={(e) => setCustomJson(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter your JSON report data here..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw JSON Data
                </label>
                <pre className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-xs overflow-x-auto">
                  {currentReport}
                </pre>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formatted Text Output
                </label>
                <pre className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-sm whitespace-pre-wrap">
                  {formattedText}
                </pre>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Output (Rich Text)
                </label>
                <div 
                  className="w-full p-3 bg-white border border-gray-300 rounded-md min-h-[200px] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formattedHTML }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFormatterDemo;
