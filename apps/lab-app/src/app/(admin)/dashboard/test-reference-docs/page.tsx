'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaBook, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TestReferenceDocumentation = () => {
  const router = useRouter();

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaBook className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Test Reference System Documentation</h1>
                <p className="text-gray-600 mt-1">Complete guide to managing test reference ranges</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            Table of Contents
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li><a href="#overview" className="hover:text-blue-600 underline">1. Overview</a></li>
            <li><a href="#adding-references" className="hover:text-blue-600 underline">2. Adding References</a></li>
            <li><a href="#editing-references" className="hover:text-blue-600 underline">3. Editing References</a></li>
            <li><a href="#updating-references" className="hover:text-blue-600 underline">4. Updating References</a></li>
            <li><a href="#special-types" className="hover:text-blue-600 underline">5. Special Test Descriptions</a></li>
            <li><a href="#report-json" className="hover:text-blue-600 underline">6. Report JSON Structure</a></li>
            <li><a href="#reference-ranges" className="hover:text-blue-600 underline">7. Reference Ranges</a></li>
            <li><a href="#validation" className="hover:text-blue-600 underline">8. Validation Rules</a></li>
            <li><a href="#workflows" className="hover:text-blue-600 underline">9. Common Workflows</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Overview */}
          <section id="overview" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              The Test Reference System is a comprehensive module for managing laboratory test reference ranges. 
              It allows administrators to add, edit, update, and delete test reference points with support for 
              various test description types, including detailed reports with structured content.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-green-800">
                <li>Add new test references with test selection</li>
                <li>Add references for existing tests</li>
                <li>Edit and update existing references</li>
                <li>Delete references with confirmation</li>
                <li>Support for special test description types</li>
                <li>Structured report editor for detailed reports</li>
                <li>Reference ranges builder</li>
                <li>Export to CSV and Excel</li>
              </ul>
            </div>
          </section>

          {/* Adding References */}
          <section id="adding-references" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Adding References</h2>
            
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Method 1: Add New Reference</h3>
                <ol className="list-decimal list-inside space-y-2 text-purple-800">
                  <li>Click the <strong>&quot;Add New&quot;</strong> button in the main page</li>
                  <li>Modal opens with test selection interface</li>
                  <li>Search and select a test (optional - auto-fills test name and category)</li>
                  <li>Fill required fields:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Test Description (required)</li>
                      <li>Gender (required)</li>
                      <li>Age Range (required)</li>
                      <li>Units (required for non-special types)</li>
                      <li>Reference Range (required for non-special types)</li>
                    </ul>
                  </li>
                  <li>For <strong>&quot;DETAILED REPORT&quot;</strong>: Fill report structure using the form editor</li>
                  <li>Optionally add reference ranges using the builder</li>
                  <li>Click <strong>&quot;Add Reference&quot;</strong></li>
                  <li>System validates and saves the reference</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Method 2: Add Existing Test Reference</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>Find the test in the list</li>
                  <li>Click <strong>&quot;Add Reference&quot;</strong> button next to the test name</li>
                  <li>Test name and category are pre-filled</li>
                  <li>Fill remaining required fields</li>
                  <li>Click <strong>&rdquo;Add Reference&rdquo;</strong></li>
                  <li>System validates and saves</li>
                </ol>
                <p className="text-blue-700 mt-3">
                  <FaCheckCircle className="inline mr-2" />
                  <strong>Tip:</strong> Use this method when adding multiple references to the same test for faster workflow.
                </p>
              </div>
            </div>
          </section>

          {/* Editing References */}
          <section id="editing-references" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Editing References</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Edit Process:</h3>
              <ol className="list-decimal list-inside space-y-2 text-orange-800">
                <li>Find the reference in the list</li>
                <li>Click the <strong>Edit icon</strong> (pencil) on the reference row</li>
                <li>Modal opens with all current values pre-filled</li>
                <li>Modify fields as needed</li>
                <li>For <strong>&quot;DETAILED REPORT&quot;</strong>: Edit report sections using the Tiptap editor</li>
                <li>For reference ranges: Use the structured builder or raw JSON editor</li>
                <li>Click <strong>&quot;Save&quot;</strong> button</li>
                <li>System validates and updates the reference</li>
              </ol>
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <FaExclamationTriangle className="inline text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                <strong>Note:</strong> Validation errors will be displayed in red. Fix all errors before saving.
              </span>
            </div>
          </section>

          {/* Updating References */}
          <section id="updating-references" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updating References</h2>
            <p className="text-gray-700 mb-4">
              The update process is the same as editing. When you click &quot;Save&quot; in the edit modal, the system:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Validates all form fields</li>
              <li>Converts data formats (e.g., gender &quot;B&quot; to &quot;MF&quot;)</li>
              <li>Sends update request to the API</li>
              <li>Refreshes the data list</li>
              <li>Shows success notification</li>
              <li>Closes the modal</li>
            </ol>
          </section>

          {/* Special Test Descriptions */}
          <section id="special-types" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Test Descriptions</h2>
            <p className="text-gray-700 mb-4">
              These test descriptions have special validation and UI behavior:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• DESCRIPTION</li>
                  <li>• DROPDOWN</li>
                  <li>• DROPDOWN-POSITIVE/NEGATIVE</li>
                  <li>• DROPDOWN-PRESENT/ABSENT</li>
                  <li>• DROPDOWN-REACTIVE/NONREACTIVE</li>
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• DROPDOWN-PERCENTAGE</li>
                  <li>• DROPDOWN-COMPATIBLE/INCOMPATIBLE</li>
                  <li>• DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE</li>
                  <li>• DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT</li>
                  <li>• DETAILED REPORT</li>
                </ul>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Special Behavior Rules:</h3>
              <div className="space-y-2 text-red-800">
                <p><strong>For All Special Types:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Units Field: Optional (no required validation)</li>
                  <li>Min/Max Reference Range: Hidden in UI, not validated</li>
                  <li>Reference Ranges Builder: Hidden in UI</li>
                </ul>
                <p className="mt-2"><strong>For DETAILED REPORT Only:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Report Content Editor: Visible and required</li>
                  <li>Report JSON: Required and validated</li>
                  <li>Uses Tiptap editor with table support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Report JSON Structure */}
          <section id="report-json" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report JSON Structure</h2>
            <p className="text-gray-700 mb-4">
              For <strong>&quot;DETAILED REPORT&quot;</strong> type, the <code className="bg-gray-100 px-2 py-1 rounded">reportJson</code> field stores a structured JSON object:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`{
  "reportType": "Report Type",
  "indication": "Clinical indication",
  "method": "Method/Technique",
  "sections": [
    {
      "title": "Section Title",
      "content": "Text or array",
      "contentType": "text" | "list"
    }
  ],
  "tables": [
    {
      "title": "Table Title",
      "headers": ["Header 1", "Header 2"],
      "rows": [["Cell 1", "Cell 2"]]
    }
  ],
  "impression": ["Statement 1", "Statement 2"],
  "followUp": "Follow-up instructions"
}`}
              </pre>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <FaInfoCircle className="inline mr-2" />
                The report editor automatically converts your input to this JSON structure. You can use the form editor 
                or the Tiptap rich text editor depending on the context.
              </p>
            </div>
          </section>

          {/* Reference Ranges */}
          <section id="reference-ranges" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reference Ranges</h2>
            <p className="text-gray-700 mb-4">
              Reference ranges are stored as a JSON array. Each range can specify:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              <li>Gender (M, F, or MF)</li>
              <li>Age range (min/max with units)</li>
              <li>Reference range value</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Using the Reference Ranges Builder:</h3>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li>Click on the <strong>&quot;Structured&quot;</strong> tab</li>
                <li>Click <strong>&quot;Add Row&quot;</strong> to add a new range</li>
                <li>Fill in gender, age range, and reference range</li>
                <li>Add multiple rows for different age/gender combinations</li>
                <li>Click <strong>&quot;Apply to JSON&quot;</strong> to save</li>
                <li>View live preview of your ranges</li>
              </ol>
            </div>
          </section>

          {/* Validation Rules */}
          <section id="validation" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Validation Rules</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Required Fields (All Types):</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Test Description</li>
                  <li>Gender (M, F, or MF)</li>
                  <li>Minimum Age (0-100)</li>
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Conditional Requirements:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Units:</strong> Required only for non-special types</li>
                  <li><strong>Min/Max Reference Range:</strong> Required only for non-special types</li>
                  <li><strong>Report JSON:</strong> Required only for DETAILED REPORT</li>
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Validation Rules:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Age values must be between 0 and 100</li>
                  <li>Maximum age must be greater than minimum age</li>
                  <li>Maximum reference range must be greater than minimum range</li>
                  <li>All numeric values must be non-negative</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Common Workflows */}
          <section id="workflows" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Workflows</h2>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Workflow 1: Add New Test Reference</h3>
                <ol className="list-decimal list-inside space-y-1 text-purple-800 text-sm">
                  <li>Click &quot;Add New&quot; button</li>
                  <li>Search and select test (optional)</li>
                  <li>Select test description type</li>
                  <li>Fill gender and age range</li>
                  <li>If not special type: Fill units and reference range</li>
                  <li>If DETAILED REPORT: Fill report structure</li>
                  <li>Optionally add reference ranges</li>
                  <li>Click &quot;Add Reference&quot;</li>
                </ol>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Workflow 2: Edit Existing Reference</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>Find reference in list</li>
                  <li>Click Edit icon</li>
                  <li>Modify fields as needed</li>
                  <li>For DETAILED REPORT: Edit report sections</li>
                  <li>Click &quot;Save&quot;</li>
                </ol>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Workflow 3: Add Multiple References to Same Test</h3>
                <ol className="list-decimal list-inside space-y-1 text-green-800 text-sm">
                  <li>Find test in list</li>
                  <li>Click &quot;Add Reference&quot; next to test name</li>
                  <li>Test name and category pre-filled</li>
                  <li>Fill remaining fields</li>
                  <li>Click &quot;Add Reference&quot;</li>
                  <li>Repeat for additional references</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips & Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">For Users:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>Select test description from dropdown when possible</li>
                  <li>Use structured builder for reference ranges</li>
                  <li>For DETAILED REPORT, use the form editor</li>
                  <li>Check validation errors before submitting</li>
                  <li>Use &quot;Add Existing&quot; for multiple references</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Technical Notes:</h3>
                <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                  <li>All test descriptions are converted to uppercase</li>
                  <li>Gender &quot;B&quot; is converted to &quot;MF&quot; for backend</li>
                  <li>Age values are limited to 0-100</li>
                  <li>Reference ranges support decimal values</li>
                  <li>Report JSON uses Tiptap editor in edit mode</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            For additional support or questions, please contact your system administrator.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            style={{
              background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
            }}
          >
            <FaArrowLeft className="h-4 w-4" />
            Return to Test References
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestReferenceDocumentation;

