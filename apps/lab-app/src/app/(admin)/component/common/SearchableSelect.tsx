'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}

// Select-only dropdown with a search box (no free-text value).
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled = false,
  emptyText = "No options found",
  className = "",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selected = options.find(o => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const hasGroups = filtered.some(o => o.group);
  const groups = hasGroups
    ? Array.from(new Set(filtered.map(o => o.group ?? "")))
    : [""];

  const renderOption = (o: SearchableSelectOption) => (
    <li key={`${o.group ?? ""}-${o.value}`}>
      <button
        type="button"
        onClick={() => {
          onChange(o.value);
          setOpen(false);
        }}
        className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
          o.value === value ? "bg-purple-50 font-medium text-purple-800" : "text-gray-800"
        }`}
      >
        {o.label}
      </button>
    </li>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm text-left focus:ring-1 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown className="text-gray-400 shrink-0" size={12} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="relative p-2 border-b border-gray-100">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-500">{emptyText}</p>
            ) : (
              groups.map(group => (
                <div key={group || "_"}>
                  {group && (
                    <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {group}
                    </p>
                  )}
                  <ul>{filtered.filter(o => (o.group ?? "") === group).map(renderOption)}</ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
