import { TestReferancePoint } from "@/types/test/testlist";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { formatMedicalReportToHTML } from "@/utils/reportFormatter";
import Button from "../common/Button";

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

interface TestEditReferanceProps {
    editRecord: TestReferancePoint | null;
    setEditRecord: React.Dispatch<React.SetStateAction<TestReferancePoint | null>>;
    setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleUpdate: (e: React.FormEvent) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    formData: TestReferancePoint;
    setFormData: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

const TestEditReferance = ({ editRecord, setEditRecord, handleUpdate, handleChange, formData, setFormData }: TestEditReferanceProps) => {
    if (!editRecord) return null;

    // Custom handler for age fields to prevent negative values and values > 100
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        
        // Prevent negative values and values greater than 100
        if (value === "" || (numericValue >= 0 && numericValue <= 100)) {
            setFormData(prev => ({
                ...prev,
                [name]: value === "" ? "" : numericValue
            }));
        }
    };

    // JSON fields handlers
    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value } as TestReferancePoint));
    };

    const validateJson = (jsonString?: string): boolean => {
        if (!jsonString || !jsonString.trim()) return true;
        try { JSON.parse(jsonString); return true; } catch { return false; }
    };

    const [rangesTab, setRangesTab] = useState<"structured" | "raw">("structured");
    
    // Structured report editor state
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
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
    const [isNewSection, setIsNewSection] = useState<boolean>(false);

    // Initialize report data from JSON
    useEffect(() => {
        if (formData.reportJson) {
            try {
                const parsed = JSON.parse(formData.reportJson);
                // Check if it's already a structured report or raw data
                if (parsed.title && parsed.sections) {
                    setReportData(parsed);
                } else {
                    // Convert raw data to structured format using the formatter
                    const formattedContent = formatMedicalReportToHTML(formData.reportJson);
                    setReportData({
                        title: formData.testName || 'Test Report',
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
                    title: formData.testName || 'Test Report',
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
                title: formData.testName || 'Test Report',
                description: '',
                sections: [],
                metadata: {
                    author: '',
                    date: new Date().toISOString().split('T')[0],
                    version: '1.0'
                }
            });
        }
    }, [formData.reportJson, formData.testName]);

    const handleReportDataChange = (updatedData: ReportData) => {
        setReportData(updatedData);
        const jsonString = JSON.stringify(updatedData, null, 2);
        setFormData(prev => ({ ...prev, reportJson: jsonString } as TestReferancePoint));
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

    const startInlineEdit = (section: ReportSection) => {
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

    const updateSection = (sectionId: string, field: keyof ReportSection, value: string | number) => {
        const updatedSections = reportData.sections.map(section =>
            section.id === sectionId ? { ...section, [field]: value } : section
        );
        const updatedData = { ...reportData, sections: updatedSections };
        handleReportDataChange(updatedData);
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

    type KeyValue = { key: string; value: string };
    type ParameterRow = { key: string; unit?: string; value?: string; normal_range?: string };

    // Structured report editor replaces the old JSON editor

    const [rangesRows, setRangesRows] = useState<Array<{
        Gender: string;
        AgeMin: number | string;
        AgeMinUnit: string;
        AgeMax: number | string;
        AgeMaxUnit: string;
        ReferenceRange: string;
    }>>([
        { Gender: formData.gender || "MF", AgeMin: formData.ageMin ?? 0, AgeMinUnit: formData.minAgeUnit || "YEARS", AgeMax: formData.ageMax ?? "", AgeMaxUnit: formData.maxAgeUnit || "YEARS", ReferenceRange: formData.minReferenceRange !== undefined && formData.maxReferenceRange !== undefined ? `${formData.minReferenceRange} - ${formData.maxReferenceRange} ${formData.units || ''}`.trim() : "" }
    ]);

    useEffect(() => {
        if (formData.referenceRanges) {
            loadRangesFromJson();
        }
    }, [formData.referenceRanges]);

    // Removed structured report helpers; single editor directly updates reportJson

    const addRangeRow = () => setRangesRows(prev => [...prev, { Gender: formData.gender || "MF", AgeMin: formData.ageMin ?? 0, AgeMinUnit: formData.minAgeUnit || "YEARS", AgeMax: formData.ageMax ?? "", AgeMaxUnit: formData.maxAgeUnit || "YEARS", ReferenceRange: "" }]);
    const removeRangeRow = (idx: number) => setRangesRows(prev => prev.filter((_, i) => i !== idx));
    const updateRangeRow = (idx: number, field: string, value: string) => setRangesRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

    const applyRangesToJson = () => {
        const rows = rangesRows.filter(r => r.ReferenceRange);
        setFormData(prev => ({ ...prev, referenceRanges: JSON.stringify(rows) } as TestReferancePoint));
    };

    const loadRangesFromJson = useCallback(() => {
        if (!formData.referenceRanges) return;
        try {
            const parsed = JSON.parse(formData.referenceRanges as string);
            if (Array.isArray(parsed)) setRangesRows(parsed);
        } catch {}
    }, [formData.referenceRanges]);
    
    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Header with subtle accent */}
            <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                    {formData.testName}
                </h2>
                <p className="text-xs text-gray-500 mt-1 pl-4.5">
                    Category: {formData.category}
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
                        <input
                            type="text"
                            name="testDescription"
                            list="editTestDescriptionOptions"
                            value={formData.testDescription.toLocaleUpperCase()}
                            onChange={handleChange}
                            className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                            placeholder="Type or select test description"
                        />
                        <datalist id="editTestDescriptionOptions">
                            <option value="DESCRIPTION">Description</option>
                            <option value="DROPDOWN">Dropdown</option>
                            <option value="DROPDOWN-POSITIVE/NEGATIVE">Dropdown - Positive/Negative</option>
                            <option value="DROPDOWN-PRESENT/ABSENT">Dropdown - Present/Absent</option>
                            <option value="DROPDOWN-REACTIVE/NONREACTIVE">Dropdown - Reactive/Nonreactive</option>
                            <option value="DROPDOWN-PERCENTAGE">Dropdown - Percentage</option>
                            <option value="DROPDOWN-COMPATIBLE/INCOMPATIBLE">Dropdown - Compatible/Incompatible</option>
                            <option value="DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE">Dropdown with Description - Reactive/Nonreactive</option>
                            <option value="DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT">Dropdown with Description - Present/Absent</option>
                        </datalist>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                        >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            {/* <option value="O">Unisex</option> */}
                        </select>
                    </div>

                    {/* Units */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Units</label>
                        <input
                            type="text"
                            name="units"
                            value={formData.units}
                            onChange={handleChange}
                            className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                            placeholder="Measurement units"
                        />
                    </div>

                    {/* Min Age with Unit */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Min Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMin"
                                value={formData.ageMin}
                                onChange={handleAgeChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                                min={0}
                                max={100}
                            />
                            <select
                                name="minAgeUnit"
                                value={formData.minAgeUnit || "YEARS"}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                            >
                                <option value="YEARS">Years</option>
                                <option value="MONTHS">Months</option>
                                <option value="WEEKS">Weeks</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Max Age with Unit */}
                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Max Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMax"
                                min={0}
                                max={100}
                                value={formData.ageMax}
                                onChange={handleAgeChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                            />
                            <select
                                name="maxAgeUnit"
                                value={formData.maxAgeUnit || "YEARS"}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                            >
                                <option value="YEARS">Years</option>
                                <option value="MONTHS">Months</option>
                                <option value="WEEKS">Weeks</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Reference Range */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Min Range</label>
                            <input
                                type="number"
                                name="minReferenceRange"
                                min={0}
                                // max={100}
                                value={formData.minReferenceRange}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Max Range</label>
                            <input
                                type="number"
                                name="maxReferenceRange"
                                min={0}
                                value={formData.maxReferenceRange}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Structured Report Editor */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">Report Content</label>
                        <div className="text-xs text-gray-500">
                            {reportData.sections.length} section{reportData.sections.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-4">
                            <div className="space-y-4">
                                {/* Report Sections */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Report Sections
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">No sections added yet. Click "Add Section" to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reportData.sections
                                                .sort((a, b) => a.order - b.order)
                                                .map((section, index) => (
                                                    <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
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
                                                        <div className="p-4">
                                                            {editingSectionId === section.id ? (
                                                                <div>
                                                                    <RichTextEditor
                                                                        value={editingSection?.content || ''}
                                                                        onChange={(value) => setEditingSection(prev => prev ? { ...prev, content: value } : null)}
                                                                        placeholder="Enter section content..."
                                                                        height="300px"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {section.content && section.content.trim() && !section.content.includes('Click here to start editing') ? (
                                                                        <div
                                                                            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
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
                </div>

                {/* Reference Ranges - Structured/Raw */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">Reference Ranges</label>
                        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
                            <button type="button" className={`px-3 py-1 text-xs ${rangesTab === 'structured' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setRangesTab('structured')}>Structured</button>
                            <button type="button" className={`px-3 py-1 text-xs ${rangesTab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setRangesTab('raw')}>Raw</button>
                        </div>
                    </div>

                    {rangesTab === 'structured' ? (
                        <div className="space-y-3 border border-gray-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-800">Reference Ranges Builder</h5>
                                <span className="text-[11px] text-gray-500">Use rows per age/gender</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Ranges</span>
                                <div className="flex gap-2">
                                    <Button type="button" text="Add Row" onClick={addRangeRow} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    <Button type="button" text="Load from JSON" onClick={loadRangesFromJson} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    <Button type="button" text="Apply to JSON" onClick={applyRangesToJson} className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs" />
                                </div>
                            </div>
                            <div className="overflow-auto">
                                <div className="min-w-[720px]">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-2">
                                        <div className="col-span-1">Gender</div>
                                        <div className="col-span-2">Age Min</div>
                                        <div className="col-span-2">Age Max</div>
                                        <div className="col-span-6">Reference Range</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {rangesRows.map((row, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                            <select className="col-span-1 border border-gray-300 rounded p-2 text-xs" value={row.Gender} onChange={(e) => updateRangeRow(idx, 'Gender', e.target.value)}>
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                                <option value="MF">Both</option>
                                            </select>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input className="border border-gray-300 rounded p-2 text-xs" type="number" min={0} value={row.AgeMin as any} onChange={(e) => updateRangeRow(idx, 'AgeMin', e.target.value)} placeholder="0" />
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMinUnit} onChange={(e) => updateRangeRow(idx, 'AgeMinUnit', e.target.value)}>
                                                    <option value="YEARS">YEARS</option>
                                                    <option value="MONTHS">MONTHS</option>
                                                    <option value="WEEKS">WEEKS</option>
                                                    <option value="DAYS">DAYS</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input className="border border-gray-300 rounded p-2 text-xs" type="number" min={0} value={row.AgeMax as any} onChange={(e) => updateRangeRow(idx, 'AgeMax', e.target.value)} placeholder="" />
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMaxUnit} onChange={(e) => updateRangeRow(idx, 'AgeMaxUnit', e.target.value)}>
                                                    <option value="YEARS">YEARS</option>
                                                    <option value="MONTHS">MONTHS</option>
                                                    <option value="WEEKS">WEEKS</option>
                                                    <option value="DAYS">DAYS</option>
                                                </select>
                                            </div>
                                            <input className="col-span-6 border border-gray-300 rounded p-2 text-xs" placeholder="e.g., 12.0 - 16.0 g/dL / 4.5 - 11.0 x 10³/μL" value={row.ReferenceRange} onChange={(e) => updateRangeRow(idx, 'ReferenceRange', e.target.value)} />
                                            <button type="button" className="col-span-1 text-xs text-red-600" onClick={() => removeRangeRow(idx)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <h6 className="text-xs font-semibold text-blue-700 mb-2">Live Preview</h6>
                                {rangesRows.filter(r => r.ReferenceRange).length === 0 ? (
                                    <p className="text-[11px] text-gray-500">No ranges added yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {rangesRows.filter(r => r.ReferenceRange).map((r, i) => (
                                            <div key={i} className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-green-800 font-medium">{r.Gender === 'M' ? 'Male' : r.Gender === 'F' ? 'Female' : 'Both'}</div>
                                                    <div className="text-green-900 font-semibold">{r.ReferenceRange}</div>
                                                </div>
                                                <div className="text-[12px] text-gray-700 mt-1">Age: {String(r.AgeMin)} {r.AgeMinUnit} {r.AgeMax !== '' && <>- {String(r.AgeMax)} {r.AgeMaxUnit}</>}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <textarea
                            name="referenceRanges"
                            value={formData.referenceRanges || ""}
                            onChange={handleJsonChange}
                            rows={6}
                            className={`w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all font-mono ${
                                formData.referenceRanges && !validateJson(formData.referenceRanges) ? 'border-red-300 focus:ring-red-300' : ''
                            }`}
                            placeholder="Paste or edit JSON array"
                        />
                    )}
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex justify-end gap-2 pt-3">
                    <Button
                        text="Cancel"
                        onClick={() => setEditRecord(null)}
                        className="text-xs px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center"
                    >
                        <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                    <Button
                        text="Save"
                        onClick={() => {}}
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors flex items-center"
                    >
                        <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TestEditReferance;