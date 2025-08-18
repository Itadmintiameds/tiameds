import React from 'react';

import { Patient } from '@/types/patient/patient';

interface PatientBillingProps {
  newPatient: Patient
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}


enum PaymentStatus {
  Paid = 'paid',
  Pending = 'pending',
}

enum PaymentMethod {
  Cash = 'cash',
  Card = 'card',
  Online = 'online',
}

const PatientBilling = ({ newPatient, handleChange }: PatientBillingProps) => {
  return (
    <div className="mt-6 p-4 border rounded-xl shadow-lg bg-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Details</h2>

      {/* Discount Input */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="discount" className="text-xs font-medium text-gray-700">Discount (%)</label>
          <input
            type="number"
            name="visit.billing.discount" // Ensure nested path
            value={newPatient.visit?.billing.discount ?? 0}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Total and Net Amount */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-gray-600">Total Amount</p>
          <p className="text-sm font-semibold text-gray-800">
            ₹ {newPatient.visit?.billing?.totalAmount ?? 0}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-gray-600">Net Amount</p>
          <p className="text-sm font-semibold text-gray-800">
            ₹ {newPatient.visit?.billing?.netAmount ?? 0}
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="paymentStatus" className="text-xs font-medium text-gray-700">Payment Status</label>
          <select
            name="visit.billing.paymentStatus" // Nested path for paymentStatus
            value={newPatient.visit?.billing?.paymentStatus ?? ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {
              Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))
            }
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="paymentMethod" className="text-xs font-medium text-gray-700">Payment Method</label>
          <select
            name="visit.billing.paymentMethod" // Nested path for paymentMethod
            value={newPatient.visit?.billing?.paymentMethod ?? ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {
              Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Payment Date */}
      <div className="flex flex-col mb-4">
        <label htmlFor="paymentDate" className="text-xs font-medium text-gray-700">Payment Date</label>
        <input
          type="date"
          name="visit.billing.paymentDate" // Nested path for paymentDate
          value={newPatient.visit?.billing?.paymentDate ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  )
}

export default PatientBilling;
