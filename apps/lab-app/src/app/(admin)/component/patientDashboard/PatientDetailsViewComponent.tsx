'use client';
import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import { Patient, BillingTransaction } from '@/types/patient/patient';
// import { calculateAge, formatAgeForDisplay } from '@/utils/ageUtils';
import { formatAgeForDisplay } from '@/utils/ageUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FaFileInvoiceDollar, FaFilePdf, FaPrint, FaSignature } from 'react-icons/fa';
import Loader from '../common/Loader';
import { MdDownloading } from "react-icons/md";
import Image from 'next/image';

const A4_WIDTH = 210; // mm

// ---- Page geometry, in mm of the 210mm-wide virtual page that generatePDF() renders
// and rasterises. Every value below was measured from a real headless-Chrome render of
// this exact markup (not estimated), then rounded up slightly as a safety margin.
// Pagination is driven by these so a page holds as much as physically fits and no more
// — a small invoice stays on one page, a large one splits only where it genuinely must.
const LETTERHEAD_PAGE_PADDING_MM = 44;       // 30 top + 14 bottom (see LETTERHEAD_MARGINS)
const PLAIN_PAGE_PADDING_MM = 10.6;          // 20px top + 20px bottom
const HEADER_PATIENT_MM = 60;                // gradient title bar + patient/visit info card.
                                             // Covers both header variants: letterhead
                                             // (logo suppressed) and plain paper (logo +
                                             // lab name block). Bumped +4mm over the plain
                                             // black/white header for the colorful redesign's
                                             // gradient bar chrome -- re-verify against a
                                             // real render if pages start breaking oddly.
const FOOTER_MM = 28;                        // disclaimer + signatory + "powered by" strip
const TESTS_CHROME_MM = 23;                  // colored section band + gradient table header row
const TEST_ROW_MM = 7.5;                     // a single-line test row
const PACKAGES_CHROME_MM = 23;               // colored section band + gradient table header row
const PACKAGE_ROW_MM = 7.5;                  // a package's own single-line name/price row
const PACKAGE_INCLUDES_MM = 8;               // the "Includes:" label + surrounding cell padding
const PACKAGE_CHIP_ROW_MM = 6.2;             // each row of up to 3 included-test chips
const TRANSACTIONS_CHROME_MM = 41;           // heading + header row + the 2 totals rows
const TRANSACTIONS_CHROME_NO_TOTALS_MM = 18; // per-transaction mode omits the totals rows
const TRANSACTION_ROW_MM = 7.2;              // a single-line transaction row
const PAYMENT_SUMMARY_MM = 64;               // 3-card summary row + "Amount in Words" strip
                                             // (was 51 for the old 2-column plain summary;
                                             // re-verify against a real render if needed).

// Long values wrap onto extra lines and make their row taller — the single biggest
// source of drift, since lab test names and payment remarks are free-form. Each extra
// wrapped line costs TEXT_LINE_MM. The per-column character budgets below were measured
// against the widest realistic characters (all-caps), so they under-estimate how much
// actually fits, which errs toward breaking a page early rather than clipping content.
const TEXT_LINE_MM = 4;
const TEST_NAME_CHARS_PER_LINE = 48;    // "Test Name" column of the 5-column tests table
const PACKAGE_NAME_CHARS_PER_LINE = 45; // "Package Name" column of the 4-column table
const TXN_REMARK_CHARS_PER_LINE = 12;   // "Remarks" column is narrow — 10 columns share the width

// A page's rendered height must stay under this or the export clips. generatePDF()
// draws each page with addImage(..., 10, 10, A4_WIDTH - 20, ...), i.e. scaled by 190/210
// and offset 10mm down, so a virtual height H lands at real 10 + H*(19/21). Staying
// under this keeps content on the physical page (needs H <= 317.2) with headroom below
// that for text that wraps a line more than the estimates above predict -- headroom that
// also comfortably clears the letterhead's pre-printed bottom band, whichever of the two
// letterhead designs this file has been calibrated against (see LETTERHEAD_MARGINS).
const SAFE_BUDGET_MM = 308;

// Plain hex values (not Tailwind color-* classes) on purpose: Tailwind v4 generates
// its color palette via oklch()/color-mix(), which html2canvas cannot parse and will
// throw ("unsupported color function oklch") mid-PDF-capture, producing a blank page.
// Inline hex keeps the invoice visually identical while staying safe for html2canvas.
// Same convention as CommonReportView.tsx / CommonReportView2.tsx -- the secondary/
// neutral/status swatches below are copied verbatim from that file's REPORT_COLORS so
// the invoice reads as the same visual system as the lab report.
const INVOICE_COLORS = {
  white: '#FFFFFF',
  neutral900: '#101828',
  neutral800: '#1D2939',
  neutral600: '#475467',
  neutral100: '#F2F4F7',
  secondary50: '#F8F6FD',
  secondary100: '#F1EDFB',
  secondary200: '#E4DEF7',
  secondary700: '#6941C6',
  secondary800: '#53389E',
  warning500: '#F79009',
  danger600: '#D92D20',
  success700: '#067647',
};

const INVOICE_FONT_FAMILY = 'var(--font-inter), "Inter", "Helvetica Neue", Arial, sans-serif';

// Estimated from the new CURE+ Hospitals letterhead artwork (the "Final Letterheads_
// Martalli new.pdf" proof, A4): a thin lavender header band spans the full width and
// runs ~30mm from the top edge, a thinner lavender footer band starts ~14mm from the
// bottom edge, and -- unlike the earlier full-frame letterhead this file used to target
// (56/20/16mm, purple side border) -- there is no colored side frame, so left/right just
// get a plain print-safe margin. These numbers were read off the artwork proof, not a
// physical printout, so verify with one test print and nudge them if anything overlaps.
const LETTERHEAD_MARGINS = {
  top: '30mm',
  bottom: '14mm',
  left: '10mm',
  right: '10mm',
};
const PLAIN_PAGE_PADDING = '20px';

// generatePDF()'s capture pass rasterises this whole 210mm-wide page and then places it
// via addImage(..., 10, 10, A4_WIDTH - 20, ...) -- a 190/210 shrink plus a flat 10mm
// offset (see the SAFE_BUDGET_MM comment above). Left as plain LETTERHEAD_MARGINS, that
// transform lands the real printed margins at ~37mm top / ~19mm left+right instead of
// the intended 30mm/10mm -- safe (it only ever adds clearance) but visibly misaligned
// against CommonReportView2's report, which places its margins literally with no such
// transform. These values are solved so the REAL margin after that same transform comes
// out to LETTERHEAD_MARGINS' intent: real = 10 + css*(190/210), so css = (real-10)*(210/190)
// for top, and css = 0 for left/right since the flat 10mm offset alone already supplies
// the target 10mm there. Bottom is left unchanged -- it isn't anchored the same way (there
// is no equivalent flat offset at the page's bottom edge), and is already conservative.
// Used ONLY for the off-screen capture pass (see renderInvoicePage's forCapture param);
// the on-screen preview keeps LETTERHEAD_MARGINS' true values so what the user sees
// matches the letterhead artwork, not this compositing workaround.
const LETTERHEAD_CAPTURE_MARGINS = {
  top: '22.1mm',
  bottom: LETTERHEAD_MARGINS.bottom,
  left: '0mm',
  right: '0mm',
};

// The invoice header logo used to be this static file, hardcoded. It now prefers the
// lab's own uploaded logo (labLogo/logo, set from the lab settings screen) and falls
// back to this so labs that have never uploaded one keep the header they had before
// rather than printing with no logo at all. Same asset CommonReportView.tsx uses.
const FALLBACK_LAB_LOGO_SRC = '/CUREPLUS HOSPITALS (1).png';

type PatientWithVisit = Patient;

type PrintType = 'letterhead' | 'plain' | 'letterhead-dept' | 'plain-dept';

interface InvoicePageData {
  tests: TestList[];
  departmentName?: string;
  packages: Packages[];
  transactions: BillingTransaction[];
  isLastTransactionsChunk: boolean;
  showSummary: boolean;
}

// Extra height a value adds by wrapping past one line in its column.
const wrapExtraMm = (text: string | undefined | null, charsPerLine: number): number =>
  (Math.max(1, Math.ceil((text?.length || 0) / charsPerLine)) - 1) * TEXT_LINE_MM;

const testRowMm = (test: TestList): number =>
  TEST_ROW_MM + wrapExtraMm(test.name, TEST_NAME_CHARS_PER_LINE);

const transactionRowMm = (txn: BillingTransaction): number =>
  TRANSACTION_ROW_MM + wrapExtraMm(txn.remarks, TXN_REMARK_CHARS_PER_LINE);

