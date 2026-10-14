// Turns an uploaded Word (.docx) report format into a RadiologyFormat, so a technician can
// start a radiology report from their own document instead of the built-in USG library.
// The conversion runs in the browser (mammoth is loaded lazily, only when a file is chosen).

import type { RadiologyFormat, RadiologyFormatSection } from './usgFormats';
import { legacyDocToHtml } from './docLegacy';

export const MAX_DOCX_SIZE_BYTES = 5 * 1024 * 1024;

const isHeadingLike = (el: Element): boolean => {
  if (/^H[1-6]$/.test(el.tagName)) return true;
  if (el.tagName !== 'P') return false;
  const text = (el.textContent || '').trim();
  if (!text || text.length > 80) return false;
  // a paragraph made only of bold text ("FINDINGS:", "IMPRESSION") acts as a heading
  const bold = Array.from(el.querySelectorAll('strong, b')).map(b => b.textContent || '').join('').trim();
  return bold.length > 0 && bold === text;
};

const cleanTitle = (text: string) => text.trim().replace(/[:\s]+$/, '');

export const wordFileToRadiologyFormat = async (file: File): Promise<RadiologyFormat> => {
  const isDocx = /\.docx$/i.test(file.name);
  if (!isDocx && !/\.doc$/i.test(file.name)) {
    throw new Error('Please upload a Word document (.doc or .docx).');
  }
  if (file.size > MAX_DOCX_SIZE_BYTES) {
    throw new Error('The document is larger than 5 MB.');
  }

  const buffer = await file.arrayBuffer();
  let html: string;
  if (isDocx) {
    // @ts-expect-error - mammoth ships no types for its browser bundle
    const mammoth = (await import('mammoth/mammoth.browser')).default;
    html = (await mammoth.convertToHtml({ arrayBuffer: buffer })).value;
  } else {
    html = legacyDocToHtml(buffer);
  }

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.querySelectorAll('img, script').forEach(node => node.remove());

  const baseName = file.name.replace(/\.docx?$/i, '');
  const sections: RadiologyFormatSection[] = [];
  let current: { title: string; parts: string[] } | null = null;
  let docTitle = '';

  const flush = () => {
    if (!current) return;
    const content = current.parts.join('').trim();
    if (content || current.title) {
      sections.push({
        title: current.title || 'Report',
        content,
        type: /<table/i.test(content) ? 'table' : /<li/i.test(content) ? 'list' : 'text',
      });
    }
    current = null;
  };

  Array.from(doc.body.children).forEach(el => {
    if (!(el.textContent || '').trim() && !el.querySelector('table')) return; // empty paragraph
    if (isHeadingLike(el)) {
      // the first heading with nothing before it is the report title, not a section
      if (!docTitle && !current && !sections.length) {
        docTitle = cleanTitle(el.textContent || '');
        return;
      }
      flush();
      current = { title: cleanTitle(el.textContent || ''), parts: [] };
      return;
    }
    if (!current) current = { title: '', parts: [] };
    current.parts.push(el.outerHTML);
  });
  flush();

  if (!sections.length) {
    throw new Error('No readable text was found in this document.');
  }

  return {
    id: `upload-${Date.now()}`,
    group: 'Uploaded',
    name: baseName,
    title: docTitle || baseName,
    sections,
  };
};
