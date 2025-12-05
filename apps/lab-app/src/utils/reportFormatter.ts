/**
 * Utility function to format JSON report data into a professionally formatted medical report
 */

interface FetalParameters {
  [key: string]: {
    [parameter: string]: string;
  };
}

interface ReportData {
  note?: string;
  testName?: string;
  impression?: string;
  limitations?: string[];
  organReview?: string[];
  observations?: string[];
  fetalParameters?: FetalParameters;
  [key: string]: unknown; // Allow for additional fields
}

export function formatMedicalReport(reportJson: string): string {
  try {
    const data: ReportData = JSON.parse(reportJson);
    let formattedReport = '';

    // Test Name
    if (data.testName) {
      formattedReport += `**Test Name:** ${data.testName}\n\n`;
    }

    // Note
    if (data.note) {
      formattedReport += `**Note:** ${data.note}\n\n`;
    }

    // Impression
    if (data.impression) {
      formattedReport += `**Impression:**\n${data.impression}\n\n`;
    }

    // Limitations
    if (data.limitations && Array.isArray(data.limitations) && data.limitations.length > 0) {
      formattedReport += `**Limitations:**\n\n`;
      data.limitations.forEach(limitation => {
        formattedReport += `• ${limitation}\n`;
      });
      formattedReport += '\n';
    }

    // Organ Review
    if (data.organReview && Array.isArray(data.organReview) && data.organReview.length > 0) {
      formattedReport += `**Organ Review:**\n\n`;
      data.organReview.forEach(organ => {
        formattedReport += `• ${organ}\n`;
      });
      formattedReport += '\n';
    }

    // Observations
    if (data.observations && Array.isArray(data.observations) && data.observations.length > 0) {
      formattedReport += `**Observations:**\n\n`;
      data.observations.forEach(observation => {
        formattedReport += `• ${observation}\n`;
      });
      formattedReport += '\n';
    }

    // Fetal Parameters
    if (data.fetalParameters && typeof data.fetalParameters === 'object') {
      formattedReport += `**Fetal Parameters:**\n\n`;
      Object.entries(data.fetalParameters).forEach(([fetus, parameters]) => {
        formattedReport += `**${fetus}:**\n\n`;
        Object.entries(parameters).forEach(([param, value]) => {
          formattedReport += `${param}: ${value}\n`;
        });
        formattedReport += '\n';
      });
    }

    // Handle other common medical report fields
    const commonFields = [
      'findings', 'results', 'diagnosis', 'recommendations', 
      'conclusion', 'summary', 'clinicalHistory', 'technique',
      'referenceRanges', 'values', 'units', 'normalRange',
      'abnormal', 'critical', 'flagged'
    ];

    commonFields.forEach(field => {
      const fieldValue = data[field];
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
        formattedReport += `**${fieldName}:**\n`;
        
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach((item) => {
            formattedReport += `• ${String(item)}\n`;
          });
        } else if (typeof fieldValue === 'object') {
          Object.entries(fieldValue as Record<string, unknown>).forEach(([key, value]) => {
            formattedReport += `${key}: ${String(value)}\n`;
          });
        } else {
          formattedReport += `${String(fieldValue)}\n`;
        }
        formattedReport += '\n';
      }
    });

    // Handle any remaining fields that weren't processed
    Object.entries(data).forEach(([key, value]) => {
      if (!['note', 'testName', 'impression', 'limitations', 'organReview', 'observations', 'fetalParameters', ...commonFields].includes(key)) {
        if (value !== undefined && value !== null && value !== '') {
          const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          formattedReport += `**${fieldName}:**\n`;
          
          if (Array.isArray(value)) {
            value.forEach((item) => {
              formattedReport += `• ${String(item)}\n`;
            });
          } else if (typeof value === 'object') {
            Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
              formattedReport += `${subKey}: ${String(subValue)}\n`;
            });
          } else {
            formattedReport += `${String(value)}\n`;
          }
          formattedReport += '\n';
        }
      }
    });

    return formattedReport.trim();

  } catch (error) {
    console.error('Error formatting medical report:', error);
    return 'Error: Unable to parse report data. Please check the JSON format.';
  }
}

/**
 * Convert formatted text to HTML for rich text display
 */
