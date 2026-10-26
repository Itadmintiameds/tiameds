"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import NewModal from '../../../newcommoncomponent/NewModal';
import { useLabs } from '@/context/LabContext';
import { wordFileToRadiologyFormat } from '@/lib/radiology/docxFormat';
import { RadiologyFormat, formatToReportJson } from '@/lib/radiology/usgFormats';
import { backendContentToSections, backendSummaryToFormat } from '@/lib/radiology/backendFormat';
import {
  getRadiologyFormat,
  listRadiologyFormats,
  uploadRadiologyFormat,
} from '@/../services/radiologyServices';

const MAX_DOCX_SIZE_BYTES = 5 * 1024 * 1024;

interface RadiologyFormatPickerProps {
  testName: string;
  // true when the report already has text that applying a format would replace
  hasContent: boolean;
  onApply: (reportJson: string, format: RadiologyFormat) => void;
}

const RadiologyFormatPicker: React.FC<RadiologyFormatPickerProps> = ({ testName, hasContent, onApply }) => {
  const { currentLab } = useLabs();
  const labId = currentLab?.id;
  const [formats, setFormats] = useState<RadiologyFormat[]>([]);
  // sections of formats already fetched, keyed by format id; null = the backend has no parsed content
  const [contents, setContents] = useState<Record<string, RadiologyFormat['sections'] | null>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  // file waiting for the user to confirm the name it is saved under
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  // preview of the chosen file, read in the browser before anything is uploaded
  const [previewSections, setPreviewSections] = useState<RadiologyFormat['sections'] | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadFormats = async () => {
    if (!labId) return;
    const list = await listRadiologyFormats(labId);
    setFormats(list.map(backendSummaryToFormat));
  };

  useEffect(() => {
    if (!labId) return;
    let active = true;
    listRadiologyFormats(labId)
      .then(list => {
        if (!active) return;
        setFormats(list.map(backendSummaryToFormat));
        setIsLoaded(true);
      })
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [labId]);

  const fetchContent = async (formatId: string) => {
    if (!labId || formatId in contents) return;
    setIsLoadingContent(true);
    try {
      const data = await getRadiologyFormat(labId, formatId.replace('format-', ''));
      const sections = data.content ? backendContentToSections(data.content) : [];
      setContents(prev => ({ ...prev, [formatId]: sections.length ? sections : null }));
    } catch {
      setContents(prev => ({ ...prev, [formatId]: null }));
    } finally {
      setIsLoadingContent(false);
    }
  };

  const selectFormat = (formatId: string | null) => {
    setSelectedId(formatId);
    if (formatId) void fetchContent(formatId);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !labId) return;
    setUploadError('');
    if (!/\.docx?$/i.test(file.name)) {
      setUploadError('Please upload a Word document (.doc or .docx).');
      return;
    }
    if (file.size > MAX_DOCX_SIZE_BYTES) {
      setUploadError('The document is larger than 5 MB.');
      return;
    }
    setDocumentName(file.name.replace(/\.docx?$/i, ''));
    setPendingFile(file);
    setPreviewSections(null);
    setPreviewError('');
    setIsPreviewing(true);
    wordFileToRadiologyFormat(file)
      .then(format => setPreviewSections(format.sections))
      .catch(error => setPreviewError(error instanceof Error ? error.message : 'Could not preview the document.'))
      .finally(() => setIsPreviewing(false));
  };

  const closeSaveDialog = () => {
    if (isUploading) return;
    setPendingFile(null);
    setPreviewSections(null);
    setPreviewError('');
    setDocumentName('');
    setDoctorName('');
  };

  const saveFormat = async () => {
    if (!pendingFile || !labId) return;
    const name = documentName.trim();
    if (!name) return;
    // the backend checks the extension of the saved name, so keep the file's own extension
    const extension = pendingFile.name.match(/\.docx?$/i)?.[0] ?? '';
    const finalName = /\.docx?$/i.test(name) ? name : `${name}${extension}`;
    setUploadError('');
    setIsUploading(true);
    try {
      const saved = await uploadRadiologyFormat(labId, pendingFile, {
        documentName: finalName,
        doctorName: doctorName.trim() || undefined,
      });
      await loadFormats();
      setPendingFile(null);
      setPreviewSections(null);
      setDocumentName('');
      setDoctorName('');
      setSearch('');
      setGroup('');
      setIsOpen(true);
      selectFormat(`format-${saved.id}`);
      if (!saved.contentParsed) {
        setUploadError('The format was saved, but its text could not be read for preview.');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload the document.');
    } finally {
      setIsUploading(false);
    }
  };

  const groups = useMemo(() => Array.from(new Set(formats.map(f => f.group).filter(Boolean))), [formats]);

  const filtered = useMemo(() => {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const base = group ? formats.filter(f => f.group === group) : formats;
    const matches = base.filter(f => {
      const haystack = `${f.group} ${f.name} ${f.title}`.toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    return matches;
  }, [formats, search, group]);

  const selectedBase = formats.find(f => f.id === selectedId) || null;
  const selectedSections = selectedBase ? contents[selectedBase.id] : undefined;
  const selected: RadiologyFormat | null = selectedBase
    ? { ...selectedBase, sections: selectedSections ?? [] }
    : null;
  const canApply = !!selected && selected.sections.length > 0;

  const openPicker = (formatId?: string) => {
    setSearch('');
    setGroup('');
    selectFormat(formatId || null);
    setIsOpen(true);
  };

  const applySelected = () => {
    if (!selected || !canApply) return;
    onApply(formatToReportJson(selected, testName), selected);
    setIsOpen(false);
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-600">
        Could not load the report formats. Refresh the page to try again.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-info-200 bg-info-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-pneutral-900">Report format</p>
          <p className="text-xs text-pneutral-500">
            Choose a saved report format or upload a Word document (it is saved to the format list), then edit the report.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-full border border-secondary-700 bg-secondary-700 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Word format (.doc / .docx)'}
          </button>
          <button
            type="button"
            onClick={() => openPicker()}
            disabled={!isLoaded}
            className="rounded-full border border-secondary-700 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
          >
            {isLoaded ? `Browse all formats (${formats.length})` : 'Loading formats...'}
          </button>
        </div>
      </div>
      {uploadError && <p className="mt-2 text-xs text-danger-600">{uploadError}</p>}

      <NewModal
        isOpen={!!pendingFile}
        onClose={closeSaveDialog}
        title="Save report format"
        modalClassName="max-w-3xl"
        modalHeightClassName="h-auto"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeSaveDialog}
              disabled={isUploading}
              className="rounded-full border border-pneutral-600 px-4 py-2 text-xs font-medium text-pneutral-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveFormat}
              disabled={isUploading || !documentName.trim()}
              className="rounded-full bg-secondary-700 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {isUploading ? 'Saving...' : 'Save format'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-pneutral-500">File: {pendingFile?.name}</p>
          {uploadError && <p className="text-xs text-danger-600">{uploadError}</p>}
          <label className="block text-xs font-medium text-pneutral-700">
            Format name <span className="text-warning-500">*</span>
            <input
              type="text"
              value={documentName}
              onChange={e => setDocumentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveFormat()}
              autoFocus
              placeholder="e.g. USG Thyroid Normal"
              className="mt-1 h-9 w-full rounded-full border border-info-500 bg-white px-3 text-sm outline-none focus:border-secondary-700"
            />
          </label>
          <label className="block text-xs font-medium text-pneutral-700">
            Doctor name (optional)
            <input
              type="text"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              className="mt-1 h-9 w-full rounded-full border border-info-500 bg-white px-3 text-sm outline-none focus:border-secondary-700"
            />
          </label>
          <div>
            <p className="mb-1 text-xs font-medium text-pneutral-700">Preview</p>
            <div className="max-h-[45vh] overflow-y-auto rounded-lg border border-pneutral-200 bg-white p-3">
              {isPreviewing && <p className="text-sm text-pneutral-500">Reading document...</p>}
              {previewError && <p className="text-sm text-danger-600">{previewError}</p>}
              {previewSections?.map((section, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-sm font-semibold text-pneutral-900">{section.title}</h4>
                  <div
                    className="report-html prose prose-sm max-w-none text-pneutral-700"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </NewModal>

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
                disabled={!canApply}
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
                    onClick={() => selectFormat(format.id)}
                    className={`flex w-full items-start justify-between gap-2 border-b border-pneutral-100 px-3 py-2 text-left last:border-0 ${
                      format.id === selectedId ? 'bg-info-100' : 'hover:bg-info-50'
                    }`}
                  >
                    <span className="min-w-0 break-words text-sm font-medium text-pneutral-900">{format.name}</span>
                    {format.group && (
                      <span className="shrink-0 text-right text-xs text-pneutral-500">{format.group}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="min-h-0 overflow-y-auto rounded-lg border border-pneutral-200 bg-white p-4">
            {selected ? (
              <>
                {selected.group && <p className="text-xs text-pneutral-500">{selected.group}</p>}
                <h3 className="mb-3 text-base font-semibold text-pneutral-900">{selected.name}</h3>
                {isLoadingContent && selectedSections === undefined && (
                  <p className="text-sm text-pneutral-500">Loading format...</p>
                )}
                {selectedSections === null && (
                  <p className="text-sm text-pneutral-500">
                    The text of this format is not available for preview. Upload the Word document again to use it.
                  </p>
                )}
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
