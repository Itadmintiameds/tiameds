// Single source of truth for "print on pre-printed letterhead vs. plain paper". The invoice
// (PatientDetailsViewComponent) and the lab report (CommonReportView2) both import from here, so
// the option labels, the default, and the letterhead geometry cannot drift apart.
//
// Neither document prints through @media print / @page. Each one is rasterised with html2canvas,
// assembled into an A4 PDF with jsPDF and opened in the browser's print dialog, so what the two
// must share is the physical page geometry below rather than a stylesheet.

export type PrintType = 'letterhead' | 'plain';

export const DEFAULT_PRINT_TYPE: PrintType = 'plain';

export interface PrintTypeOption<T extends string = PrintType> {
  value: T;
  label: string;
}

export const LETTERHEAD_OPTION: PrintTypeOption = { value: 'letterhead', label: 'Print on Letterhead' };
export const PLAIN_OPTION: PrintTypeOption = { value: 'plain', label: 'Print on Plain Paper' };

// Same order the invoice dropdown has always used (letterhead first); the default is still plain.
export const PRINT_TYPE_OPTIONS: PrintTypeOption[] = [LETTERHEAD_OPTION, PLAIN_OPTION];

// Prefix match so the invoice's 'letterhead-dept' variant counts as letterhead too.
export const isLetterheadPrintType = (printType: string): boolean => printType.startsWith('letterhead');

// Letterhead stock already carries the lab's logo, name, address and phone in its pre-printed
// header band, so those must be left out of the printed page instead of being drawn over it.
export const showsLabHeader = (printType: string): boolean => !isLetterheadPrintType(printType);

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Both documents are laid out on a 210mm-wide virtual page (margins and all), rasterised, and
// then dropped onto the A4 sheet PDF_IMAGE_OFFSET_MM in from the edge, scaled to PDF_IMAGE_WIDTH_MM
// wide. So a virtual length L lands on paper as L * PDF_IMAGE_SCALE, and a virtual position P
// lands at PDF_IMAGE_OFFSET_MM + P * PDF_IMAGE_SCALE.
export const PDF_IMAGE_OFFSET_MM = 10;
export const PDF_IMAGE_WIDTH_MM = A4_WIDTH_MM - PDF_IMAGE_OFFSET_MM * 2;
export const PDF_IMAGE_SCALE = PDF_IMAGE_WIDTH_MM / A4_WIDTH_MM;

// A virtual page's rendered height must stay under this or the export clips. With the placement
// above, a virtual height H lands at real 10 + H*(19/21). Staying under this keeps content both on
// the physical page (needs H <= 317.2) and clear of the letterhead's pre-printed bottom band,
// which starts 20mm up from the page edge (needs H <= 315). The gap below 315 is deliberate
// headroom for text that wraps a line more than the pagination estimates predict.
export const SAFE_BUDGET_MM = 308;

// Measured off the CURE+ Hospitals pre-printed letterhead stock (A4): the purple header band runs
// ~56mm from the top edge, the footer band starts ~20mm from the bottom edge, and the white
// printable area is inset ~16mm from the left/right edges of the purple frame. Content on
// "Letterhead" print types must stay inside that box. These are virtual-page lengths: the invoice
// applies them as CSS padding on its page, which then goes through the placement above.
export const LETTERHEAD_MARGINS_MM = {
  top: 56,
  bottom: 20,
  left: 16,
  right: 16,
} as const;

// The same margins as CSS padding. Each side is capped at its real length but shrinks in
// proportion when the page is narrower than A4 (percentage padding resolves against the
// containing block's width), so an on-screen preview keeps the page's proportions on a small
// screen. In an A4-wide container -- where the invoice PDF is captured -- the percentage equals
// the mm value, so the exported page is exactly LETTERHEAD_MARGINS_MM.
const proportionalPadding = (mm: number) => `min(${mm}mm, ${(mm / A4_WIDTH_MM) * 100}%)`;

export const LETTERHEAD_MARGINS = {
  top: proportionalPadding(LETTERHEAD_MARGINS_MM.top),
  bottom: proportionalPadding(LETTERHEAD_MARGINS_MM.bottom),
  left: proportionalPadding(LETTERHEAD_MARGINS_MM.left),
  right: proportionalPadding(LETTERHEAD_MARGINS_MM.right),
} as const;

// Where the letterhead content box ends up on the physical A4 sheet, in real mm. This is the
// rectangle a printed invoice occupies, derived from the same margins and placement it uses, so a
// document that places its pre-rendered blocks directly in sheet coordinates (the lab report) can
// reproduce it exactly. layoutWidthMm is the width to lay that document out at before scaling.
const LETTERHEAD_LAYOUT_WIDTH_MM = A4_WIDTH_MM - LETTERHEAD_MARGINS_MM.left - LETTERHEAD_MARGINS_MM.right;

export const LETTERHEAD_PRINT_FRAME_MM = {
  layoutWidthMm: LETTERHEAD_LAYOUT_WIDTH_MM,
  leftMm: PDF_IMAGE_OFFSET_MM + LETTERHEAD_MARGINS_MM.left * PDF_IMAGE_SCALE,
  widthMm: LETTERHEAD_LAYOUT_WIDTH_MM * PDF_IMAGE_SCALE,
  topMm: PDF_IMAGE_OFFSET_MM + LETTERHEAD_MARGINS_MM.top * PDF_IMAGE_SCALE,
  bottomMm: A4_HEIGHT_MM - (PDF_IMAGE_OFFSET_MM + (SAFE_BUDGET_MM - LETTERHEAD_MARGINS_MM.bottom) * PDF_IMAGE_SCALE),
} as const;
