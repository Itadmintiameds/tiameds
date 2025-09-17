import React, { useState, useEffect } from 'react';
import { Patient, PaymentMethod, PaymentStatus, BillingTransaction } from '@/types/patient/patient';
import Button from '../common/Button';
import { toast } from 'react-toastify';
import {
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaCity,
  FaVenusMars,
  FaRupeeSign,
  FaHistory
} from 'react-icons/fa';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { makePartialPayment } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import Decimal from 'decimal.js';



 
// interface EnhancedPatient extends Omit<Patient, 'visit'> {
//   visit: PatientVisit;
// }

interface DuePaymentProps {
  onPaymentSuccess?: (updatedPatient: Patient) => void;
  patient: Patient;
  onClose: () => void;
  currentUser?: { username: string };
}

// Utility functions
const getSafeDecimal = (value: number | string | undefined | null): Decimal => {
  if (value === undefined || value === null || value === '') return new Decimal(0);
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) ? new Decimal(num) : new Decimal(0);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// const formatTime = (timeString: string) => {
//   return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// };

const calculateRefundDueAmounts = (received: Decimal, due: Decimal) => {
  if (received.gte(due)) {
    return {
      refund: received.sub(due),
      due: new Decimal(0),
    };
  }
  return {
    refund: new Decimal(0),
    due: due.sub(received),
  };
};

