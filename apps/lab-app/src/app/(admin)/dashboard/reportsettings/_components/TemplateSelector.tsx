import React from 'react';
import { reportTemplates, TemplateId } from './reportTemplates';

type TemplateSelectorProps = {
  value: TemplateId;
  onChange: (next: TemplateId) => void;
};

const TemplateSelector = ({ value, onChange }: TemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {reportTemplates.map((template) => {
        const isSelected = value === template.id;
        return (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`rounded-lg border p-3 text-left transition ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="h-20 rounded-md border border-dashed border-gray-200 bg-white">
              <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100" />
            </div>
            <div className="mt-2 text-xs font-semibold text-gray-700">{template.label}</div>
            <div className="text-[11px] text-gray-500">{template.description}</div>
          </button>
        );
      })}
    </div>
  );
};

export default TemplateSelector;