const packageHeightMm = (pkg: Packages): number => {
  const testCount = pkg.tests?.length || 0;
  // The included-test chips render in a 3-column grid under the package's own row.
  return PACKAGE_ROW_MM
    + wrapExtraMm(pkg.packageName, PACKAGE_NAME_CHARS_PER_LINE)
    + (testCount > 0 ? PACKAGE_INCLUDES_MM + Math.ceil(testCount / 3) * PACKAGE_CHIP_ROW_MM : 0);
};

// Amount-in-words, Indian numbering system (thousand / lakh / crore) -- how a printed
// Indian invoice states its total in words, e.g. "Rupees Sixty Thousand Five Hundred
// Fifty Seven Only".
const WORDS_ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const WORDS_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigitsToWords = (n: number): string => {
  if (n < 20) return WORDS_ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${WORDS_TENS[tens]}${ones ? ' ' + WORDS_ONES[ones] : ''}`;
};

const threeDigitsToWords = (n: number): string => {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${WORDS_ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigitsToWords(rest));
  return parts.join(' ');
};

const integerToIndianWords = (value: number): string => {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (rest) parts.push(threeDigitsToWords(rest));
  return parts.join(' ');
};

const amountInWords = (amount: number): string => {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  const rupeeWords = `Rupees ${integerToIndianWords(rupees)}`;
  return paise > 0
    ? `${rupeeWords} and ${integerToIndianWords(paise)} Paise Only`
    : `${rupeeWords} Only`;
};

const PatientDetailsViewComponent = ({ patient }: { patient: PatientWithVisit }) => {
  const { currentLab } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'all' | 'per-transaction' | 'no-transaction'>('no-transaction');
  const [printType, setPrintType] = useState<PrintType>('plain');
  const isLetterhead = printType === 'letterhead' || printType === 'letterhead-dept';
  const isDepartmentWise = printType === 'letterhead-dept' || printType === 'plain-dept';
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch tests
        if (patient?.visit?.testIds?.length && currentLab?.id) {
          const testPromises = patient.visit.testIds.map((id: number) =>
            id !== undefined ? getTestById(currentLab.id.toString(), id, patient.visit.visitId) : Promise.resolve(null)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter((test) => test !== null) as TestList[]);
        }

        // Fetch doctor
        if (patient?.visit?.doctorId && currentLab?.id) {
          const doctorResult = await doctorGetById(currentLab.id.toString(), Number(patient.visit.doctorId));
          setDoctor(doctorResult.data);
        }

        // Fetch health packages
        if (patient?.visit?.packageIds?.length && currentLab?.id) {
          const healthPackagePromises = patient.visit.packageIds.map((id: number) =>
            id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
          );
          const healthPackageResults = await Promise.all(healthPackagePromises);
          const validPackages = healthPackageResults
            .filter((pkg) => pkg !== null && pkg.data !== null)
            .map((pkg) => pkg.data);
          setHealthPackage(validPackages as Packages[]);
        } else {
          setHealthPackage([]);
        }
      } catch (error) {
        // Handle data fetch error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patient, currentLab]);



  const getTestDiscount = (testId: number): { discountAmount: number; finalPrice: number } | null => {
    if (!patient?.visit?.listofeachtestdiscount) return null;
    return patient.visit.listofeachtestdiscount.find((item: { id: number; discountAmount: number; finalPrice: number }) => item.id === testId) || null;
  };

  const calculateTotal = () => {
    let total = 0;
    tests.forEach(test => {
      const discountInfo = getTestDiscount(test.id);
      total += discountInfo ? discountInfo.finalPrice : test.price;
    });
    healthPackage?.forEach(pkg => {
      const grossPrice = pkg.tests?.reduce((sum, t) => sum + t.price, 0) ?? pkg.price;
      total += grossPrice - (grossPrice * pkg.discount) / 100;
    });
    return total;
  };

  // Lays the invoice out across as few pages as physically fit, by measuring each
  // section against the page's real height budget rather than a fixed row count.
  // Sections are placed in the same order they render (tests -> packages -> payment
  // summary -> transactions), each flowing onto a new page only when the current one
  // is genuinely full, so a small invoice stays on a single page.
  const generateInvoicePages = (): InvoicePageData[] => {
    if (!invoiceRef.current) return [];

    const pageFixedMm = (isLetterhead ? LETTERHEAD_PAGE_PADDING_MM : PLAIN_PAGE_PADDING_MM)
      + HEADER_PATIENT_MM + FOOTER_MM;
    const budgetMm = SAFE_BUDGET_MM - pageFixedMm;

    const newPage = (departmentName?: string): InvoicePageData => ({
      tests: [], packages: [], transactions: [],
      isLastTransactionsChunk: false, showSummary: false, departmentName,
    });

    const pages: InvoicePageData[] = [];
    let current = newPage();
    let used = 0;

    const hasContent = () => current.tests.length > 0 || current.packages.length > 0
      || current.transactions.length > 0 || current.showSummary;
    const breakPage = (departmentName?: string) => {
      pages.push(current);
      current = newPage(departmentName);
      used = 0;
    };

    // --- Tests. Department-wise printing starts each department on its own page so
    // pages can be handed to the department that runs them.
    const testGroups: { departmentName?: string; items: TestList[] }[] = [];
    if (isDepartmentWise) {
      const byDepartment = new Map<string, TestList[]>();
      tests.forEach((test) => {
        const department = test.category || 'General';
        if (!byDepartment.has(department)) byDepartment.set(department, []);
        byDepartment.get(department)!.push(test);
      });
      Array.from(byDepartment.keys())
        .sort((a, b) => a.localeCompare(b))
        .forEach((department) => testGroups.push({ departmentName: department, items: byDepartment.get(department)! }));
    } else if (tests.length > 0) {
      testGroups.push({ items: tests });
    }

    testGroups.forEach((group) => {
      if (hasContent()) breakPage(group.departmentName);
      else current.departmentName = group.departmentName;

      group.items.forEach((test) => {
        const rowMm = testRowMm(test);
        const inc = rowMm + (current.tests.length === 0 ? TESTS_CHROME_MM : 0);
        if (hasContent() && used + inc > budgetMm) {
          breakPage(group.departmentName);
          current.tests.push(test);
          used = TESTS_CHROME_MM + rowMm;
        } else {
          current.tests.push(test);
          used += inc;
        }
      });
    });

    // --- Health packages
    (healthPackage || []).forEach((pkg) => {
      const pkgMm = packageHeightMm(pkg);
      const inc = pkgMm + (current.packages.length === 0 ? PACKAGES_CHROME_MM : 0);
      if (hasContent() && used + inc > budgetMm) {
        breakPage();
        current.packages.push(pkg);
        used = PACKAGES_CHROME_MM + pkgMm;
      } else {
        current.packages.push(pkg);
        used += inc;
      }
    });

    // --- Payment summary. In per-transaction mode a single transaction table renders
    // alongside it, so reserve that too.
    const allTransactions = patient?.visit?.billing?.transactions || [];
    const perTransactionExtraMm = printMode === 'per-transaction' && allTransactions.length > 0
      ? TRANSACTIONS_CHROME_NO_TOTALS_MM
        + Math.max(...allTransactions.map(transactionRowMm)) // any one of them may be the one rendered
      : 0;
    const summaryIncMm = PAYMENT_SUMMARY_MM + perTransactionExtraMm;
    if (hasContent() && used + summaryIncMm > budgetMm) breakPage();
    current.showSummary = true;
    used += summaryIncMm;

    // --- Transactions ("All Transactions" only; the other modes render a single
    // transaction next to the summary above, or none at all).
    if (printMode === 'all') {
      allTransactions.forEach((txn) => {
        const rowMm = transactionRowMm(txn);
        const inc = rowMm + (current.transactions.length === 0 ? TRANSACTIONS_CHROME_MM : 0);
        if (hasContent() && used + inc > budgetMm) {
          breakPage();
          current.transactions.push(txn);
          used = TRANSACTIONS_CHROME_MM + rowMm;
        } else {
          current.transactions.push(txn);
          used += inc;
        }
      });
    }

    pages.push(current);

    // The totals row belongs only on the final page of the transactions table.
    for (let i = pages.length - 1; i >= 0; i--) {
      if (pages[i].transactions.length > 0) {
        pages[i].isLastTransactionsChunk = true;
        break;
      }
    }

    return pages;
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'N/A';
    return method.split('+').map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderTransactionTable = (transaction?: BillingTransaction, displayTransactions?: BillingTransaction[], showTotals: boolean = true) => {
    const allTransactions: BillingTransaction[] = patient?.visit?.billing?.transactions || [];
    const transactions: BillingTransaction[] = transaction ? [transaction] : (displayTransactions ?? allTransactions);
    if (transactions.length === 0) return null;

    // Totals always reflect the full transaction list, even when only a subset of
    // rows (one paginated chunk) is being rendered on this particular page.
    const totalReceived = allTransactions.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.received_amount || 0), 0);
    const remainingDue = Number(patient?.visit?.billing?.due_amount || 0);

    const c = INVOICE_COLORS;
    const thStyle = { color: c.secondary800 };
    const tdStyle = { borderColor: c.secondary100, color: c.neutral800 };
    const footTdStyle = { borderColor: c.secondary200, color: c.secondary800 };

    return (
      <div className="mt-3 print:mt-3">
        <div className="px-3 py-1.5 mb-1.5 rounded-lg text-[10px] font-bold uppercase" style={{ backgroundColor: c.secondary50, color: c.neutral800 }}>Payment Transactions</div>
        <div className="overflow-x-auto print:overflow-visible rounded-lg" style={{ border: `1px solid ${c.secondary200}` }}>
          <table className="w-full text-xs border-collapse print:table-fixed print:w-full">
            <thead>
              <tr style={{ backgroundColor: c.secondary100 }}>
                <th className="p-1.5 font-bold text-left uppercase" style={thStyle}>Txn Code</th>
                <th className="p-1.5 font-bold text-left uppercase" style={thStyle}>Method</th>
                <th className="p-1.5 font-bold text-right uppercase" style={thStyle}>UPI</th>
                <th className="p-1.5 font-bold text-right uppercase" style={thStyle}>Card</th>
                <th className="p-1.5 font-bold text-right uppercase" style={thStyle}>Cash</th>
                <th className="p-1.5 font-bold text-right uppercase" style={thStyle}>Received</th>
                <th className="p-1.5 font-bold text-right uppercase" style={thStyle}>Due</th>
                <th className="p-1.5 font-bold text-left uppercase" style={thStyle}>Date/Time</th>
                <th className="p-1.5 font-bold text-left uppercase" style={thStyle}>By</th>
                <th className="p-1.5 font-bold text-left uppercase" style={thStyle}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions]
                .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                .map((txn: BillingTransaction, idx: number) => {
                  return (
                    <tr
                      key={`txn-${idx}`}
                      style={{ backgroundColor: idx % 2 === 0 ? c.white : c.secondary50 }}
                    >
                      <td className="p-1.5 border-t align-top leading-tight" style={tdStyle}>
                        {txn.transactionCode || txn.id || '-'}
                      </td>
                      <td className="p-1.5 border-t font-medium align-top leading-tight" style={tdStyle}>
                        {formatPaymentMethod(txn.payment_method)}
                      </td>
                      <td className="p-1.5 border-t align-top text-right leading-tight" style={tdStyle}>
                        {Number(txn.upi_amount ?? 0) > 0 ? `₹${Number(txn.upi_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border-t align-top text-right leading-tight" style={tdStyle}>
                        {Number(txn.card_amount ?? 0) > 0 ? `₹${Number(txn.card_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border-t align-top text-right leading-tight" style={tdStyle}>
                        {Number(txn.cash_amount ?? 0) > 0 ? `₹${Number(txn.cash_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border-t font-bold align-top text-right leading-tight" style={{ ...tdStyle, color: c.neutral900 }}>
                        ₹{Number(txn.received_amount || 0).toFixed(2)}
                      </td>
                      <td className="p-1.5 border-t align-top text-right leading-tight" style={Number(txn.due_amount ?? 0) > 0 ? { ...tdStyle, color: c.danger600 } : tdStyle}>
                        {Number(txn.due_amount ?? 0) > 0 ? `₹${Number(txn.due_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border-t whitespace-nowrap align-top leading-tight text-xs" style={tdStyle}>
                        {formatDateTime(txn.created_at || '')}
                      </td>
                      <td className="p-1.5 border-t align-top leading-tight" style={tdStyle}>
                        {txn.createdBy || '-'}
                      </td>
                      <td className="p-1.5 border-t align-top leading-tight" style={tdStyle}>
                        {txn.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            {!transaction && showTotals && (
              <tfoot>
                <tr className="font-semibold" style={{ backgroundColor: c.secondary50 }}>
                  <td colSpan={2} className="p-1.5 border-t align-top" style={footTdStyle}>Total:</td>
                  <td className="p-1.5 border-t align-top text-right" style={footTdStyle}>
                    ₹{allTransactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.upi_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border-t align-top text-right" style={footTdStyle}>
                    ₹{allTransactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.card_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border-t align-top text-right" style={footTdStyle}>
                    ₹{allTransactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.cash_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border-t font-bold align-top text-right" style={footTdStyle}>
                    ₹{totalReceived.toFixed(2)}
                  </td>
                  <td className="p-1.5 border-t font-bold align-top text-right" style={footTdStyle}>
                    ₹{remainingDue.toFixed(2)}
                  </td>
                  <td className="p-1.5 border-t align-top" style={footTdStyle}></td>
                  <td className="p-1.5 border-t align-top" style={footTdStyle}></td>
                  <td className="p-1.5 border-t align-top" style={footTdStyle}></td>
                </tr>
                <tr className="font-bold" style={{ backgroundColor: c.secondary50 }}>
                  <td colSpan={9} className="p-1.5 border-t align-top text-right" style={footTdStyle}>Net Amount:</td>
                  <td className="p-1.5 border-t font-bold align-top text-right" style={footTdStyle} colSpan={1}>
                    ₹{Number(patient?.visit?.billing?.netAmount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const formatInvoiceDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const renderInvoicePage = (page: InvoicePageData, pageNumber: number, totalPages: number, transaction?: BillingTransaction, hideButtons: boolean = false, forCapture: boolean = false) => {
    const { tests: pageTests, departmentName } = page;
    // Get invoice date/time from API - use billing createdAt or updatedAt or paymentDate
    const billing = patient?.visit?.billing;
    const invoiceDateTime = billing?.createdAt
      ? formatInvoiceDateTime(billing.createdAt)
      : (billing?.updatedAt
        ? formatInvoiceDateTime(billing.updatedAt)
        : (billing?.paymentDate
          ? formatInvoiceDateTime(billing.paymentDate)
          : formatInvoiceDateTime(new Date().toISOString())));

    const c = INVOICE_COLORS;
    const letterheadMargins = forCapture ? LETTERHEAD_CAPTURE_MARGINS : LETTERHEAD_MARGINS;

    return (
      <div
        key={`page-${pageNumber}${transaction ? `-txn-${transaction.id}` : ''}`}
        className="mb-6 mx-auto font-sans"
        style={{
          width: '210mm',
          minHeight: forCapture ? '297mm' : undefined,
          paddingTop: isLetterhead ? letterheadMargins.top : PLAIN_PAGE_PADDING,
          paddingBottom: isLetterhead ? letterheadMargins.bottom : PLAIN_PAGE_PADDING,
          paddingLeft: isLetterhead ? letterheadMargins.left : PLAIN_PAGE_PADDING,
          paddingRight: isLetterhead ? letterheadMargins.right : PLAIN_PAGE_PADDING,
          pageBreakAfter: pageNumber < totalPages ? 'always' : 'auto',
          backgroundColor: c.white,
          fontFamily: INVOICE_FONT_FAMILY
        }}
      >
        {/* Header Section - light lavender band, matching the printed letterhead's own
            restrained palette (pale band + dark text + a purple accent) rather than a
            saturated fill. */}
        <div
          className="mb-3 rounded-lg print:mb-2"
          style={{ backgroundColor: c.secondary50, borderBottom: `2px solid ${c.secondary200}` }}
        >
          <div className="flex justify-between items-center px-3 py-2">
            {isLetterhead ? (
              // Letterhead mode: physical stationery already has the lab's logo/name
              // pre-printed in the top ~30mm band, so only the invoice title is drawn
              // here rather than repeating the branding over it.
              <h1 className="text-sm font-bold uppercase tracking-wide leading-tight" style={{ color: c.secondary800 }}>Tax Invoice</h1>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <Image src={currentLab?.labLogo || currentLab?.logo || FALLBACK_LAB_LOGO_SRC}
                  alt="Lab Logo" width={40} height={28}
                  className="h-7 w-auto object-contain flex-shrink-0" priority loading="eager"
                  unoptimized crossOrigin="anonymous" data-print-logo="true"
                  quality={100}
                />
                <div className="min-w-0">
                  <h1 className="text-sm font-bold leading-tight" style={{ color: c.secondary800 }}>{currentLab?.name || 'DIAGNOSTIC CENTER'}</h1>
                  <p className="text-[8px] leading-tight" style={{ color: c.neutral600 }}>
                    {[currentLab?.address, currentLab?.city, currentLab?.state].filter(Boolean).join(', ')}
                    {currentLab?.labPhone ? ` • Phone: ${currentLab.labPhone}` : ''}
                  </p>
                </div>
              </div>
            )}
            <div className="text-right flex-shrink-0 pl-3">
              <p className="text-[8px] font-bold uppercase tracking-wide" style={{ color: c.secondary700 }}>
                {isLetterhead ? (currentLab?.name || 'Invoice') : 'Tax Invoice'}
              </p>
              <p className="text-[11px] font-bold leading-tight" style={{ color: c.neutral900 }}>
                No: {patient?.visit?.billing?.billingCode || patient?.visit?.billing?.billingId || 'N/A'}
              </p>
              <p className="text-[9px] leading-tight" style={{ color: c.neutral600 }}>{invoiceDateTime}</p>
            </div>
          </div>
        </div>

        {/* Patient & Visit Info Section - report-style icon fields (same convention as
            CommonReportView2.tsx's patient details card: secondary200 border, secondary100
            icon chips, neutral600 uppercase labels, neutral900 bold values). */}
        <div className="mb-3 rounded-xl p-2" style={{ border: `1px solid ${c.secondary200}` }}>
          {[
            [
              { icon: '/report/user.png', label: 'Patient Name', value: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || 'N/A' },
              { icon: '/report/users.png', label: 'Age / Sex', value: `${formatAgeForDisplay(patient?.dateOfBirth || '')} / ${patient?.gender || 'N/A'}` },
              { icon: '/report/id-card.png', label: 'Patient Code', value: patient?.patientCode || 'N/A' },
              { icon: '/report/clipboard-check.png', label: 'Patient Type', value: patient?.visit?.visitType || 'N/A' },
            ],
            [
              { icon: '/report/stethoscope.png', label: 'Referred By', value: doctor?.name || 'Self' },
              { icon: '/report/calendar.png', label: 'Visit Date', value: patient?.visit?.visitDate ? new Date(patient.visit.visitDate).toLocaleDateString('en-IN') : 'N/A' },
              { icon: '/report/clipboard.png', label: 'Visit Code', value: patient?.visit?.visitCode || 'N/A' },
              { icon: '/report/file-text.png', label: 'Contact', value: patient?.phone || 'N/A' },
            ],
          ].map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-4 gap-2" style={{ marginTop: rowIdx > 0 ? '6px' : 0 }}>
              {row.map((field) => (
                <div key={field.label} className="flex items-center gap-1.5 min-w-0">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.secondary100 }}>
                    <img src={field.icon} alt="" className="w-2.5 h-2.5" crossOrigin="anonymous" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] font-semibold uppercase leading-tight" style={{ color: c.neutral600 }}>{field.label}</p>
                    <p className="text-[10px] font-bold leading-tight" style={{ color: c.neutral900 }}>{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tests Table - light section band, matching the letterhead's restrained tone */}
        {pageTests.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${c.secondary200}` }}>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase" style={{ backgroundColor: c.secondary50, color: c.neutral800 }}>
              Tests Conducted{departmentName ? ` — Department: ${departmentName}` : ''}
            </div>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr style={{ backgroundColor: c.secondary100 }}>
                  <th className="text-left p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Test Name</th>
                  <th className="text-left p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Category</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Price</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Discount</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pageTests.map((test, idx) => {
                  const discountInfo = getTestDiscount(test.id);
                  const originalPrice = discountInfo ? discountInfo.finalPrice + discountInfo.discountAmount : test.price;
                  const finalAmount = discountInfo ? discountInfo.finalPrice : test.price;
                  return (
                    <tr key={`test-${idx}`} style={{ backgroundColor: idx % 2 === 0 ? c.white : c.secondary50 }}>
                      <td className="p-1.5 leading-tight font-semibold" style={{ color: c.neutral900 }}>{test.name}</td>
                      <td className="p-1.5 leading-tight" style={{ color: c.neutral600 }}>{test.category || 'General'}</td>
                      <td className="p-1.5 text-right leading-tight" style={{ color: c.neutral800 }}>₹{originalPrice.toFixed(2)}</td>
                      <td className="p-1.5 text-right leading-tight" style={{ color: discountInfo && discountInfo.discountAmount > 0 ? c.danger600 : c.neutral600 }}>
                        {discountInfo && discountInfo.discountAmount > 0 ? `-₹${discountInfo.discountAmount.toFixed(2)}` : '₹0.00'}
                      </td>
                      <td className="p-1.5 text-right font-bold leading-tight" style={{ color: c.neutral900 }}>
                        ₹{finalAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Packages Section (only on the page(s) this fix assigns them to) */}
        {page.packages.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${c.secondary200}` }}>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase" style={{ backgroundColor: c.secondary50, color: c.neutral800 }}>Health Packages</div>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr style={{ backgroundColor: c.secondary100 }}>
                  <th className="text-left p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Package Name</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Price</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Discount</th>
                  <th className="text-right p-1.5 font-bold uppercase" style={{ color: c.secondary800 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {page.packages.map((pkg, idx) => {
                  const grossPrice = pkg.tests?.reduce((sum, t) => sum + t.price, 0) ?? pkg.price;
                  const discountAmount = (grossPrice * pkg.discount) / 100;
                  return (
                  <React.Fragment key={`pkg-${idx}`}>
                    <tr style={{ backgroundColor: idx % 2 === 0 ? c.white : c.secondary50 }}>
                      <td className="p-1.5 leading-tight font-semibold" style={{ color: c.neutral900 }}>{pkg.packageName}</td>
                      <td className="p-1.5 text-right leading-tight" style={{ color: c.neutral800 }}>₹{grossPrice.toFixed(2)}</td>
                      <td className="p-1.5 text-right leading-tight" style={{ color: c.danger600 }}>-₹{discountAmount.toFixed(2)}</td>
                      <td className="p-1.5 text-right font-bold leading-tight" style={{ color: c.neutral900 }}>₹{(grossPrice - discountAmount).toFixed(2)}</td>
                    </tr>
                    {pkg.tests && pkg.tests.length > 0 && (
                      <tr style={{ backgroundColor: idx % 2 === 0 ? c.white : c.secondary50 }}>
                        <td colSpan={4} className="p-1.5" style={{ borderTop: `1px solid ${c.secondary100}` }}>
                          <div className="pl-1">
                            <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: c.secondary700 }}>Includes:</p>
                            <div className="grid grid-cols-3 gap-1">
                              {pkg.tests.map((test, testIdx) => (
                                <div key={testIdx} className="text-[9px] px-1 py-0.5 rounded leading-tight font-medium" style={{ backgroundColor: c.secondary100, color: c.secondary800 }}>
                                  {test.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Summary Section - 3-card layout + amount in words */}
        {page.showSummary && (() => {
          const summaryTxn = transaction ? transaction : undefined;
          const totalDue = summaryTxn
            ? Math.max(0, Number(summaryTxn.due_amount || 0))
            : Number(patient?.visit?.billing?.due_amount || 0);
          const dueAmount = Number(patient?.visit?.billing?.due_amount || 0);
          const isPaid = dueAmount === 0;
          const testsTotal = tests.reduce((sum, test) => {
            const discountInfo = getTestDiscount(test.id);
            return sum + (discountInfo ? discountInfo.finalPrice : test.price);
          }, 0);
          const packagesTotal = (healthPackage || []).reduce((sum, pkg) => {
            const grossPrice = pkg.tests?.reduce((s, t) => s + t.price, 0) ?? pkg.price;
            return sum + (grossPrice - (grossPrice * pkg.discount) / 100);
          }, 0);
          const subtotal = calculateTotal();
          const discountAmount = Number(patient?.visit?.billing?.discount || 0);
          const netAmount = Number(patient?.visit?.billing?.netAmount || subtotal);

          return (
            <div className="pt-1">
              <div className="px-3 py-1.5 mb-2 rounded-lg text-[10px] font-bold uppercase" style={{ backgroundColor: c.secondary50, color: c.neutral800 }}>Payment Summary</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                {/* Charges breakdown */}
                <div className="rounded-xl p-2" style={{ border: `1px solid ${c.secondary200}` }}>
                  <p className="text-[9px] font-bold uppercase mb-1" style={{ color: c.secondary800 }}>Charges</p>
                  <div className="flex justify-between py-0.5" style={{ color: c.neutral800 }}>
                    <span>Tests Total</span><span className="font-semibold">₹{testsTotal.toFixed(2)}</span>
                  </div>
                  {healthPackage && healthPackage.length > 0 && (
                    <div className="flex justify-between py-0.5" style={{ color: c.neutral800 }}>
                      <span>Packages Total</span><span className="font-semibold">₹{packagesTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 mt-0.5 font-bold" style={{ color: c.neutral900, borderTop: `1px solid ${c.secondary100}` }}>
                    <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5" style={{ color: c.danger600 }}>
                    <span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Item / payment status */}
                <div className="rounded-xl p-2" style={{ border: `1px solid ${c.secondary200}` }}>
                  <p className="text-[9px] font-bold uppercase mb-1" style={{ color: c.secondary800 }}>Summary</p>
                  <div className="flex justify-between items-center py-0.5" style={{ color: c.neutral800 }}>
                    <span>Tests</span>
                    <span className="font-bold" style={{ color: c.secondary800 }}>{tests.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5" style={{ color: c.neutral800 }}>
                    <span>Packages</span>
                    <span className="font-bold" style={{ color: c.secondary800 }}>{healthPackage?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5" style={{ color: c.neutral800 }}>
                    <span>Method</span><span className="font-semibold">{formatPaymentMethod(summaryTxn ? summaryTxn.payment_method : (patient?.visit?.billing?.paymentMethod || 'N/A'))}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5" style={{ color: c.neutral800 }}>
                    <span>Status</span>
                    <span className="font-bold" style={{ color: isPaid ? c.success700 : c.danger600 }}>
                      {isPaid ? 'PAID' : (patient?.visit?.billing?.paymentStatus || 'DUE')}
                    </span>
                  </div>
                </div>

                {/* Amount payable */}
                <div className="rounded-xl p-2" style={{ border: `1px solid ${c.secondary200}` }}>
                  <p className="text-[9px] font-bold uppercase mb-1" style={{ color: c.secondary800 }}>Amount Payable</p>
                  <div className="flex justify-between py-0.5" style={{ color: c.neutral800 }}>
                    <span>Gross</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5" style={{ color: c.danger600 }}>
                    <span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between items-center mt-1 pt-1 font-bold"
                    style={{ color: c.neutral900, borderTop: `1px solid ${c.secondary200}` }}
                  >
                    <span className="text-[9px] uppercase" style={{ color: c.secondary800 }}>Net Payable</span>
                    <span className="text-xs">₹{netAmount.toFixed(2)}</span>
                  </div>
                  {totalDue > 0 && (
                    <p className="text-right mt-0.5 font-bold" style={{ color: c.danger600 }}>Due: ₹{totalDue.toFixed(2)}</p>
                  )}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="mt-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: c.secondary50, border: `1px solid ${c.secondary200}` }}>
                <span className="text-[8px] font-bold uppercase mr-1.5" style={{ color: c.secondary700 }}>Amount in Words:</span>
                <span className="text-[10px] font-bold" style={{ color: c.neutral900 }}>{amountInWords(netAmount)}</span>
              </div>
            </div>
          );
        })()}

        {/* Transactions Table */}
        {printMode === 'all' && page.transactions.length > 0 && renderTransactionTable(undefined, page.transactions, page.isLastTransactionsChunk)}
        {printMode === 'per-transaction' && transaction && page.showSummary && renderTransactionTable(transaction)}

        {/* Individual Transaction Action Buttons - Only for Per Transaction mode */}
        {!hideButtons && printMode === 'per-transaction' && transaction && (
          <div className="mt-6 pt-4 border-t border-gray-200 print:hidden">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => generatePDF('print', transaction)}
                disabled={isGeneratingPDF || isLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 text-xs"
              >
                {isGeneratingPDF ? (
                  <MdDownloading className="animate-spin" size={12} />
                ) : (
                  <FaPrint size={12} />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Print'}
              </button>
              <button
                onClick={() => generatePDF('download', transaction)}
                disabled={isGeneratingPDF || isLoading}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50 text-xs"
              >
                <FaFilePdf size={12} />
                PDF
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-2 text-center text-xs" style={{ borderTop: `1px solid ${c.secondary200}` }}>
          <p className="mb-1 leading-tight" style={{ color: c.neutral600 }}>This is an electronically generated invoice. No signature required.</p>
          <p className="mb-2 leading-tight" style={{ color: c.neutral600 }}>For queries, contact: {currentLab?.name || 'N/A'}</p>
          <div className="mt-2 flex justify-between items-center pt-1.5" style={{ borderTop: `1px solid ${c.secondary100}` }}>
            <div className="flex items-center gap-1">
              <FaSignature className="text-xs" style={{ color: c.secondary700 }} />
              <span className="font-semibold text-xs" style={{ color: c.neutral800 }}>Authorized Signatory</span>
            </div>
            <p className="text-xs" style={{ color: c.neutral800 }}><span className="font-semibold">Generated:</span> {invoiceDateTime}</p>
          </div>
          <div className="mt-2 flex justify-center items-center pt-1.5" style={{ borderTop: `1px solid ${c.secondary100}` }}>
            <Image src="/tiamed1.svg" alt="TiaMeds Logo" width={14} height={14} className="h-3.5 mr-1.5" />
            <span className="text-xs font-medium" style={{ color: c.neutral600 }}>Powered by TiaMeds Technologies Pvt.Ltd</span>
          </div>
        </div>
      </div>
    );
  };

  const generatePDF = async (action: 'print' | 'download', specificTransaction?: BillingTransaction) => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    setError(null);

    try {
      const pages = generateInvoicePages();
      const transactions = patient?.visit?.billing?.transactions || [];
      const pdf = new jsPDF('p', 'mm', 'a4');

      const renderPages = () => {
        // If specific transaction is provided, generate only for that transaction
        if (specificTransaction) {
          return pages.map((page, index) =>
            renderInvoicePage(page, index + 1, pages.length, specificTransaction, true, true)
          );
        }

        if (printMode === 'per-transaction' && transactions.length > 0) {
          // Generate one invoice per transaction
          return transactions.flatMap((txn: BillingTransaction) => {
            return pages.map((page, index) =>
              renderInvoicePage(page, index + 1, pages.length, txn, true, true)
            );
          });
        } else {
          // 'no-transaction' or 'all' (the latter's transactions are already assigned
          // per-page inside `pages` by generateInvoicePages())
          return pages.map((page, index) =>
            renderInvoicePage(page, index + 1, pages.length, undefined, true, true)
          );
        }
      };

      const pagesToRender = renderPages();

      for (let i = 0; i < pagesToRender.length; i++) {
        if (i > 0) pdf.addPage();

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm';
        document.body.appendChild(tempDiv);

        await new Promise<void>((resolve) => {
          const root = createRoot(tempDiv);
          root.render(pagesToRender[i]);

          setTimeout(async () => {
            try {
              const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
                logging: false,
                useCORS: true,
                allowTaint: true
              });

              const imgData = canvas.toDataURL('image/png');
              const imgWidth = A4_WIDTH - 20;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

              document.body.removeChild(tempDiv);
              resolve();
            } catch (err) {
              // Handle page generation error
              console.error('PDF page generation failed:', err);
              document.body.removeChild(tempDiv);
              resolve();
            }
          }, 500);
        });
      }

      if (action === 'print') {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        const transactionSuffix = specificTransaction ? `_txn_${specificTransaction.id}` : '';
        pdf.save(`invoice_${patient?.firstName}_${patient?.lastName || 'patient'}${transactionSuffix}.pdf`);
      }
    } catch (err) {
      // Handle PDF generation error
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    await generatePDF('print');
  };

  const handleDownloadPDF = async () => {
    await generatePDF('download');
  };

  const renderInvoicePreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader type="progress" fullScreen={false} text="Loading invoice data..." />
        </div>
      );
    }

    const pages = generateInvoicePages();
    const transactions = patient?.visit?.billing?.transactions || [];

    if (printMode === 'per-transaction' && transactions.length > 0) {
      return transactions.flatMap((txn: BillingTransaction) => {
        return pages.map((page, index) =>
          renderInvoicePage(page, index + 1, pages.length, txn, false)
        );
      });
    } else {
      // 'no-transaction' or 'all' (the latter's transactions are already assigned
      // per-page inside `pages` by generateInvoicePages())
      return pages.map((page, index) =>
        renderInvoicePage(page, index + 1, pages.length, undefined, false)
      );
    }
  };

  if (!currentLab || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading lab and patient data..." />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center mb-4 print:hidden gap-4">
          <div className="text-sm text-black flex items-center gap-2">
            <FaFileInvoiceDollar />
            <span>Invoice for Visit Code: {patient?.visit?.visitCode || patient?.visit?.visitId || 'N/A'}</span>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium whitespace-nowrap">Print Type:</label>
              <select
                value={printType}
                onChange={(e) => setPrintType(e.target.value as PrintType)}
                className="border rounded px-2 py-1 text-sm min-w-[220px]"
                disabled={isGeneratingPDF}
              >
                <option value="letterhead">Print on Letterhead</option>
                <option value="plain">Print on Plain Paper</option>
                <option value="letterhead-dept">Print on Letterhead (Department-wise)</option>
                <option value="plain-dept">Print on Plain Paper (Department-wise)</option>
              </select>
            </div>

            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium whitespace-nowrap">Print Mode:</label>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value as "all" | "per-transaction" | "no-transaction")}
                className="border rounded px-2 py-1 text-sm min-w-[150px]"
                disabled={isGeneratingPDF}
              >
                <option value="all">All Transactions</option>
                <option value="per-transaction">Per Transaction</option>
                <option value="no-transaction">No Transactions</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={isGeneratingPDF || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <MdDownloading className="animate-spin" />
                ) : (
                  <FaPrint />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Print'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FaFilePdf />
                PDF
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-black text-white rounded text-sm print:hidden">
            {error}
          </div>
        )}

        {/* Invoice Container */}
        <div ref={invoiceRef}>
          {renderInvoicePreview()}
        </div>
      </div>
    </>
  );
};

export default PatientDetailsViewComponent;











// old code , written by abhishek , do not change it .........................................................

// 'use client';
// import { doctorGetById } from '@/../services/doctorServices';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getTestById } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { Doctor } from '@/types/doctor/doctor';
// import { Packages } from '@/types/package/package';
// import { TestList } from '@/types/test/testlist';
// import { Patient, BillingTransaction } from '@/types/patient/patient';
// // import { calculateAge, formatAgeForDisplay } from '@/utils/ageUtils';
// import { formatAgeForDisplay } from '@/utils/ageUtils';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf'
// import React, { useEffect, useRef, useState } from 'react';
// import { createRoot } from 'react-dom/client';
// import { FaFileInvoiceDollar, FaFilePdf, FaPrint, FaSignature } from 'react-icons/fa';
// import Loader from '../common/Loader';
// import { MdDownloading } from "react-icons/md";
// import Image from 'next/image';

// const A4_WIDTH = 210; // mm
// const TESTS_PER_PAGE = 10;

// type PatientWithVisit = Patient;

// const PatientDetailsViewComponent = ({ patient }: { patient: PatientWithVisit }) => {
//   const { currentLab } = useLabs();
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [doctor, setDoctor] = useState<Doctor>();
//   const [healthPackage, setHealthPackage] = useState<Packages[]>([]);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [printMode, setPrintMode] = useState<'all' | 'per-transaction' | 'no-transaction'>('no-transaction');
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         // Fetch tests
//         if (patient?.visit?.testIds?.length && currentLab?.id) {
//           const testPromises = patient.visit.testIds.map((id: number) =>
//             id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
//           );
//           const testResults = await Promise.all(testPromises);
//           setTests(testResults.filter((test) => test !== null) as TestList[]);
//         }

//         // Fetch doctor
//         if (patient?.visit?.doctorId && currentLab?.id) {
//           const doctorResult = await doctorGetById(currentLab.id.toString(), Number(patient.visit.doctorId));
//           setDoctor(doctorResult.data);
//         }

//         // Fetch health packages
//         if (patient?.visit?.packageIds?.length && currentLab?.id) {
//           const healthPackagePromises = patient.visit.packageIds.map((id: number) =>
//             id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
//           );
//           const healthPackageResults = await Promise.all(healthPackagePromises);
//           const validPackages = healthPackageResults
//             .filter((pkg) => pkg !== null && pkg.data !== null)
//             .map((pkg) => pkg.data);
//           setHealthPackage(validPackages as Packages[]);
//         } else {
//           setHealthPackage([]);
//         }
//       } catch (error) {
//         // Handle data fetch error
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [patient, currentLab]);



//   const getTestDiscount = (testId: number) => {
//     if (!patient?.visit?.listofeachtestdiscount) return { discountAmount: 0, finalPrice: 0 };
//     const discountInfo = patient.visit.listofeachtestdiscount.find((item: { id: number; discountAmount: number; finalPrice: number }) => item.id === testId);
//     return discountInfo || { discountAmount: 0, finalPrice: 0 };
//   };

//   const calculateTotal = () => {
//     let total = 0;
//     tests.forEach(test => {
//       const discountInfo = getTestDiscount(test.id);
//       total += discountInfo.finalPrice || test.price;
//     });
//     healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
//     return total;
//   };

//   const generateInvoicePages = () => {
//     if (!invoiceRef.current) return [];

//     const testChunks = [];
//     for (let i = 0; i < tests.length; i += TESTS_PER_PAGE) {
//       testChunks.push(tests.slice(i, i + TESTS_PER_PAGE));
//     }

//     if (testChunks.length === 0) testChunks.push([]);

//     return testChunks;
//   };

//   const formatPaymentMethod = (method: string) => {
//     if (!method) return 'N/A';
//     return method.split('+').map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ');
//   };

//   const formatDateTime = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString();
//   };

//   const renderTransactionTable = (transaction?: BillingTransaction) => {
//     const transactions: BillingTransaction[] = transaction ? [transaction] : (patient?.visit?.billing?.transactions || []);
//     if (transactions.length === 0) return null;

//     // Use API's due_amount instead of calculating on frontend
//     const totalReceived = transactions.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.received_amount || 0), 0);
//     const remainingDue = Number(patient?.visit?.billing?.due_amount || 0);

//     return (
//       <div className="mt-4 pt-2 border-t border-gray-600 print:mt-3 print:pt-1.5">
//         <h3 className="font-bold text-black mb-1.5 text-xs print:mb-1 border-b border-gray-600 pb-0.5 uppercase">Payment Transactions</h3>
//         <div className="overflow-x-auto print:overflow-visible">
//           <table className="w-full text-xs border-collapse border border-gray-600 print:table-fixed print:w-full">
//             <thead>
//               <tr className="bg-white">
//                 <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Txn Code</th>
//                 <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Method</th>
//                 <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">UPI</th>
//                 <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Card</th>
//                 <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Cash</th>
//                 <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Received</th>
//                 <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Due</th>
//                 <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Date/Time</th>
//                 <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">By</th>
//                 <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {[...transactions]
//                 .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
//                 .map((txn: BillingTransaction, idx: number) => {
//                   return (
//                     <tr
//                       key={`txn-${idx}`}
//                       className="bg-white"
//                     >
//                       <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
//                         {txn.transactionCode || txn.id || '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 font-medium align-top text-black leading-tight">
//                         {formatPaymentMethod(txn.payment_method)}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
//                         {Number(txn.upi_amount ?? 0) > 0 ? `₹${Number(txn.upi_amount ?? 0).toFixed(2)}` : '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
//                         {Number(txn.card_amount ?? 0) > 0 ? `₹${Number(txn.card_amount ?? 0).toFixed(2)}` : '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
//                         {Number(txn.cash_amount ?? 0) > 0 ? `₹${Number(txn.cash_amount ?? 0).toFixed(2)}` : '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 font-bold align-top text-right text-black leading-tight">
//                         ₹{Number(txn.received_amount || 0).toFixed(2)}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
//                         {Number(txn.due_amount ?? 0) > 0 ? `₹${Number(txn.due_amount ?? 0).toFixed(2)}` : '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 whitespace-nowrap align-top text-black leading-tight text-xs">
//                         {formatDateTime(txn.created_at || '')}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
//                         {txn.createdBy || '-'}
//                       </td>
//                       <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
//                         {txn.remarks || '-'}
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>

//             {!transaction && (
//               <tfoot>
//                 <tr className="bg-white font-semibold">
//                   <td colSpan={2} className="p-1.5 border border-gray-600 align-top text-black">Total:</td>
//                   <td className="p-1.5 border border-gray-600 align-top text-right text-black">
//                     ₹{transactions
//                       .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.upi_amount || 0), 0)
//                       .toFixed(2)}
//                   </td>
//                   <td className="p-1.5 border border-gray-600 align-top text-right text-black">
//                     ₹{transactions
//                       .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.card_amount || 0), 0)
//                       .toFixed(2)}
//                   </td>
//                   <td className="p-1.5 border border-gray-600 align-top text-right text-black">
//                     ₹{transactions
//                       .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.cash_amount || 0), 0)
//                       .toFixed(2)}
//                   </td>
//                   <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black">
//                     ₹{totalReceived.toFixed(2)}
//                   </td>
//                   <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black">
//                     ₹{remainingDue.toFixed(2)}
//                   </td>
//                   <td className="p-1.5 border border-gray-600 align-top"></td>
//                   <td className="p-1.5 border border-gray-600 align-top"></td>
//                   <td className="p-1.5 border border-gray-600 align-top"></td>
//                 </tr>
//                 <tr className="bg-white font-bold">
//                   <td colSpan={9} className="p-1.5 border border-gray-600 align-top text-right text-black">Net Amount:</td>
//                   <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black" colSpan={1}>
//                     ₹{Number(patient?.visit?.billing?.netAmount || 0).toFixed(2)}
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>
//       </div>
//     );
//   };

//   const formatInvoiceDateTime = (dateString?: string) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: true
//     });
//   };

//   const renderInvoicePage = (pageTests: TestList[], pageNumber: number, totalPages: number, transaction?: BillingTransaction, hideButtons: boolean = false) => {
//     // Get invoice date/time from API - use billing createdAt or updatedAt or paymentDate
//     const billing = patient?.visit?.billing;
//     const invoiceDateTime = billing?.createdAt
//       ? formatInvoiceDateTime(billing.createdAt)
//       : (billing?.updatedAt
//         ? formatInvoiceDateTime(billing.updatedAt)
//         : (billing?.paymentDate
//           ? formatInvoiceDateTime(billing.paymentDate)
//           : formatInvoiceDateTime(new Date().toISOString())));

//     return (
//       <div
//         key={`page-${pageNumber}${transaction ? `-txn-${transaction.id}` : ''}`}
//         className="bg-white p-5 mb-6 font-sans"
//         style={{
//           width: '210mm',
//           minHeight: '297mm',
//           pageBreakAfter: pageNumber < totalPages ? 'always' : 'auto'
//         }}
//       >
//         {/* Header Section - Compact */}
//         <div className="flex justify-between items-start mb-4 border-b border-gray-600 pb-2">
//           <div className="flex items-center gap-3">
//             <div>
//               <Image src="/CUREPLUS HOSPITALS (1).png"
//                 alt="Lab Logo" width={70} height={44}
//                 className="h-11 w-auto" priority loading="eager"
//                 unoptimized crossOrigin="anonymous" data-print-logo="true"
//                 quality={100}
//               />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold text-black uppercase tracking-tight leading-tight">{currentLab?.name || 'DIAGNOSTIC CENTER'}</h1>
//               <p className="text-xs text-black leading-tight">{currentLab?.address || ''}</p>
//               {(currentLab?.city || currentLab?.state) && (
//                 <p className="text-xs text-black leading-tight">
//                   {[currentLab?.city, currentLab?.state].filter(Boolean).join(', ')}
//                 </p>
//               )}
//               {currentLab?.labPhone && (
//                 <p className="text-xs text-black leading-tight">Phone: {currentLab.labPhone}</p>
//               )}
//             </div>
//           </div>
//           <div className="text-right border border-gray-600 px-3 py-1.5 bg-white">
//             <p className="text-xs font-bold text-black mb-0.5">INVOICE</p>
//             <p className="text-xs text-black leading-tight"><span className="font-semibold">No:</span> {patient?.visit?.billing?.billingCode || patient?.visit?.billing?.billingId || 'N/A'}</p>
//             <p className="text-xs text-black leading-tight"><span className="font-semibold">Date:</span> {invoiceDateTime}</p>
//           </div>
//         </div>

//         {/* Patient & Visit Info Section - Ultra Compact */}
//         <div className="mb-4 border border-gray-600 p-2">
//           <div className="grid grid-cols-3 gap-3 text-xs">
//             <div>
//               <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Patient</p>
//               <p className="text-black leading-tight"><span className="font-medium">Name:</span> {patient?.firstName || ''} {patient?.lastName || ''}</p>
//               <p className="text-black leading-tight"><span className="font-medium">Age/Sex:</span> {formatAgeForDisplay(patient?.dateOfBirth || '')} / {patient?.gender || 'N/A'}</p>
//               <p className="text-black leading-tight"><span className="font-medium">Contact:</span> {patient?.phone || 'N/A'}</p>
//               <p className="text-black leading-tight"><span className="font-medium">Code:</span> {patient?.patientCode || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Visit</p>
//               <p className="text-black leading-tight"><span className="font-medium">Date:</span> {patient?.visit?.visitDate ? new Date(patient.visit.visitDate).toLocaleDateString('en-IN') : 'N/A'}</p>
//               <p className="text-black leading-tight"><span className="font-medium">Code:</span> {patient?.visit?.visitCode || 'N/A'}</p>
//               <p className="text-black leading-tight"><span className="font-medium">ID:</span> {patient?.visit?.visitId || 'N/A'}</p>
//               <p className="text-black leading-tight"><span className="font-medium">Billing:</span> {patient?.visit?.billing?.billingCode || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Reference</p>
//               <p className="text-black leading-tight"><span className="font-medium">Referred By:</span> {doctor?.name || 'N/A'}</p>
//             </div>
//           </div>
//         </div>

//         {/* Tests Table - Compact */}
//         <div className="mb-4">
//           <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Tests Conducted</h2>
//           <table className="w-full border-collapse border border-gray-600 text-xs">
//             <thead>
//               <tr className="bg-white">
//                 <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Test Name</th>
//                 <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Category</th>
//                 <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Price</th>
//                 <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Discount</th>
//                 <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pageTests.map((test, idx) => {
//                 const discountInfo = getTestDiscount(test.id);
//                 const hasDiscount = discountInfo.discountAmount > 0;
//                 return (
//                   <tr key={`test-${idx}`} className="bg-white">
//                     <td className="p-1.5 border border-gray-400 text-black leading-tight">{test.name}</td>
//                     <td className="p-1.5 border border-gray-400 text-black leading-tight">{test.category || 'General'}</td>
//                     <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">₹{test.price.toFixed(2)}</td>
//                     <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">
//                       {hasDiscount ? `-₹${discountInfo.discountAmount.toFixed(2)}` : '₹0.00'}
//                     </td>
//                     <td className="p-1.5 text-right border border-gray-400 font-semibold text-black leading-tight">
//                       ₹{hasDiscount ? discountInfo.finalPrice.toFixed(2) : test.price.toFixed(2)}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Packages Section (only on last page) - Compact */}
//         {pageNumber === totalPages && healthPackage && healthPackage.length > 0 && (
//           <div className="mb-4">
//             <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Health Packages</h2>
//             <table className="w-full border-collapse border border-gray-600 text-xs">
//               <thead>
//                 <tr className="bg-white">
//                   <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Package Name</th>
//                   <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Price</th>
//                   <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Discount</th>
//                   <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {healthPackage.map((pkg, idx) => (
//                   <React.Fragment key={`pkg-${idx}`}>
//                     <tr className="bg-white">
//                       <td className="p-1.5 border border-gray-400 text-black leading-tight">{pkg.packageName}</td>
//                       <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">₹{pkg.price.toFixed(2)}</td>
//                       <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">-₹{pkg.discount.toFixed(2)}</td>
//                       <td className="p-1.5 text-right border border-gray-400 font-semibold text-black leading-tight">₹{(pkg.price - pkg.discount).toFixed(2)}</td>
//                     </tr>
//                     {pkg.tests && pkg.tests.length > 0 && (
//                       <tr className="bg-white">
//                         <td colSpan={4} className="p-1.5 border border-gray-400">
//                           <div className="pl-1">
//                             <p className="text-xs font-semibold mb-0.5 text-black">Includes:</p>
//                             <div className="grid grid-cols-3 gap-0.5">
//                               {pkg.tests.map((test, testIdx) => (
//                                 <div key={testIdx} className="text-xs bg-white p-0.5 border border-gray-300 text-black leading-tight">
//                                   {test.name}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Payment Summary Section */}
//         {pageNumber === totalPages && (() => {
//           const summaryTxn = transaction ? transaction : undefined;
//           const totalDue = summaryTxn
//             ? Math.max(0, Number(summaryTxn.due_amount || 0))
//             : Number(patient?.visit?.billing?.due_amount || 0);
//           const dueAmount = Number(patient?.visit?.billing?.due_amount || 0);
//           const isPaid = dueAmount === 0;

//           return (
//             <div className="border-t border-gray-600 pt-2">
//               <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Payment Summary</h2>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <div className="flex justify-between py-1 border-b border-gray-400">
//                   <span className="font-semibold text-black">Tests Total:</span>
//                   <span className="text-black">₹{tests.reduce((sum, test) => sum + (getTestDiscount(test.id).finalPrice || test.price), 0).toFixed(2)}</span>
//                 </div>
//                 {healthPackage && healthPackage.length > 0 && (
//                   <div className="flex justify-between py-1 border-b border-gray-400">
//                     <span className="font-semibold text-black">Packages Total:</span>
//                     <span className="text-black">₹{healthPackage.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between py-1 border-b border-gray-400 font-bold">
//                   <span className="text-black">Subtotal:</span>
//                   <span className="text-black">₹{calculateTotal().toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between py-1 border-b border-gray-400">
//                   <span className="text-black">Discount:</span>
//                   <span className="text-black">-₹{Number(patient?.visit?.billing?.discount || 0).toFixed(2)}</span>
//                 </div>
//                 <div className="col-span-2 flex justify-between py-2 font-bold bg-white border border-gray-600 text-black px-2 mt-1">
//                   <span>TOTAL AMOUNT:</span>
//                   <span>
//                     ₹{Number(patient?.visit?.billing?.netAmount || calculateTotal()).toFixed(2)}
//                     {totalDue > 0 && (
//                       <span className="ml-2 text-xs">(Due: ₹{totalDue.toFixed(2)})</span>
//                     )}
//                   </span>
//                 </div>
//                 <div className="col-span-2 grid grid-cols-3 gap-2 mt-1.5 pt-1.5 border-t border-gray-400 text-xs">
//                   <div>
//                     <span className="font-semibold text-black">Status:</span>
//                     <span className="ml-1 text-black font-bold">{isPaid ? 'PAID' : (patient?.visit?.billing?.paymentStatus || 'DUE')}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-black">Method:</span>
//                     <span className="ml-1 text-black">{formatPaymentMethod(summaryTxn ? summaryTxn.payment_method : (patient?.visit?.billing?.paymentMethod || 'N/A'))}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-black">Date:</span>
//                     <span className="ml-1 text-black">{invoiceDateTime}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}

//         {/* Transactions Table */}
//         {printMode === 'all' && pageNumber === totalPages && renderTransactionTable()}
//         {printMode === 'per-transaction' && transaction && pageNumber === totalPages && renderTransactionTable(transaction)}

//         {/* Individual Transaction Action Buttons - Only for Per Transaction mode */}
//         {!hideButtons && printMode === 'per-transaction' && transaction && (
//           <div className="mt-6 pt-4 border-t border-gray-200 print:hidden">
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => generatePDF('print', transaction)}
//                 disabled={isGeneratingPDF || isLoading}
//                 className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 text-xs"
//               >
//                 {isGeneratingPDF ? (
//                   <MdDownloading className="animate-spin" size={12} />
//                 ) : (
//                   <FaPrint size={12} />
//                 )}
//                 {isGeneratingPDF ? 'Generating...' : 'Print'}
//               </button>
//               <button
//                 onClick={() => generatePDF('download', transaction)}
//                 disabled={isGeneratingPDF || isLoading}
//                 className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50 text-xs"
//               >
//                 <FaFilePdf size={12} />
//                 PDF
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Footer - Compact */}
//         <div className="mt-4 pt-2 border-t border-gray-600 text-center text-xs">
//           <p className="text-black mb-1 leading-tight">This is an electronically generated invoice. No signature required.</p>
//           <p className="text-black mb-2 leading-tight">For queries, contact: {currentLab?.name || 'N/A'}</p>
//           <div className="mt-2 flex justify-between items-center border-t border-gray-400 pt-1.5">
//             <div className="flex items-center gap-1">
//               <FaSignature className="text-black text-xs" />
//               <span className="text-black font-semibold text-xs">Authorized Signatory</span>
//             </div>
//             <p className="text-black text-xs"><span className="font-semibold">Generated:</span> {invoiceDateTime}</p>
//           </div>
//           <div className="mt-2 flex justify-center items-center pt-1.5 border-t border-gray-400">
//             <Image src="/tiamed1.svg" alt="TiaMeds Logo" width={14} height={14} className="h-3.5 mr-1.5" style={{ filter: 'grayscale(100%)' }} />
//             <span className="text-xs font-medium text-black">Powered by TiaMeds Technologies Pvt.Ltd</span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const generatePDF = async (action: 'print' | 'download', specificTransaction?: BillingTransaction) => {
//     if (!invoiceRef.current) return;

//     setIsGeneratingPDF(true);
//     setError(null);

//     try {
//       const pages = generateInvoicePages();
//       const transactions = patient?.visit?.billing?.transactions || [];
//       const pdf = new jsPDF('p', 'mm', 'a4');

//       const renderPages = () => {
//         // If specific transaction is provided, generate only for that transaction
//         if (specificTransaction) {
//           return pages.map((pageTests, index) =>
//             renderInvoicePage(pageTests, index + 1, pages.length, specificTransaction, true)
//           );
//         }

//         if (printMode === 'per-transaction' && transactions.length > 0) {
//           // Generate one invoice per transaction
//           return transactions.flatMap((txn: BillingTransaction) => {
//             return pages.map((pageTests, index) =>
//               renderInvoicePage(pageTests, index + 1, pages.length, txn, true)
//             );
//           });
//         } else if (printMode === 'no-transaction') {
//           // Generate invoice without transactions
//           return pages.map((pageTests, index) =>
//             renderInvoicePage(pageTests, index + 1, pages.length, undefined, true)
//           );
//         } else {
//           // Default: generate invoice with all transactions
//           return pages.map((pageTests, index) =>
//             renderInvoicePage(pageTests, index + 1, pages.length, undefined, true)
//           );
//         }
//       };

//       const pagesToRender = renderPages();

//       for (let i = 0; i < pagesToRender.length; i++) {
//         if (i > 0) pdf.addPage();

//         const tempDiv = document.createElement('div');
//         tempDiv.style.position = 'absolute';
//         tempDiv.style.left = '-9999px';
//         tempDiv.style.width = '210mm';
//         document.body.appendChild(tempDiv);

//         await new Promise<void>((resolve) => {
//           const root = createRoot(tempDiv);
//           root.render(pagesToRender[i]);

//           setTimeout(async () => {
//             try {
//               const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
//                 logging: false,
//                 useCORS: true,
//                 allowTaint: true
//               });

//               const imgData = canvas.toDataURL('image/png');
//               const imgWidth = A4_WIDTH - 20;
//               const imgHeight = (canvas.height * imgWidth) / canvas.width;

//               pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

//               document.body.removeChild(tempDiv);
//               resolve();
//             } catch (err) {
//               // Handle page generation error
//               console.error('PDF page generation failed:', err);
//               document.body.removeChild(tempDiv);
//               resolve();
//             }
//           }, 500);
//         });
//       }

//       if (action === 'print') {
//         const pdfBlob = pdf.output('blob');
//         const pdfUrl = URL.createObjectURL(pdfBlob);
//         const printWindow = window.open(pdfUrl);
//         if (printWindow) {
//           printWindow.onload = () => {
//             printWindow.print();
//           };
//         }
//       } else {
//         const transactionSuffix = specificTransaction ? `_txn_${specificTransaction.id}` : '';
//         pdf.save(`invoice_${patient?.firstName}_${patient?.lastName || 'patient'}${transactionSuffix}.pdf`);
//       }
//     } catch (err) {
//       // Handle PDF generation error
//       setError('Failed to generate PDF. Please try again.');
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

//   const handlePrint = async () => {
//     await generatePDF('print');
//   };

//   const handleDownloadPDF = async () => {
//     await generatePDF('download');
//   };

//   const renderInvoicePreview = () => {
//     if (isLoading) {
//       return (
//         <div className="flex flex-col items-center justify-center h-64">
//           <Loader type="progress" fullScreen={false} text="Loading invoice data..." />
//         </div>
//       );
//     }

//     const pages = generateInvoicePages();
//     const transactions = patient?.visit?.billing?.transactions || [];

//     if (printMode === 'per-transaction' && transactions.length > 0) {
//       return transactions.flatMap((txn: BillingTransaction) => {
//         return pages.map((pageTests, index) =>
//           renderInvoicePage(pageTests, index + 1, pages.length, txn)
//         );
//       });
//     } else if (printMode === 'no-transaction') {
//       return pages.map((pageTests, index) =>
//         renderInvoicePage(pageTests, index + 1, pages.length)
//       );
//     } else {
//       return pages.map((pageTests, index) =>
//         renderInvoicePage(pageTests, index + 1, pages.length)
//       );
//     }
//   };

//   if (!currentLab || !patient) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader type="progress" fullScreen={false} text="Loading lab and patient data..." />
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="max-w-4xl mx-auto">
//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 print:hidden gap-4">
//           <div className="text-sm text-black flex items-center gap-2">
//             <FaFileInvoiceDollar />
//             <span>Invoice for Visit Code: {patient?.visit?.visitCode || patient?.visit?.visitId || 'N/A'}</span>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             <div className="flex gap-3 items-center">
//               <label className="text-sm font-medium whitespace-nowrap">Print Mode:</label>
//               <select
//                 value={printMode}
//                 onChange={(e) => setPrintMode(e.target.value as "all" | "per-transaction" | "no-transaction")}
//                 className="border rounded px-2 py-1 text-sm min-w-[150px]"
//                 disabled={isGeneratingPDF}
//               >
//                 <option value="all">All Transactions</option>
//                 <option value="per-transaction">Per Transaction</option>
//                 <option value="no-transaction">No Transactions</option>
//               </select>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={handlePrint}
//                 disabled={isGeneratingPDF || isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 {isGeneratingPDF ? (
//                   <MdDownloading className="animate-spin" />
//                 ) : (
//                   <FaPrint />
//                 )}
//                 {isGeneratingPDF ? 'Generating...' : 'Print'}
//               </button>
//               <button
//                 onClick={handleDownloadPDF}
//                 disabled={isGeneratingPDF || isLoading}
//                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <FaFilePdf />
//                 PDF
//               </button>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 p-2 bg-black text-white rounded text-sm print:hidden">
//             {error}
//           </div>
//         )}

//         {/* Invoice Container */}
//         <div ref={invoiceRef}>
//           {renderInvoicePreview()}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PatientDetailsViewComponent;



