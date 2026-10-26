// Report format shapes used by the radiology report editor. Formats themselves are stored in the
// backend (radiology_report_format) and converted by backendFormat.ts.

export interface RadiologyFormatSection {
  title: string;
  content: string; // HTML (TipTap compatible: p, strong, ul/li, table)
  type: 'text' | 'table' | 'list';
}

export interface RadiologyFormat {
  id: string;
  group: string;
  name: string;
  title: string;
  sections: RadiologyFormatSection[];
}

// Serialises a format in the DetailedReportEditor ReportData structure (what is stored as reportJson).
export const formatToReportJson = (format: RadiologyFormat, testName?: string): string =>
  JSON.stringify(
    {
      title: testName || format.title,
      description: '',
      sections: format.sections.map((section, index) => ({
        id: String(index + 1),
        title: section.title,
        content: section.content,
        type: section.type,
        order: index + 1,
      })),
      metadata: {
        author: '',
        date: new Date().toISOString().split('T')[0],
        version: '1.0',
        format: format.id,
      },
    },
    null,
    2
  );
