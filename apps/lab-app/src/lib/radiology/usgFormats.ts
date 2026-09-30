// USG / Doppler report formats, generated from the lab's Word formats ("USG New FORMAT" folder).
// Patient headers, radiologist signatures and sample measurements were removed at generation time:
// measured values/dates are "___" / "__/__/____" placeholders the technician fills in.
// The data is loaded lazily (dynamic import) so it is only downloaded when a radiology report is opened.

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

// Keywords in a lab test name that point to a format group
export const RADIOLOGY_GROUP_KEYWORDS: Record<string, string[]> = {
  'Abdomen & Pelvis': ['ABDOMEN', 'ABD', 'PELVIS', 'PELVIC', 'KUB', 'FOLLICULAR', 'FOLLICLE', 'FOLLICULOMETRY', 'IUCD', 'GALL BLADDER', 'LIVER', 'APPENDIX', 'APPENDICITIS', 'HEPATOBILIARY'],
  'Antenatal / Obstetric': ['OBG', 'OBSTETRIC', 'OBSTETRICS', 'ANTENATAL', 'ANC', 'PREGNANCY', 'GESTATION', 'NT', 'NUCHAL', 'TIFFA', 'ANOMALY', 'GROWTH', 'FETAL', 'FOETAL', 'BPP', 'BIOPHYSICAL', 'TWIN', 'TWINS', 'EARLY OB', 'DATING', 'LEVEL II', 'IUD', 'ABORTION'],
  'Arterial Doppler': ['ARTERIAL', 'ARTERY'],
  'Venous Doppler': ['VENOUS', 'DVT', 'VARICOSE', 'VEIN', 'VEINS'],
  'Arterial & Venous Doppler': ['ARTERIAL', 'VENOUS'],
  'Renal Doppler': ['RENAL', 'KIDNEY', 'TRANSPLANT'],
  'Breast': ['BREAST', 'BREASTS', 'SONOMAMMOGRAPHY', 'GYNAECOMASTIA', 'GYNECOMASTIA'],
  'Ectopic Pregnancy': ['ECTOPIC'],
  'Neck': ['NECK', 'LYMPH', 'LYMPHADENOPATHY', 'BRANCHIAL'],
  'Parotid Gland': ['PAROTID', 'SALIVARY'],
  'Penile': ['PENIS', 'PENILE'],
  'Perineal / Perianal': ['PERIANAL', 'PERINEAL', 'PERINEUM', 'TRUS', 'TRANSRECTAL', 'FISTULA', 'PILONIDAL', 'ANAL'],
  'RPOC / Post Abortive': ['RPOC', 'POST ABORTIVE', 'RETAINED'],
  'Scalp': ['SCALP'],
  'Submandibular Region': ['SUBMANDIBULAR'],
  'Thyroid': ['THYROID'],
  'Gluteal & Groin': ['GLUTEAL', 'GROIN'],
  'Inguino-Scrotal': ['SCROTUM', 'SCROTAL', 'TESTIS', 'TESTES', 'TESTICULAR', 'INGUINAL', 'INGUINO', 'HYDROCELE', 'VARICOCELE', 'HERNIA'],
};

// Words that appear in most format names and say nothing about which variant fits
const GENERIC_WORDS = new Set([
  'USG', 'HRUS', 'US', 'ULTRASOUND', 'ULTRASONOGRAPHY', 'SONOGRAPHY', 'DOPPLER', 'DOP', 'SCAN', 'STUDY',
  'AND', 'OF', 'THE', 'WITH', 'TEST', 'REPORT',
]);

const DOPPLER_GROUPS =['Arterial Doppler', 'Venous Doppler', 'Arterial & Venous Doppler', 'Renal Doppler'];

let formatsPromise: Promise<RadiologyFormat[]> | null = null;

export const loadRadiologyFormats = (): Promise<RadiologyFormat[]> => {
  if (!formatsPromise) {
    formatsPromise = import('./usgFormats.json')
      .then(mod => (mod.default ?? mod) as unknown as RadiologyFormat[])
      .catch(error => {
        formatsPromise = null;
        throw error;
      });
  }
  return formatsPromise;
};

const tokenize = (value: string) =>
  ` ${value.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `;

const countKeywordHits = (tokens: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => (tokens.includes(` ${keyword} `) ? score + keyword.length : score), 0);

// Formats that fit a lab test name, best first. Empty when nothing matches.
export const rankFormatsForTest = (formats: RadiologyFormat[], testName: string): RadiologyFormat[] => {
  const tokens = tokenize(testName);
  const isDoppler = tokens.includes(' DOPPLER ') || tokens.includes(' DOP ');

  const groupScores: Record<string, number> = {};
  Object.entries(RADIOLOGY_GROUP_KEYWORDS).forEach(([group, keywords]) => {
    let score = countKeywordHits(tokens, keywords) * 10;
    if (group === 'Arterial & Venous Doppler') {
      // only when the test explicitly covers both
      score = tokens.includes(' ARTERIAL ') && tokens.includes(' VENOUS ') ? score + 5 : 0;
    }
    if (isDoppler && DOPPLER_GROUPS.includes(group)) score += 3;
    groupScores[group] = score;
  });

  const testWords = new Set(
    tokens.trim().split(' ').filter(word => word.length > 1 && !GENERIC_WORDS.has(word))
  );

  return formats
    .map(format => {
      const groupScore = groupScores[format.group] || 0;
      if (!groupScore) return { format, score: 0 };
      const nameWords = tokenize(`${format.name} ${format.title}`).trim().split(' ');
      const overlap = nameWords.filter(word => testWords.has(word)).length;
      // with no more specific match, the normal study is the most useful starting point
      const normalBonus = /\bNORMAL\b/i.test(format.name) ? 3 : 0;
      return { format, score: groupScore + overlap * 2 + normalBonus };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.format.name.localeCompare(b.format.name))
    .map(entry => entry.format);
};

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
