"use client";

import React, { useEffect, useMemo, useState } from 'react';
import NewModal from '../../../newcommoncomponent/NewModal';
import {
  RadiologyFormat,
  formatToReportJson,
  loadRadiologyFormats,
  rankFormatsForTest,
} from '@/lib/radiology/usgFormats';

interface RadiologyFormatPickerProps {
  testName: string;
  // true when the report already has text that applying a format would replace
  hasContent: boolean;
  onApply: (reportJson: string, format: RadiologyFormat) => void;
}

const SUGGESTION_COUNT = 6;

const RadiologyFormatPicker: React.FC<RadiologyFormatPickerProps> = ({ testName, hasContent, onApply }) => {
  const [formats, setFormats] = useState<RadiologyFormat[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadRadiologyFormats()
      .then(data => active && setFormats(data))
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, []);

  const suggestions = useMemo(() => rankFormatsForTest(formats, testName), [formats, testName]);
  const groups = useMemo(() => Array.from(new Set(formats.map(f => f.group))), [formats]);

  const filtered = useMemo(() => {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const base = group ? formats.filter(f => f.group === group) : formats;
    const matches = base.filter(f => {
      const haystack = `${f.group} ${f.name} ${f.title}`.toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    if (terms.length || group) return matches;
    // no filter: suggested formats for this test first
    const suggestedIds = new Set(suggestions.map(f => f.id));
    return [...suggestions, ...matches.filter(f => !suggestedIds.has(f.id))];
  }, [formats, search, group, suggestions]);

  const selected = formats.find(f => f.id === selectedId) || null;

  const openPicker = (formatId?: string) => {
    setSearch('');
    setGroup(formatId ? '' : suggestions[0]?.group || '');
    setSelectedId(formatId || suggestions[0]?.id || null);
    setIsOpen(true);
  };

  const applySelected = () => {
    if (!selected) return;
    onApply(formatToReportJson(selected, testName), selected);
    setIsOpen(false);
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-600">
        Could not load the USG report formats. Refresh the page to try again.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-info-200 bg-info-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-pneutral-900">Report format</p>
          <p className="text-xs text-pneutral-500">
            {suggestions.length
              ? `Suggested formats for ${testName}. Pick one, then fill in the ___ values and edit the findings.`
              : 'Choose a USG / Doppler format to start the report.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPicker()}
          disabled={!formats.length}
          className="rounded-full border border-secondary-700 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
        >
          {formats.length ? `Browse all formats (${formats.length})` : 'Loading formats...'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.slice(0, SUGGESTION_COUNT).map(format => (
            <button
              key={format.id}
              type="button"
              onClick={() => openPicker(format.id)}
              className="rounded-full border border-info-300 bg-white px-3 py-1 text-xs text-pneutral-800 hover:border-secondary-700 hover:text-secondary-700"
              title={`${format.group} — ${format.title}`}
            >
              {format.name}
            </button>
          ))}
        </div>
      )}

      <NewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose report format"
        modalClassName="max-w-6xl"
        modalHeightClassName="h-[85vh]"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-pneutral-500">
              {hasContent
                ? 'Using a format replaces the report text entered so far.'
                : 'Measurements and dates are left as ___ for you to fill in.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-pneutral-600 px-4 py-2 text-xs font-medium text-pneutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySelected}
                disabled={!selected}
                className="rounded-full bg-secondary-700 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                Use this format
              </button>
            </div>
          </div>
        }
      >
        <div className="grid h-full min-h-0 gap-4 md:grid-cols-[320px_1fr]">
          {/* Format list */}
          <div className="flex min-h-0 flex-col gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search e.g. thyroid, DVT, NT scan"
              className="h-9 w-full rounded-full border border-info-500 bg-white px-3 text-sm outline-none focus:border-secondary-700"
            />
            <select
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="h-9 w-full rounded-full border border-info-500 bg-white px-3 text-sm outline-none focus:border-secondary-700"
            >
              <option value="">All groups</option>
              {groups.map(g => (
                <option key={g} value={g}>
                  {g} ({formats.filter(f => f.group === g).length})
                </option>
              ))}
            </select>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-pneutral-200">
              {filtered.length === 0 ? (
                <p className="p-4 text-center text-sm text-pneutral-500">No formats match.</p>
              ) : (
                filtered.map(format => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setSelectedId(format.id)}
                    className={`block w-full border-b border-pneutral-100 px-3 py-2 text-left last:border-0 ${
                      format.id === selectedId ? 'bg-info-100' : 'hover:bg-info-50'
                    }`}
                  >
                    <span className="block text-sm font-medium text-pneutral-900">{format.name}</span>
                    <span className="block text-xs text-pneutral-500">{format.group}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="min-h-0 overflow-y-auto rounded-lg border border-pneutral-200 bg-white p-4">
            {selected ? (
              <>
                <p className="text-xs text-pneutral-500">{selected.group}</p>
                <h3 className="mb-3 text-base font-semibold text-pneutral-900">{selected.name}</h3>
                {selected.sections.map((section, index) => (
                  <div key={index} className="mb-3">
                    <h4 className="text-sm font-semibold text-pneutral-900">{section.title}</h4>
                    <div
                      className="report-html prose prose-sm max-w-none text-pneutral-700"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-sm text-pneutral-500">Select a format to preview it.</p>
            )}
          </div>
        </div>
      </NewModal>
    </div>
  );
};

export default RadiologyFormatPicker;