const DuePayment: React.FC<DuePaymentProps> = ({ patient, onClose, onPaymentSuccess }) => {
  const { currentLab } = useLabs();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentData, setPaymentData] = useState({
    upiId: '',
    upiAmount: new Decimal(0),
    cardAmount: new Decimal(0),
    cashAmount: new Decimal(0),
    receivedAmount: new Decimal(0),
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const billing = patient?.visit?.billing;
  const netAmount = getSafeDecimal(billing?.netAmount);
  const totalAmount = getSafeDecimal(billing?.totalAmount);
  const discountAmount = getSafeDecimal(billing?.discount);
  
  // Calculate actual due amount from transactions
  const txns = (billing?.transactions ?? []) as BillingTransaction[];
  const totalReceived = txns.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.received_amount || 0), 0);
  const totalRefund = txns.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.refund_amount || 0), 0);
  const actualPaidAmount = getSafeDecimal(totalReceived - totalRefund);
  const dueAmount = getSafeDecimal(Math.max(0, netAmount.sub(actualPaidAmount).toNumber()));
  
  const { refund, due } = calculateRefundDueAmounts(paymentData.receivedAmount, dueAmount);

  useEffect(() => {
    if (billing?.paymentMethod) {
      setPaymentMethod(billing.paymentMethod);
    }

    const lastTransaction = billing?.transactions?.[0];
    if (lastTransaction) {
      setPaymentData(prev => ({
        ...prev,
        upiId: lastTransaction.upi_id || '',
        // remarks: lastTransaction.remarks || 'Partial payment'
      }));
    }
  }, [billing]);

  // Handle UPI ID input with space validation
  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove spaces from UPI ID
    const cleanValue = value.replace(/\s/g, '');
    setPaymentData({ ...paymentData, upiId: cleanValue });
  };

  const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const decimalValue = getSafeDecimal(value);

    setPaymentData(prev => {
      const newState = { ...prev };

      // Update the changed field
      if (name === 'upiAmount') newState.upiAmount = decimalValue;
      if (name === 'cardAmount') newState.cardAmount = decimalValue;
      if (name === 'cashAmount') newState.cashAmount = decimalValue;

      // Calculate received amount based on payment method
      switch (paymentMethod) {
        case PaymentMethod.CASH:
          newState.receivedAmount = newState.cashAmount;
          break;
        case PaymentMethod.UPI:
          newState.receivedAmount = newState.upiAmount;
          break;
        case PaymentMethod.CARD:
          newState.receivedAmount = newState.cardAmount;
          break;
        case PaymentMethod.UPI_CASH:
          newState.receivedAmount = newState.upiAmount.add(newState.cashAmount);
          break;
        case PaymentMethod.CARD_CASH:
          newState.receivedAmount = newState.cardAmount.add(newState.cashAmount);
          break;
      }

      return newState;
    });
  };




  const constructPaymentPayload = () => {
    const newReceivedAmount = paymentData.receivedAmount;
    const currentReceived = actualPaidAmount; // Use the calculated actual paid amount
    const totalReceived = currentReceived.add(newReceivedAmount);
    const newDueAmount = dueAmount.sub(newReceivedAmount);
    const isFullyPaid = newDueAmount.lte(0);

    return {
      billingId: billing?.billingId,
      paymentStatus: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.DUE,

      due_amount: Math.max(0, newDueAmount.toNumber()),
      received_amount: totalReceived.toNumber(),
      paymentMethod: paymentMethod,
      payment_date: new Date().toISOString().split('T')[0],

      transaction: {
        payment_method: paymentMethod,
        upi_id: paymentMethod.includes('UPI') ? paymentData.upiId : null,
        upi_amount: paymentMethod.includes('UPI') ? paymentData.upiAmount.toNumber() : null,
        card_amount: paymentMethod.includes('CARD') ? paymentData.cardAmount.toNumber() : null,
        cash_amount: paymentMethod.includes('CASH') ? paymentData.cashAmount.toNumber() : null,
        received_amount: newReceivedAmount.toNumber(),
        refund_amount: isFullyPaid ? Math.abs(newDueAmount.toNumber()) : null,
        due_amount: isFullyPaid ? 0 : newDueAmount.toNumber(),
        payment_date: new Date().toISOString().split('T')[0],
        // remarks: paymentData.remarks || `Payment via ${paymentMethod}`,

      }
    };
  };



  const handlePayment = async () => {
    if (!billing) {
      toast.error("No billing information available");
      return;
    }

    if (paymentData.receivedAmount.lte(0)) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setLoading(true);

    try {
      const payload = constructPaymentPayload();
      const response = await makePartialPayment(
        Number(currentLab?.id),
        Number(billing.billingId),
        payload
      );

      setPaymentSuccess(true);

      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...patient,
          visit: {
            ...patient.visit,
            billing: response.billing
          }
        });
      }
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Payment failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!billing) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <FiX size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Information</h3>
        <p className="text-gray-600">This patient visit doesn&apos;t have any billing information available.</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="p-6 text-center">
        <div className="text-green-500 mb-4">
          <FiCheck size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful</h3>
        <p className="text-gray-600 mb-6">
          ₹{paymentData.receivedAmount.toFixed(2)} received against due amount of ₹{dueAmount.toFixed(2)}
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Remaining Due:</span>
            <span className={`font-medium ${due.gt(0) ? 'text-amber-600' : 'text-gray-900'}`}>
              ₹{due.toFixed(2)}
            </span>
          </div>
          {refund.gt(0) && (
            <div className="flex justify-between text-green-600">
              <span>Refund Amount:</span>
              <span className="font-medium">₹{refund.toFixed(2)}</span>
            </div>
          )}
        </div>
        <Button
          text="Close"
          onClick={onClose}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Patient Info Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
              <div className="flex items-center text-gray-600">
                <FaIdCard className="mr-2 text-gray-400" />
                <span>ID: {patient?.visit?.visitId}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhoneAlt className="mr-2 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaCity className="mr-2 text-gray-400" />
                <span>{patient.city}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaVenusMars className="mr-2 text-gray-400" />
                <span>{patient.gender}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                <span>{patient.age}</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
            <div className="text-sm text-blue-700 mt-1">
              {formatDate(patient.visit.visitDate)} • {patient.visit.visitType}
            </div>
            <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${patient.visit.visitStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
              patient.visit.visitStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {patient.visit.visitStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Summary Card */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
          <FaRupeeSign className="mr-1.5 text-green-600 text-sm" />
          Billing Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center">
              Discount
              {billing.discountReason && (
                <span className="text-xs ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full flex items-center">
                  <FiInfo className="mr-0.5" /> {billing.discountReason}
                </span>
              )}
            </span>
            <span className="text-red-600">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1.5">
            <span className="text-gray-700 font-medium">Net:</span>
            <span className="font-medium">₹{netAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid:</span>
            <span className="text-green-600">₹{actualPaidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1.5">
            <span className="text-gray-700 font-medium">Due:</span>
            <span className="text-amber-600 font-medium">₹{dueAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* //---------------- */}

      {/* Add Transactions Section */}
      {billing.transactions && billing.transactions.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
            <FaHistory className="mr-1.5 text-blue-600 text-sm" />
            Payment History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Billing ID</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Method / UPI</th>
                  <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">UPI Amt</th>
                  <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Card Amt</th>
                  <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Cash Amt</th>
                  <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  {/* <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Refund</th> */}
                  <th className="px-2 py-1 text-right font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  {/* <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Remarks</th> */}
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                  {/* <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Created At</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...billing.transactions]
                  .sort((a, b) => (a.id ?? 0) - (b.id ?? 0)) // ascending by ID
                  .map((t, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{t.id}</td>
                      <td className="px-2 py-1">{t.createdBy || 'N/A'}</td>
                      <td className="px-2 py-1">{t.billing_id}</td>
                      <td className="px-2 py-1">
                        {t.payment_method}
                      
                      </td>
                      <td className="px-2 py-1 text-right">₹{getSafeDecimal(t.upi_amount).toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">₹{getSafeDecimal(t.card_amount).toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">₹{getSafeDecimal(t.cash_amount).toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-bold">₹{getSafeDecimal(t.received_amount).toFixed(2)}</td>
                      {/* <td className="px-2 py-1 text-right text-red-600">
                        {t.refund_amount != null && t.refund_amount > 0 ? `-₹${getSafeDecimal(t.refund_amount).toFixed(2)}` : '-'}
                      </td> */}
                      <td className={`px-2 py-1 text-right ${t.due_amount > 0 ? 'text-red-600' : ''}`}>
                        {t.due_amount > 0 ? `₹${getSafeDecimal(t.due_amount).toFixed(2)}` : '-'}
                      </td>
                      {/* <td className="px-2 py-1 text-gray-500">{t.remarks || 'Payment received'}</td> */}
                      {/* <td className="px-2 py-1 text-gray-500 whitespace-nowrap">
                        {formatDate(t.payment_date)} {formatTime(t.payment_date)}
                      </td> */}
                      <td className="px-2 py-1 text-gray-500 whitespace-nowrap">
                        {formatDate(t.created_at || '')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* //---------------- */}


      {/* Payment Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Make Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Method Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* UPI ID Field */}
            {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={paymentData.upiId}
                  onChange={handleUpiIdChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter UPI ID"
                  required
                />
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={paymentData.remarks}
                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                placeholder="Payment notes..."
              />
            </div>

          </div>

          {/* Payment Amount Fields */}
          <div className="space-y-4">
            {paymentMethod === PaymentMethod.UPI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI Amount (₹)</label>
                <input
                  type="number"
                  name="upiAmount"
                  value={paymentData.upiAmount.toString()}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  max={dueAmount.toString()}
                  step="0.01"
                />
              </div>
            )}

            {paymentMethod === PaymentMethod.CARD && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Amount (₹)</label>
                <input
                  type="number"
                  name="cardAmount"
                  value={paymentData.cardAmount.toString()}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  max={dueAmount.toString()}
                  step="0.01"
                />
              </div>
            )}

            {paymentMethod === PaymentMethod.CASH && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cash Amount (₹)</label>
                <input
                  type="number"
                  name="cashAmount"
                  value={paymentData.cashAmount.toString()}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  max={dueAmount.toString()}
                  step="0.01"
                />
              </div>
            )}

            {paymentMethod === PaymentMethod.UPI_CASH && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI Amount (₹)</label>
                  <input
                    type="number"
                    name="upiAmount"
                    value={paymentData.upiAmount.toString()}
                    onChange={handlePaymentFieldChange}
                    className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max={dueAmount.toString()}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash Amount (₹)</label>
                  <input
                    type="number"
                    name="cashAmount"
                    value={paymentData.cashAmount.toString()}
                    onChange={handlePaymentFieldChange}
                    className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max={dueAmount.toString()}
                    step="0.01"
                  />
                </div>
              </>
            )}

            {paymentMethod === PaymentMethod.CARD_CASH && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Amount (₹)</label>
                  <input
                    type="number"
                    name="cardAmount"
                    value={paymentData.cardAmount.toString()}
                    onChange={handlePaymentFieldChange}
                    className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max={dueAmount.toString()}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash Amount (₹)</label>
                  <input
                    type="number"
                    name="cashAmount"
                    value={paymentData.cashAmount.toString()}
                    onChange={handlePaymentFieldChange}
                    className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max={dueAmount.toString()}
                    step="0.01"
                  />
                </div>
              </>
            )}
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Received Amount:</span>
                  <span className="font-medium">₹{paymentData.receivedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Amount:</span>
                  <span className="font-medium text-amber-600">₹{dueAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Remaining:</span>
                  <span className={`font-medium ${refund.gt(0) ? 'text-green-600' : 'text-amber-600'}`}>
                    {refund.gt(0) ? `Refund: ₹${refund.toFixed(2)}` : `Due: ₹${due.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                text="Cancel"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              />
              <Button
                text={loading ? "Processing..." : "Confirm Payment"}
                onClick={handlePayment}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading || paymentData.receivedAmount.lte(0)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuePayment;