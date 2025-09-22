

import {
  Patient,
  PaymentMethod,
  PaymentStatus,
  DiscountReason,
} from '@/types/patient/patient';
import React, { useEffect} from 'react';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPercent,
} from 'react-icons/fa';
import { Package } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import Decimal from 'decimal.js';

interface PatientBillingProps {
  newPatient: Patient;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  selectedPackages: Package[];
  setSelectedTests: React.Dispatch<React.SetStateAction<TestList[]>>;
  isGlobalDiscountHidden?: boolean;
}

interface GetSafeDecimal {
  (value: number | string | undefined | null): Decimal;
}

const getSafeDecimal: GetSafeDecimal = (value) => {
  if (value === undefined || value === null || value === '') return new Decimal(0);
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) ? new Decimal(num) : new Decimal(0);
};

const formatAmount = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

const calculatePaymentStatus = (received: Decimal, net: Decimal): PaymentStatus => {
  return received.gte(net) ? PaymentStatus.PAID : PaymentStatus.DUE;
};

const calculateRefundDueAmounts = (received: Decimal, net: Decimal) => {
  if (received.gte(net)) {
    return {
      refund: received.sub(net),
      due: new Decimal(0),
    };
  }
  return {
    refund: new Decimal(0),
    due: net.sub(received),
  };
};

