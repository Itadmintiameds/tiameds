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
}
