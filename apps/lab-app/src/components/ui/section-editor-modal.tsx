'use client';

import React, { useState, useEffect } from 'react';
import RichTextEditor from './rich-text-editor';

interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'list';
  order: number;
}

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: ReportSection) => void;
  section?: ReportSection | null;
  isNew?: boolean;
}

const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  section,
  isNew = false
}) => {
  const [formData, setFormData] = useState<ReportSection>({
    id: '',
    title: '',
    content: '',
    type: 'text',
    order: 1
  });

  useEffect(() => {
    if (section) {
      setFormData(section);
    } else {
      setFormData({
        id: '',
        title: '',
        content: '',
        type: 'text',
        order: 1
      });
    }
  }, [section, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter a section title');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">
            {isNew ? 'Add New Section' : 'Edit Section'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Section Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter section title"
              />
            </div>

            {/* Section Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'text' | 'table' | 'list' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text</option>
                <option value="table">Table</option>
                <option value="list">List</option>
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="text-xs text-gray-500">
                  {formData.content.replace(/<[^>]*>/g, '').length} characters
                </div>
              </div>
              <div className="border border-gray-300 rounded-md">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Enter section content..."
                  height="300px"
                />
              </div>
            </div>

            {/* Preview */}
            {formData.content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div 
                  className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            {isNew ? 'Add Section' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionEditorModal;