export function formatMedicalReportToHTML(reportJson: string): string {
  try {
    const data = JSON.parse(reportJson);
    
    // Check if this is the new structured format with tables, sections, etc.
    if (data.tables || (data.sections && Array.isArray(data.sections)) || (data.impression && Array.isArray(data.impression))) {
      return formatStructuredReportToHTML(data);
    }
    
    // Fallback to old format
    const formattedText = formatMedicalReport(reportJson);
    
    let html = formattedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>') // Bullet points
      .replace(/\n\n/g, '</p><p>') // Paragraph breaks
      .replace(/^(.*)$/m, '<p>$1</p>') // Wrap in paragraphs
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p><ul>/g, '<ul>') // Fix ul inside p
      .replace(/<\/ul><\/p>/g, '</ul>') // Fix ul inside p
      .replace(/<p><li>/g, '<li>') // Fix li inside p
      .replace(/<\/li><\/p>/g, '</li>'); // Fix li inside p

    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    return html;
  } catch (error) {
    console.error('Error formatting report to HTML:', error);
    return '<p>Error: Unable to parse report data.</p>';
  }
}

/**
 * Format the new structured report format to HTML
 */
function formatStructuredReportToHTML(data: any): string {
  let html = '';

  // Impression (array of strings)
  if (data.impression && Array.isArray(data.impression) && data.impression.length > 0) {
    html += '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Impression:</strong> ';
    html += data.impression.map((item: string) => item).join(', ');
    html += '</p>';
  }

  // Tables
  if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
    html += '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Tables:</strong></p>';
    data.tables.forEach((table: any) => {
      if (table.title) {
        html += `<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>${table.title}</strong></p>`;
      }
      if (table.headers && Array.isArray(table.headers) && table.rows && Array.isArray(table.rows)) {
        html += '<table style="border-collapse: collapse; width: 100%; margin: 4px 0; font-size: 10px;">';
        // Header row
        html += '<thead><tr>';
        table.headers.forEach((header: string) => {
          html += `<th style="border: 1px solid #ddd; padding: 3px 4px; text-align: left; background-color: #f2f2f2; font-size: 10px; font-weight: bold;">${header}</th>`;
        });
        html += '</tr></thead>';
        // Data rows
        html += '<tbody>';
        table.rows.forEach((row: any[]) => {
          html += '<tr>';
          row.forEach((cell: any) => {
            html += `<td style="border: 1px solid #ddd; padding: 3px 4px; font-size: 10px;">${String(cell)}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
    });
  }

  // Sections
  if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
    html += '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Sections:</strong></p>';
    data.sections.forEach((section: any) => {
      if (section.title) {
        html += `<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>${section.title}</strong></p>`;
      }
      if (section.content) {
        if (section.contentType === 'keyValue' && typeof section.content === 'object') {
          // Handle key-value pairs
          html += '<ul style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">';
          Object.entries(section.content).forEach(([key, value]) => {
            html += `<li style="margin: 2px 0;"><strong>${key}:</strong> ${String(value)}</li>`;
          });
          html += '</ul>';
        } else if (typeof section.content === 'string') {
          html += `<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;">${section.content}</p>`;
        } else if (typeof section.content === 'object') {
          // Fallback for object content
          html += '<ul style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">';
          Object.entries(section.content).forEach(([key, value]) => {
            html += `<li style="margin: 2px 0;"><strong>${key}:</strong> ${String(value)}</li>`;
          });
          html += '</ul>';
        }
      }
    });
  }

  // Report Type
  if (data.reportType) {
    html += `<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Report Type:</strong> ${data.reportType}</p>`;
  }

  // Measurements
  if (data.measurements && typeof data.measurements === 'object') {
    html += '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Measurements:</strong> ';
    const measurementParts: string[] = [];
    Object.entries(data.measurements).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === 'object' && value.value !== undefined && value.unit !== undefined) {
        measurementParts.push(`${key}: ${value.value} ${value.unit}`);
      } else {
        measurementParts.push(`${key}: ${String(value)}`);
      }
    });
    html += measurementParts.join(' ');
    html += '</p>';
  }

  return html || '<p>No report data available.</p>';
}
