// Turns a report format stored in the backend (radiology_report_format) into a RadiologyFormat the
// report editor can use. The backend keeps only the text and tables of the Word file, as ordered blocks.

import type { RadiologyFormat, RadiologyFormatSection } from './usgFormats';
import type {
  RadiologyFormatBlock,
  RadiologyFormatContent,
  RadiologyFormatSummary,
} from '@/../services/radiologyServices';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const textToHtml = (text: string) => escapeHtml(text).replace(/\n/g, '<br>');

const cleanTitle = (text: string) => text.trim().replace(/[:\s]+$/, '');

// A short line that is a Word heading, ends with ":" or is written in capitals ("FINDINGS", "IMPRESSION")
const isHeadingLike = (block: RadiologyFormatBlock): boolean => {
  if (block.type !== 'paragraph') return false;
  if (/^heading|^title/i.test(block.style || '')) return true;
  const text = block.text.trim();
  if (!text || text.length > 80 || text.includes('\n')) return false;
  if (text.endsWith(':')) return true;
  return /[A-Z]/.test(text) && text === text.toUpperCase() && !/\d{3,}/.test(text);
};

const tableToHtml = (rows: string[][]) =>
  `<table><tbody>${rows
    .map(row => `<tr>${row.map(cell => `<td>${textToHtml(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;

// List entry (group is the doctor name, empty when none was given): metadata only, the sections are filled in by backendContentToFormat once loaded
export const backendSummaryToFormat = (summary: RadiologyFormatSummary): RadiologyFormat => ({
  id: `format-${summary.id}`,
  group: summary.doctorName?.trim() || '',
  name: summary.documentName.replace(/\.docx?$/i, ''),
  title: summary.documentName.replace(/\.docx?$/i, ''),
  sections: [],
});

export const backendContentToSections = (content: RadiologyFormatContent['content']): RadiologyFormatSection[] => {
  const blocks = content?.blocks ?? [];
  const sections: RadiologyFormatSection[] = [];
  let current: { title: string; parts: string[] } | null = null;
  let titleConsumed = false;

  const flush = () => {
    if (!current) return;
    const html = current.parts.join('').trim();
    if (html || current.title) {
      sections.push({
        title: current.title || 'Report',
        content: html,
        type: /<table/i.test(html) ? 'table' : 'text',
      });
    }
    current = null;
  };

  blocks.forEach(block => {
    if (isHeadingLike(block) && block.type === 'paragraph') {
      // the first heading with nothing before it is the report title, not a section
      if (!titleConsumed && !current && !sections.length) {
        titleConsumed = true;
        return;
      }
      flush();
      current = { title: cleanTitle(block.text), parts: [] };
      return;
    }
    if (!current) current = { title: '', parts: [] };
    current.parts.push(block.type === 'table' ? tableToHtml(block.rows) : `<p>${textToHtml(block.text)}</p>`);
  });
  flush();

  return sections;
};
