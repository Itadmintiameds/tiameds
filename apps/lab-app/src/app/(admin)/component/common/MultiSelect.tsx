import { useState, useEffect } from 'react';
// import './MultiSelect.css'; // Import the CSS file

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  isMulti?: boolean;
  options: Option[];
  className?: string;
  classNamePrefix?: string;
  value: Option[];
  onChange: (selectedOptions: Option[]) => void;
  required?: boolean;
  placeholder?: string;
}

function MultiSelect({
  isMulti = true,
  options,
  className = '',
  classNamePrefix = '',
  value,
  onChange,
  required = false,
  placeholder = 'Select options...',
}: SelectProps) {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(value.map((v) => v.value))
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedValues(new Set(value.map((v) => v.value)));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedValues = new Set(
      Array.from(e.target.selectedOptions).map((option) => option.value)
    );
    
    setSelectedValues(newSelectedValues);
    
    const selectedOptions = options.filter((option) =>
      newSelectedValues.has(option.value)
    );
    onChange(selectedOptions);
  };

  const toggleOption = (optionValue: string) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(optionValue)) {
      newSelectedValues.delete(optionValue);
    } else {
      newSelectedValues.add(optionValue);
    }
    
    setSelectedValues(newSelectedValues);
    const selectedOptions = options.filter((opt) => newSelectedValues.has(opt.value));
    onChange(selectedOptions);
  };

  const removeOption = (optionValue: string) => {
    const newSelectedValues = new Set(selectedValues);
    newSelectedValues.delete(optionValue);
    
    setSelectedValues(newSelectedValues);
    const selectedOptions = options.filter((opt) => newSelectedValues.has(opt.value));
    onChange(selectedOptions);
  };

  return (
    <div className={`multi-select-container ${className}`}>
      <div 
        className="multi-select-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.size > 0 ? (
          <div className="selected-preview">
            {Array.from(selectedValues).slice(0, 3).map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <span key={value} className="selected-preview-tag">
                  {option?.label}
                </span>
              );
            })}
            {selectedValues.size > 3 && (
              <span className="more-count">+{selectedValues.size - 3} more</span>
            )}
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <span className="dropdown-icon">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          <select
            multiple={isMulti}
            className={`multi-select-input ${classNamePrefix}`}
            value={Array.from(selectedValues)}
            onChange={handleChange}
            required={required}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className={selectedValues.has(option.value) ? 'selected' : ''}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="options-list">
            {options.map((option) => (
              <div
                key={option.value}
                className={`option-item ${selectedValues.has(option.value) ? 'selected' : ''}`}
                onClick={() => toggleOption(option.value)}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.has(option.value)}
                  readOnly
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedValues.size > 0 && (
        <div className="selected-tags">
          {Array.from(selectedValues).map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <span key={value} className="selected-tag">
                {option?.label}
                <button
                  type="button"
                  className="remove-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(value);
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;