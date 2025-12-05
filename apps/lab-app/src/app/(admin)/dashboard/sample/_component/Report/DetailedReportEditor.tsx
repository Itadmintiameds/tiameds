import React, { useState, useEffect } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import RichTextEditor from '@/components/ui/rich-text-editor';
import DetailedReportTiptapEditor from '@/components/ui/detailed-report-tiptap-editor';
import SectionEditorModal from '@/components/ui/section-editor-modal';
import { formatMedicalReportToHTML } from '@/utils/reportFormatter';

interface DetailedReportEditorProps {
  point: TestReferancePoint;
  onReportJsonChange?: (reportJson: string) => void;
}

interface ReferenceRange {
  AgeMin: number;
  AgeMax: number;
  Gender: string;
  AgeMinUnit: string;
  AgeMaxUnit: string;
  ReferenceRange: string;
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'list';
  order: number;
}

interface ReportData {
  title: string;
  description: string;
  sections: ReportSection[];
  metadata?: {
    author?: string;
    date?: string;
    version?: string;
  };
}

const DetailedReportEditor: React.FC<DetailedReportEditorProps> = ({ 
  point, 
  onReportJsonChange 
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    description: '',
    sections: [],
    metadata: {
      author: '',
      date: new Date().toISOString().split('T')[0],
      version: '1.0'
    }
  });
  const [referenceRanges, setReferenceRanges] = useState<ReferenceRange[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [isNewSection, setIsNewSection] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Initialize data from props
  useEffect(() => {
    if (point.reportJson) {
      try {
        const parsed = JSON.parse(point.reportJson);
        // Check if it's already a structured report (with title and sections array matching our format)
        if (parsed.title && parsed.sections && Array.isArray(parsed.sections) && parsed.sections[0]?.id) {
          setReportData(parsed);
        } else if (parsed.tables || (parsed.sections && Array.isArray(parsed.sections)) || (parsed.impression && Array.isArray(parsed.impression))) {
          // New API format with tables, sections, impression, etc. - convert to HTML
          const formattedContent = formatMedicalReportToHTML(point.reportJson);
          setReportData({
            title: point.testName || parsed.reportType || 'Test Report',
            description: parsed.description || '',
            sections: [{
              id: '1',
              title: 'Formatted Report',
              content: formattedContent || '<p>No report data available. Please add content using the editor.</p>',
              type: 'text',
              order: 1
            }],
            metadata: {
              author: '',
              date: new Date().toISOString().split('T')[0],
              version: parsed.meta?.version || '1.0'
            }
          });
        } else {
          // Convert raw data to structured format using the formatter
          const formattedContent = formatMedicalReportToHTML(point.reportJson);
          setReportData({
            title: point.testName || 'Test Report',
            description: parsed.description || '',
            sections: [{
              id: '1',
              title: 'Formatted Report',
              content: formattedContent || '<p>No report data available. Please add content using the editor.</p>',
              type: 'text',
              order: 1
            }],
            metadata: {
              author: '',
              date: new Date().toISOString().split('T')[0],
              version: '1.0'
            }
          });
        }
      } catch (error) {
        // Initialize with default structure
        setReportData({
          title: point.testName || 'Test Report',
          description: '',
          sections: [],
          metadata: {
            author: '',
            date: new Date().toISOString().split('T')[0],
            version: '1.0'
          }
        });
      }
    } else {
      // Initialize with default structure
      setReportData({
        title: point.testName || 'Test Report',
        description: '',
        sections: [],
        metadata: {
          author: '',
          date: new Date().toISOString().split('T')[0],
          version: '1.0'
        }
      });
    }

    if (point.referenceRanges) {
      try {
        const parsed = JSON.parse(point.referenceRanges);
        setReferenceRanges(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing reference ranges:', error);
        setReferenceRanges([]);
      }
    }
  }, [point.reportJson, point.referenceRanges, point.testName]);

  const handleReportDataChange = (updatedData: ReportData) => {
    setReportData(updatedData);
    const jsonString = JSON.stringify(updatedData, null, 2);
    onReportJsonChange?.(jsonString);
  };

  const addSection = (template?: 'introduction' | 'results' | 'conclusion' | 'custom') => {
    let newSection: ReportSection;

    switch (template) {
      case 'introduction':
        newSection = {
          id: Date.now().toString(),
          title: 'Introduction',
          content: '<p><strong>Purpose:</strong> This section provides an overview of the test and its purpose.</p><p><strong>Methodology:</strong> [Describe the testing methodology here]</p>',
          type: 'text',
          order: reportData.sections.length + 1
        };
        break;
      case 'results':
        newSection = {
          id: Date.now().toString(),
          title: 'Results',
          content: '<p><strong>Findings:</strong></p><ul><li>Test results and findings will be documented here</li><li>Add specific observations and measurements</li></ul>',
          type: 'text',
          order: reportData.sections.length + 1
        };
        break;
      case 'conclusion':
        newSection = {
          id: Date.now().toString(),
          title: 'Conclusion',
          content: '<p><strong>Summary:</strong> Summary and conclusions based on the test results.</p><p><strong>Recommendations:</strong> [Add any recommendations here]</p>',
          type: 'text',
          order: reportData.sections.length + 1
        };
        break;
      default:
        newSection = {
          id: Date.now().toString(),
          title: 'New Section',
          content: '<p>Click here to start editing this section...</p>',
          type: 'text',
          order: reportData.sections.length + 1
        };
    }

    setEditingSection(newSection);
    setIsNewSection(true);
    setEditingSectionId(newSection.id);
  };

  const handleSectionSave = (section: ReportSection) => {
    if (isNewSection) {
      const updatedData = {
        ...reportData,
        sections: [...reportData.sections, section]
      };
      handleReportDataChange(updatedData);
    } else {
      const updatedSections = reportData.sections.map(s =>
        s.id === section.id ? section : s
      );
      const updatedData = { ...reportData, sections: updatedSections };
      handleReportDataChange(updatedData);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setIsNewSection(false);
  };

  const startInlineEdit = (section: ReportSection) => {
    // Allow editing for all sections (including ones that contain tables).
    // Note: editing sections with complex <table> markup in the rich text editor
    // may still change their layout, but we intentionally avoid blocking or
    // showing alerts here so the UX stays simple.
    setEditingSectionId(section.id);
    setEditingSection(section);
  };

  const cancelInlineEdit = () => {
    setEditingSectionId(null);
    setEditingSection(null);
    setIsNewSection(false);
  };

  const saveInlineEdit = () => {
    if (editingSection) {
      if (isNewSection) {
        // Add new section
        const updatedData = {
          ...reportData,
          sections: [...reportData.sections, editingSection]
        };
        handleReportDataChange(updatedData);
        setIsNewSection(false);
      } else {
        // Update existing section
        const updatedSections = reportData.sections.map(s =>
          s.id === editingSection.id ? editingSection : s
        );
        const updatedData = { ...reportData, sections: updatedSections };
        handleReportDataChange(updatedData);
      }
    }
    setEditingSectionId(null);
    setEditingSection(null);
  };

  const removeSection = (sectionId: string) => {
    const updatedSections = reportData.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index + 1 }));
    const updatedData = { ...reportData, sections: updatedSections };
    handleReportDataChange(updatedData);
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...reportData.sections];
    const currentIndex = sections.findIndex(s => s.id === sectionId);

    if (direction === 'up' && currentIndex > 0) {
      [sections[currentIndex], sections[currentIndex - 1]] = [sections[currentIndex - 1], sections[currentIndex]];
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      [sections[currentIndex], sections[currentIndex + 1]] = [sections[currentIndex + 1], sections[currentIndex]];
    }

    // Update order numbers
    const updatedSections = sections.map((section, index) => ({ ...section, order: index + 1 }));
    const updatedData = { ...reportData, sections: updatedSections };
    handleReportDataChange(updatedData);
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'MF': return 'Male/Female';
      default: return gender;
    }
  };

  const formatAgeRange = (range: ReferenceRange) => {
    const minAge = `${range.AgeMin} ${range.AgeMinUnit}`;
    const maxAge = range.AgeMaxUnit === range.AgeMinUnit 
      ? `${range.AgeMax} ${range.AgeMaxUnit}`
      : `${range.AgeMax} ${range.AgeMaxUnit}`;
    return `${minAge} - ${maxAge}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{point.testName}</h3>
            <p className="text-sm text-gray-600">Detailed Report Editor</p>
          </div>
        </div>
      </div>

      {/* Report Editor Section */}
      <div className="bg-white">
        
          <div className="p-4">
            <div className="space-y-6">
              {/* Report Sections */}
              <div className="space-y-4">
          <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Report Sections ({reportData.sections.length})
                  </h5>
            <div className="flex items-center gap-2">
                    <button
                      onClick={() => addSection()}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Section
                    </button>

                    <div className="relative group">
                      <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
                        Templates
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => addSection('introduction')}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Introduction
                          </button>
                          <button
                            onClick={() => addSection('results')}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Results
                          </button>
                          <button
                            onClick={() => addSection('conclusion')}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Conclusion
                          </button>
                        </div>
                      </div>
                    </div>
            </div>
                </div>

                {reportData.sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                    <p className="text-sm">No sections added yet. Click &quot;Add Section&quot; to get started.</p>
                </div>
              ) : (
                  <div className="space-y-4">
                    {reportData.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                          {/* Section Header */}
                          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                                {section.order}
                              </span>
                              <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {section.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {editingSectionId === section.id ? (
                                <>
                                  <button
                                    onClick={saveInlineEdit}
                                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                                    title="Save changes"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={cancelInlineEdit}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                    title="Cancel editing"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startInlineEdit(section)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Edit section"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => moveSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
                                title="Move up"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => moveSection(section.id, 'down')}
                                disabled={index === reportData.sections.length - 1}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
                                title="Move down"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                              </button>
              <button
                                onClick={() => removeSection(section.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete section"
              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
              </button>
          </div>
        </div>

                          {/* Section Content */}
                          <div className="p-4 rounded-b-lg overflow-hidden">
                            {editingSectionId === section.id ? (
                              <div className="overflow-hidden rounded-b-lg min-h-[500px]">
                                <DetailedReportTiptapEditor
                                  value={editingSection?.content || ''}
                                  onChange={(value: string) =>
                                    setEditingSection(prev =>
                                      prev ? { ...prev, content: value } : null
                                    )
                                  }
                                  height="500px"
                                />
                              </div>
                            ) : (
                              <>
                                {section.content && section.content.trim() && !section.content.includes('Click here to start editing') ? (
                                  <div
                                    className="report-html prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                  />
                                ) : (
                                  <div className="text-gray-400 italic text-sm bg-gray-50 p-4 rounded border-2 border-dashed border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                                      No content added yet. Click edit to add content.
              </div>
            </div>
          )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
              </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Ranges Table */}
      {referenceRanges.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h4 className="text-sm font-medium text-gray-800">Reference Ranges (Read Only)</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {referenceRanges.length} range{referenceRanges.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Range
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referenceRanges.map((range, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatGender(range.Gender)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatAgeRange(range)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium text-green-700">
                        {range.ReferenceRange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-b-lg">
            <p className="text-xs text-gray-500">
              Reference ranges are provided for informational purposes only and cannot be edited.
            </p>
          </div>
        </div>
      )}

        {/* Section Editor Modal */}
        <SectionEditorModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSectionSave}
          section={editingSection}
          isNew={isNewSection}
        />
    </div>
  );
};

export default DetailedReportEditor;

