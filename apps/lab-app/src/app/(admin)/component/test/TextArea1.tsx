"use client";

import { useState } from "react";

const TextArea1 = () => {
  const [form, setForm] = useState({
    placeholder: "",
    characterLimit: "500",
    defaultTemplate: `RBC: Normal morphology
WBC: Within normal limits
Platelets: Adequate`,
    defaultValue: "",
  });

  const [toggles, setToggles] = useState({
    showOnReport: true,
    requiredField: false,
    allowMultiline: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSwitch = (
    key: keyof typeof toggles
  ) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Placeholder & Character Limit */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Placeholder */}
        <div>
          <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
            Placeholder Text
          </label>

          <input
            type="text"
            name="placeholder"
            value={form.placeholder}
            onChange={handleInputChange}
            placeholder="Enter result text..."
            className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
          />
        </div>

        {/* Character Limit */}
        <div>
          <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
            Character Limit
          </label>

          <input
            type="text"
            name="characterLimit"
            value={form.characterLimit}
            onChange={handleInputChange}
            className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
          />
        </div>
      </div>

      {/* Default Template */}
      <div>
        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
          Default Template
        </label>

        <textarea
          rows={4}
          name="defaultTemplate"
          value={form.defaultTemplate}
          onChange={handleInputChange}
          className="w-full resize-none rounded-lg border border-pneutral-300 bg-white px-4 py-3 text-p2 outline-none transition-all focus:border-secondary-500"
        />
      </div>

      {/* Default Value */}
      <div>
        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
          Default Value
        </label>

        <input
          type="text"
          name="defaultValue"
          value={form.defaultValue}
          onChange={handleInputChange}
          placeholder="Default Text (Optional)"
          className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Show on Report */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSwitch("showOnReport")}
              className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
                toggles.showOnReport
                  ? "bg-secondary-700"
                  : "bg-pneutral-200"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                  toggles.showOnReport ? "left-7" : "left-1"
                }`}
              />
            </button>

            <p className="text-p2 font-medium text-pneutral-900">
              Show on report
            </p>
          </div>

          {/* Allow Multiline */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSwitch("allowMultiline")}
              className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
                toggles.allowMultiline
                  ? "bg-secondary-700"
                  : "bg-pneutral-200"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                  toggles.allowMultiline
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

            <p className="text-p2 font-medium text-pneutral-900">
              Allow multiline
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSwitch("requiredField")}
              className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
                toggles.requiredField
                  ? "bg-secondary-700"
                  : "bg-pneutral-200"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                  toggles.requiredField
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

            <p className="text-p2 font-medium text-pneutral-900">
              Required field
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextArea1;