const PatientBilling = ({
  newPatient,
  handleChange,
  selectedPackages,
  setSelectedTests,
  isGlobalDiscountHidden,
}: PatientBillingProps) => {
  const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
  const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);
  // Use the netAmount from parent component which already includes individual test discounts
  const netAmount = getSafeDecimal(newPatient?.visit?.billing?.netAmount);
  const paymentMethod = newPatient?.visit?.billing?.paymentMethod;



  // Calculate discount percentage based on the total amount (which already includes individual test discounts)
  const discountPercentage = totalAmount.gt(0)
    ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
    : '0';

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const total = totalAmount;
    let inputVal = getSafeDecimal(value);

    // Clear test-level discounts when global discount is applied
    if ((name === 'visit.billing.discount' || name === 'visit.billing.discountPercentage') && inputVal.gt(0)) {
      setSelectedTests(prevTests => 
        prevTests.map(test => ({
          ...test,
          discountAmount: 0,
          discountPercent: 0,
          discountedPrice: test.price
        }))
      );
    }

    if (name === 'visit.billing.discountPercentage') {
      if (inputVal.gt(100)) inputVal = new Decimal(100);
      if (inputVal.lt(0)) inputVal = new Decimal(0);

      const fixedDiscount = total.mul(inputVal).div(100).toDecimalPlaces(2);

      handleChange({
        target: {
          name: 'visit.billing.discount',
          value: fixedDiscount.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>);

      handleChange({
        target: {
          name,
          value: inputVal.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    if (name === 'visit.billing.discount') {
      if (inputVal.gt(total)) inputVal = total;
      if (inputVal.lt(0)) inputVal = new Decimal(0);

      const percentage = total.gt(0)
        ? inputVal.div(total).mul(100).toDecimalPlaces(2)
        : new Decimal(0);

      handleChange({
        target: {
          name: 'visit.billing.discountPercentage',
          value: percentage.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>);

      handleChange({
        target: {
          name,
          value: inputVal.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleReceivedAmountInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    
    // Remove leading zeros for direct input fields (CASH, CARD, UPI)
    let cleanValue = value;
    if (paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.UPI) {
      cleanValue = value.replace(/^0+/, '') || '0';
      
      // Limit to 2 decimal places
      if (cleanValue.includes('.')) {
        const parts = cleanValue.split('.');
        if (parts[1] && parts[1].length > 2) {
          cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
    }
    
    // Update the state without causing cursor jumping
    handleChange({ target: { name, value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
    
    // Handle payment logic
    const receivedAmount = getSafeDecimal(cleanValue);
    
    if (paymentMethod === PaymentMethod.CASH) {
      handleChange({ target: { name: 'visit.billing.cash_amount', value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
    } else if (paymentMethod === PaymentMethod.CARD) {
      if (receivedAmount.gt(0)) {
        handleChange({ target: { name: 'visit.billing.card_amount', value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
      }
    } else if (paymentMethod === PaymentMethod.UPI) {
      if (receivedAmount.gt(0)) {
        handleChange({ target: { name: 'visit.billing.upi_amount', value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
    
    // Calculate refund, due, and status for all payment methods
    const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
    
    if (receivedAmount.gt(0) || newPatient.visit?.billing?.paymentStatus) {
      const status = calculatePaymentStatus(receivedAmount, netAmount);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
    }

    handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
    handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
  };

  // Handle UPI ID input with space validation
  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove spaces from UPI ID
    const cleanValue = value.replace(/\s/g, '');
    handleChange({
      target: {
        name: 'visit.billing.upi_id',
        value: cleanValue
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limit decimal places to 2 for individual amount fields
    let cleanValue = value;
    if (name === 'visit.billing.upi_amount' || name === 'visit.billing.cash_amount' || name === 'visit.billing.card_amount') {
      if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1] && parts[1].length > 2) {
          cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
    }
    
    const receivedAmount = getSafeDecimal(cleanValue);

    // For CASH payment method (allow any amount including 0)
    if (paymentMethod === PaymentMethod.CASH && name === 'visit.billing.received_amount') {
      // Don't update received_amount here to avoid cursor jumping
      handleChange({ target: { name: 'visit.billing.cash_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      
      // Only calculate status if received amount is greater than 0 or if there's already a status set
      if (receivedAmount.gt(0) || newPatient.visit?.billing?.paymentStatus) {
        const status = calculatePaymentStatus(receivedAmount, netAmount);
        handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      }

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For CARD payment method (received amount → card amount)
    if (paymentMethod === PaymentMethod.CARD && name === 'visit.billing.received_amount') {
      // Validate that received amount is greater than 0
      if (receivedAmount.lte(0)) {
        return; // Don't update if amount is 0 or negative
      }
      
      handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.card_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      
      // Only calculate status if received amount is greater than 0 or if there's already a status set
      if (receivedAmount.gt(0) || newPatient.visit?.billing?.paymentStatus) {
        const status = calculatePaymentStatus(receivedAmount, netAmount);
        handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      }

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For UPI payment method (received amount → upi amount)
    if (paymentMethod === PaymentMethod.UPI && name === 'visit.billing.received_amount') {
      // Validate that received amount is greater than 0
      if (receivedAmount.lte(0)) {
        return; // Don't update if amount is 0 or negative
      }
      
      handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.upi_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      
      // Only calculate status if received amount is greater than 0 or if there's already a status set
      if (receivedAmount.gt(0) || newPatient.visit?.billing?.paymentStatus) {
        const status = calculatePaymentStatus(receivedAmount, netAmount);
        handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      }

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

         // For UPI_CASH payment method (sum amounts → received amount)
     if (paymentMethod === PaymentMethod.UPI_CASH && 
         (name === 'visit.billing.upi_amount' || name === 'visit.billing.cash_amount')) {
       const upiAmount = getSafeDecimal(name === 'visit.billing.upi_amount' ? cleanValue : newPatient.visit?.billing?.upi_amount);
       const cashAmount = getSafeDecimal(name === 'visit.billing.cash_amount' ? cleanValue : newPatient.visit?.billing?.cash_amount);
       const totalReceived = upiAmount.add(cashAmount);

       // Allow typing in individual fields, but only calculate total if both are positive
       if (upiAmount.lte(0) && cashAmount.lte(0)) {
         // If both amounts are 0 or negative, just update the field being typed in
         handleChange({ target: { name, value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
         return;
       }

      handleChange({ target: { name, value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.received_amount', value: totalReceived.toString() } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(totalReceived, netAmount);
      
      // Only calculate status if total received amount is greater than 0 or if there's already a status set
      if (totalReceived.gt(0) || newPatient.visit?.billing?.paymentStatus) {
        const status = calculatePaymentStatus(totalReceived, netAmount);
        handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      }

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

         // For CARD_CASH payment method (sum amounts → received amount)
     if (paymentMethod === PaymentMethod.CARD_CASH && 
         (name === 'visit.billing.card_amount' || name === 'visit.billing.cash_amount')) {
       const cardAmount = getSafeDecimal(name === 'visit.billing.card_amount' ? cleanValue : newPatient.visit?.billing?.card_amount);
       const cashAmount = getSafeDecimal(name === 'visit.billing.cash_amount' ? cleanValue : newPatient.visit?.billing?.cash_amount);
       const totalReceived = cardAmount.add(cashAmount);

       // Allow typing in individual fields, but only calculate total if both are positive
       if (cardAmount.lte(0) && cashAmount.lte(0)) {
         // If both amounts are 0 or negative, just update the field being typed in
         handleChange({ target: { name, value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
         return;
       }

      handleChange({ target: { name, value: cleanValue } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.received_amount', value: totalReceived.toString() } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(totalReceived, netAmount);
      
      // Only calculate status if total received amount is greater than 0 or if there's already a status set
      if (totalReceived.gt(0) || newPatient.visit?.billing?.paymentStatus) {
        const status = calculatePaymentStatus(totalReceived, netAmount);
        handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      }

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // Default case for other fields
    handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
  };

  // Set default payment status to DUE when component mounts
  useEffect(() => {
    // Always set payment status to DUE on mount if it's not already set
    const currentStatus = newPatient.visit?.billing?.paymentStatus;
    if (!currentStatus) {
      handleChange({
        target: {
          name: 'visit.billing.paymentStatus',
          value: PaymentStatus.DUE,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [newPatient.visit?.billing?.paymentStatus, handleChange]); // Run when status changes or component mounts

  // Force set default payment status to DUE on initial mount
  useEffect(() => {
    handleChange({
      target: {
        name: 'visit.billing.paymentStatus',
        value: PaymentStatus.DUE,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  }, []); // Only run once on mount

  useEffect(() => {
    if (!paymentMethod) return;
    const fieldsToReset = [
      'visit.billing.upi_id',
      'visit.billing.upi_amount',
      'visit.billing.cash_amount',
      'visit.billing.card_amount',
      'visit.billing.received_amount',
      'visit.billing.refund_amount',
      'visit.billing.due_amount',
    ];

    fieldsToReset.forEach((field) => {
      handleChange({
        target: {
          name: field,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  }, [paymentMethod, handleChange]);

  const canEditDiscount = selectedPackages.length === 0 && !isGlobalDiscountHidden;
  
  // Calculate the total received amount for display
  const getTotalReceivedAmount = (): Decimal => {
    switch (paymentMethod) {
      case PaymentMethod.CASH:
        return getSafeDecimal(newPatient.visit?.billing?.cash_amount);
      case PaymentMethod.UPI:
        return getSafeDecimal(newPatient.visit?.billing?.upi_amount);
      case PaymentMethod.CARD:
        return getSafeDecimal(newPatient.visit?.billing?.card_amount);
      case PaymentMethod.UPI_CASH:
        return getSafeDecimal(newPatient.visit?.billing?.upi_amount)
          .add(getSafeDecimal(newPatient.visit?.billing?.cash_amount));
      case PaymentMethod.CARD_CASH:
        return getSafeDecimal(newPatient.visit?.billing?.card_amount)
          .add(getSafeDecimal(newPatient.visit?.billing?.cash_amount));
      default:
        return new Decimal(0);
    }
  };

  const totalReceived = getTotalReceivedAmount();
  
  // Calculate collected amount from existing transactions (net amount after refunds)
  const existingTransactions = newPatient.visit?.billing?.transactions || [];
  const collectedAmount = existingTransactions.reduce(
    (acc, transaction) => {
      const received = transaction.received_amount || 0;
      const refund = transaction.refund_amount || 0;
      return acc + (received - refund); // Net collected amount (received - refund)
    },
    0
  );
  
  // Calculate total net collected amount (existing collected + new payment)
  const totalNetCollected = collectedAmount + totalReceived.toNumber();
  const dueAmount = Math.max(0, netAmount.toNumber() - totalNetCollected);
  const refundAmount = Math.max(0, totalNetCollected - netAmount.toNumber());
  
  const { refund, due } = {
    refund: new Decimal(refundAmount),
    due: new Decimal(dueAmount)
  };


  return (
    <section className="bg-gray-50 rounded-lg border border-gray-200 shadow-xs overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-800 flex items-center">
          <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
          Billing Details 
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-5 items-end">
          {canEditDiscount && (
            <>
              <div className="flex flex-col min-w-[100px]">
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                  <FaPercent className="mr-1.5 text-purple-500 text-xs" />
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="visit.billing.discountPercentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercentage}
                  onChange={handleDiscountChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex flex-col min-w-[100px]">
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                  Discount in ₹
                </label>
                <input
                  type="number"
                  name="visit.billing.discount"
                  min="0"
                  max={totalAmount.toNumber()}
                  step="0.01"
                  value={formatAmount(discount.toNumber())}
                  onChange={handleDiscountChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </>
          )}

          <div className="flex flex-col min-w-[160px]">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaPercent className="mr-1.5 text-purple-500 text-xs" />
              Discount Reason
            </label>
            <select
              name="visit.billing.discountReason"
              value={newPatient.visit?.billing.discountReason ?? ''}
              onChange={handleChange}
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            >
              {Object.values(DiscountReason).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Total Amount
            </p>
            <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
              <p className="text-sm font-semibold text-gray-800">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-col min-w-auto">
            <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
            <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
              <p className="text-sm font-semibold text-gray-800">
                ₹{netAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Only show Collected Amount in edit mode (when there are existing transactions) */}
          {existingTransactions.length > 0 && (
            <div className="flex flex-col min-w-auto">
              <p className="text-xs font-medium text-gray-500 mb-1">Collected Amount</p>
              <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
                <p className="text-sm font-semibold text-gray-800">
                  ₹{collectedAmount.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaInfoCircle className="mr-1.5 text-purple-500 text-xs" />
              Status
            </label>
            <select
              name="visit.billing.paymentStatus"
              value={newPatient.visit?.billing?.paymentStatus ?? PaymentStatus.DUE}
              onChange={handleChange}
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              required
              disabled
            >
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaCreditCard className="mr-1.5 text-purple-500 text-xs" />
              Method
            </label>
             <select
               name="visit.billing.paymentMethod"
               value={newPatient.visit?.billing?.paymentMethod ?? ''}
               onChange={handleChange}
               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
               required
             >
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1.5 text-purple-500 text-xs" />
              Payment Date
            </label>
            <input
              type="date"
              disabled
              name="visit.billing.paymentDate"
              value={newPatient.visit?.billing.paymentDate ?? ''}
              onChange={handleChange}
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                UPI ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="visit.billing.upi_id"
                value={newPatient.visit?.billing?.upi_id ?? ''}
                onChange={handleUpiIdChange}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter UPI ID"
                required
              />
            </div>
          )}

                     {/* Received Amount - Show for UPI and CARD payment methods */}
           {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.CARD) && (
             <div className="flex flex-col">
               <label className="text-xs font-medium text-gray-600 mb-1">
                 Received Amount (₹) <span className="text-red-500">*</span>
               </label>
               <input
                 type="number"
                 name="visit.billing.received_amount"
                 min="0"
                 step="0.01"
                 required
                 value={newPatient.visit?.billing?.received_amount || '0'}
                 onInput={handleReceivedAmountInput}
                 onChange={() => {}} // Empty onChange to prevent React warnings
                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               />
             </div>  
           )}

           {/* Received Amount - Show for CASH payment method (not required) */}
           {paymentMethod === PaymentMethod.CASH && (
             <div className="flex flex-col">
               <label className="text-xs font-medium text-gray-600 mb-1">
                 Received Amount (₹)
               </label>
               <input
                 type="number"
                 name="visit.billing.received_amount"
                 min="0"
                 step="0.01"
                 value={newPatient.visit?.billing?.received_amount || '0'}
                 onInput={handleReceivedAmountInput}
                 onChange={() => {}} // Empty onChange to prevent React warnings
                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               />
             </div>  
           )}

          {paymentMethod === PaymentMethod.CASH && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Cash Amount (₹)
              </label>
              <input
                type="number"
                name="visit.billing.cash_amount"
                min="0"
                step="0.01"
                disabled
                value={formatAmount(newPatient.visit?.billing?.cash_amount)}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          )}

          {paymentMethod === PaymentMethod.CARD && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Card Amount (₹)
              </label>
              <input
                type="number"
                name="visit.billing.card_amount"
                min="0"
                step="0.01"
                disabled
                value={formatAmount(newPatient.visit?.billing?.card_amount)}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          )}

          {paymentMethod === PaymentMethod.UPI && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                UPI Amount (₹)
              </label>
              <input
                type="number"
                name="visit.billing.upi_amount"
                min="0"
                step="0.01"
                disabled
                value={formatAmount(newPatient.visit?.billing?.upi_amount)}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          )}

          {paymentMethod === PaymentMethod.UPI_CASH && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  UPI Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="visit.billing.upi_amount"
                  min="0"
                  step="0.01"
                  required
                  value={newPatient.visit?.billing?.upi_amount || ''}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Cash Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="visit.billing.cash_amount"
                  min="0"
                  step="0.01"
                  required
                  value={newPatient.visit?.billing?.cash_amount || ''}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </>
          )}

          {paymentMethod === PaymentMethod.CARD_CASH && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Card Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="visit.billing.card_amount"
                  min="0"
                  step="0.01"
                  required
                  value={newPatient.visit?.billing?.card_amount || ''}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Cash Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="visit.billing.cash_amount"
                  min="0"
                  step="0.01"
                  required
                  value={newPatient.visit?.billing?.cash_amount || ''}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </>
          )}

          {/* Show received amount for UPI+CASH and CARD+CASH (auto-calculated) */}
          {(paymentMethod === PaymentMethod.UPI_CASH || paymentMethod === PaymentMethod.CARD_CASH) && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Received Amount (₹)
              </label>
              <input
                type="number"
                name="visit.billing.received_amount"
                min="0"
                step="0.01"
                disabled
                value={formatAmount(newPatient.visit?.billing?.received_amount)}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          )}

          {/* Show refund/due amount for all payment methods */}
          {(paymentMethod === PaymentMethod.CASH || 
            paymentMethod === PaymentMethod.UPI || 
            paymentMethod === PaymentMethod.CARD ||
            paymentMethod === PaymentMethod.UPI_CASH ||
            paymentMethod === PaymentMethod.CARD_CASH) && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                {refund.gt(0) ? 'Refund Amount' : 'Due Amount'} (₹)
              </label>
              <input
                type="number"
                name="visit.billing.refund_amount"
                min="0"
                disabled
                value={formatAmount(refund.gt(0) ? refund.toString() : due.toString())}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatientBilling;