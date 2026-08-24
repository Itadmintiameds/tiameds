import React from 'react';

export interface PurchaseInvoiceProductRow {
  brandName: string;
  qty: string;
  free: string;
  variant: string;
  productName: string;
  hsn: string;
  batch: string;
  expiry: string;
  mrp: string;
  value: string;
  discountPercent: string;
  gstPercent: string;
  amount: string;
}

export interface PurchaseInvoiceSummaryData {
  supplier: string;
  invoiceNo: string;
  invoiceDate: string;
  grn: string;
  paymentType: string;
  creditDays: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    gstin: string;
    drugLicenseNo: string;
  };
  products: PurchaseInvoiceProductRow[];
  taxable: string;
  cgstPercent: string;
  cgstAmt: string;
  sgstPercent: string;
  sgstAmt: string;
  exempted: string;
  freeGst: string;
  bank: {
    name: string;
    branch: string;
    accountNo: string;
    ifsc: string;
  };
  itemsCount: string;
  qty: string;
  crDbRound: string;
  grossAmt: string;
  discountAmt: string;
  taxableAmt: string;
  sgstAmt2: string;
  cgstAmt2: string;
  igstAmt: string;
  netPayable: string;
  amountInWords: string;
}

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex text-sm">
    <span className="w-28 flex-shrink-0 text-gray-500">{label}</span>
    <span className="mr-2 text-gray-400">:</span>
    <span className="font-semibold text-gray-900">{value || '—'}</span>
  </div>
);

const StatRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

interface PurchaseInvoiceSummaryProps {
  data: PurchaseInvoiceSummaryData;
  onBack?: () => void;
  onSave?: () => void;
}

const PurchaseInvoiceSummary: React.FC<PurchaseInvoiceSummaryProps> = ({ data, onBack, onSave }) => {
  const taxBreakdownCells = [
    { label: 'Taxable', value: `₹ ${data.taxable}`, bold: true },
    { label: 'CGST (%)', value: data.cgstPercent, bold: false },
    { label: 'CGST Amt', value: `₹ ${data.cgstAmt}`, bold: true },
    { label: 'SGST (%)', value: data.sgstPercent, bold: false },
    { label: 'SGST Amt', value: `₹ ${data.sgstAmt}`, bold: true },
    { label: 'Exempted', value: data.exempted || '—', bold: false },
    { label: 'Free GST', value: `₹ ${data.freeGst}`, bold: false },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5 sm:px-8 sm:py-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Invoice Summary</h1>
      </div>

      {/* Invoice meta */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <MetaRow label="Supplier" value={data.supplier} />
            <MetaRow label="Invoice No" value={data.invoiceNo} />
            <MetaRow label="Invoice Date" value={data.invoiceDate} />
            <MetaRow label="GRN" value={data.grn} />
          </div>
          <div className="space-y-3">
            <MetaRow label="Payment Type" value={data.paymentType} />
            <MetaRow label="Credit Days" value={data.creditDays} />
            <MetaRow label="Due Date" value={data.dueDate} />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm text-gray-500">Bill To</p>
        <p className="mb-2 text-lg font-bold text-gray-900">{data.billTo.name}</p>
        <p className="mb-2 text-sm text-gray-600">{data.billTo.address}</p>
        <p className="text-sm text-gray-600">
          GSTIN: {data.billTo.gstin} &nbsp;&nbsp; Drug License No: {data.billTo.drugLicenseNo}
        </p>
      </div>

      {/* Product table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Brand Name</th>
              <th className="px-4 py-3 text-center font-semibold">QTY</th>
              <th className="px-4 py-3 text-center font-semibold">Free</th>
              <th className="px-4 py-3 text-center font-semibold">Variant</th>
              <th className="px-4 py-3 text-left font-semibold">Product Name</th>
              <th className="px-4 py-3 text-center font-semibold">HSN</th>
              <th className="px-4 py-3 text-center font-semibold">Batch</th>
              <th className="px-4 py-3 text-center font-semibold">Expiry</th>
              <th className="px-4 py-3 text-right font-semibold">MRP</th>
              <th className="px-4 py-3 text-right font-semibold">VALUE</th>
              <th className="px-4 py-3 text-center font-semibold">DIS%</th>
              <th className="px-4 py-3 text-center font-semibold">GST%</th>
              <th className="px-4 py-3 text-right font-semibold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.products.map((p, idx) => (
              <tr key={`${p.batch}-${idx}`}>
                <td className="px-4 py-4 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-4 text-gray-700">{p.brandName}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.qty}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.free}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.variant}</td>
                <td className="px-4 py-4 font-bold text-gray-900">{p.productName}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.hsn}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.batch}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.expiry}</td>
                <td className="px-4 py-4 text-right text-gray-700">{p.mrp}</td>
                <td className="px-4 py-4 text-right text-gray-700">{p.value}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.discountPercent}</td>
                <td className="px-4 py-4 text-center text-gray-700">{p.gstPercent}</td>
                <td className="px-4 py-4 text-right font-medium text-gray-900">{p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax / bank + stats + net payable */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="grid grid-cols-4 gap-y-4 divide-y divide-gray-100 sm:grid-cols-7 sm:divide-x sm:divide-y-0">
            {taxBreakdownCells.map((cell) => (
              <div key={cell.label} className="px-2 pt-2 text-center first:pt-0 sm:pt-0">
                <p className="mb-1 text-xs text-gray-500">{cell.label}</p>
                <p className={`text-sm ${cell.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{cell.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-y-3 gap-x-8 border-t border-gray-100 pt-5 sm:grid-cols-2">
            <MetaRow label="Bank Name" value={data.bank.name} />
            <MetaRow label="Branch" value={data.bank.branch} />
            <MetaRow label="A/C No" value={data.bank.accountNo} />
            <MetaRow label="IFSC" value={data.bank.ifsc} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="divide-y divide-gray-100">
            <StatRow label="Items" value={data.itemsCount} />
            <StatRow label="QTY" value={data.qty} />
            <StatRow label="CR/DB Round" value={`₹ ${data.crDbRound}`} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Gross AMT</span>
              <span className="font-semibold text-gray-900">₹ {data.grossAmt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">DIS.AMT</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-400">{data.discountAmt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Taxable Amt</span>
              <span className="font-semibold text-gray-900">₹ {data.taxableAmt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">SGST AMT</span>
              <span className="font-semibold text-gray-900">₹{data.sgstAmt2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">CGST AMT</span>
              <span className="font-semibold text-gray-900">₹{data.cgstAmt2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">IGST AMT</span>
              <span className="font-semibold text-gray-900">₹{data.igstAmt}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-base font-bold text-gray-900">NET PAYABLE</span>
            <span className="text-lg font-bold text-gray-900">₹ {data.netPayable}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <span className="text-sm text-gray-500">Amount in words</span>
        <span className="mx-2 text-sm text-gray-400">:</span>
        <span className="text-sm font-bold text-gray-900">{data.amountInWords}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Save TAX Invoice
        </button>
      </div>
    </div>
  );
};

export default PurchaseInvoiceSummary;
