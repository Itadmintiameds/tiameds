// import { Patient } from '@/types/patient/patient';
// import React from 'react';
// import { FaCalendarAlt, FaCreditCard, FaInfoCircle, FaMoneyBillWave, FaPercent } from 'react-icons/fa';
// import { Package } from '@/types/package/package';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// enum PaymentStatus {
//   Paid = 'paid',
//   Pending = 'pending',
// }

// enum PaymentMethod {
//   Cash = 'cash',
//   Card = 'card',
//   Online = 'online',
// }

// enum DiscountReason {
//   SeniorCitizen = 'Senior Citizen',
//   Student = 'Student',
//   HealthcareWorker = 'Healthcare Worker',
//   CorporateTieUp = 'Corporate Tie-up',
//   Referral = 'Referral',
//   PreventiveCheckupCamp = 'Preventive Checkup Camp',
//   Loyalty = 'Loyalty',
//   DisabilitySupport = 'Disability Support',
//   BelowPovertyLine = 'Below Poverty Line (BPL)',
//   FestiveOffer = 'Festive or Seasonal Offer',
//   PackageDiscount = 'Package Discount + Additional Test Discount',
// }

// const PatientBilling = ({ newPatient, handleChange, selectedPackages, isGlobalDiscountHidden }: PatientBillingProps) => {
//   const totalAmount = newPatient.visit?.billing?.totalAmount || 0;
//   const discount = newPatient.visit?.billing?.discount ?? 0;
//   const discountPercentage = totalAmount > 0 ? ((discount / totalAmount) * 100).toFixed(2) : '0';
//   const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const numericValue = parseFloat(value) || 0;

//     if (name === 'visit.billing.discountPercentage') {
//       const fixedDiscount = (numericValue / 100) * totalAmount;
//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toFixed(2),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       const percentage = totalAmount > 0 ? (numericValue / totalAmount) * 100 : 0;
//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toFixed(2),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     handleChange(e);
//   };

//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         {/* Discount Section */}
//         <div className="flex flex-wrap gap-5 items-end">
//           {selectedPackages.length === 0 && !isGlobalDiscountHidden && (
//             <div className="flex flex-col min-w-[100px]">
//               <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                 <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                 Discount (%)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.discountPercentage"
//                 min="0"
//                 max="100"
//                 value={discountPercentage || ''}
//                 placeholder='0.00'
//                 onChange={handleDiscountChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {selectedPackages.length === 0 && !isGlobalDiscountHidden && (
//             <div className="flex flex-col min-w-[100px]">
//               <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                 Discount in ₹
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.discount"
//                 min="0"
//                 max={totalAmount}
//                 value={discount || ''}
//                 placeholder="0.00"
//                 onChange={handleDiscountChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}
//           <div className="flex flex-col min-w-[100px]">
//             <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//               <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//               Discount Reason
//             </label>
//             <select
//               name="visit.billing.discountReason"
//               value={newPatient.visit?.billing.discountReason ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="">Select reason</option>
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">₹{totalAmount.toFixed(2)}</p>
//             </div>
//           </div>
//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 {selectedPackages.length === 0 && !isGlobalDiscountHidden
//                   ? `₹${(totalAmount - discount).toFixed(2)}`
//                   : `₹${newPatient.visit?.billing.netAmount}`}
//               </p>

//             </div>
//           </div>
//         </div>
//         {/* Payment Details */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="flex flex-col">
//             <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//               <FaInfoCircle className="mr-1.5 text-purple-500 text-xs" />
//               Status
//             </label>
//             <select
//               name="visit.billing.paymentStatus"
//               value={newPatient.visit?.billing?.paymentStatus ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               required
//             >
//               <option value="">Select status</option>
//               {Object.values(PaymentStatus).map((status) => (
//                 <option key={status} value={status}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col">
//             <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//               <FaCreditCard className="mr-1.5 text-purple-500 text-xs" />
//               Method
//             </label>
//             <select
//               name="visit.billing.paymentMethod"
//               value={newPatient.visit?.billing?.paymentMethod ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               required
//             >
//               <option value="">Select method</option>
//               {Object.values(PaymentMethod).map((method) => (
//                 <option key={method} value={method}>
//                   {method.charAt(0).toUpperCase() + method.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col">
//             <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//               <FaCalendarAlt className="mr-1.5 text-purple-500 text-xs" />
//               Payment Date
//             </label>
//             <input
//               type="date"
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing?.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               required
//               max={new Date().toISOString().split('T')[0]}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };
// export default PatientBilling;











import { Patient } from '@/types/patient/patient';
import React from 'react';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPercent,
} from 'react-icons/fa';
import { Package } from '@/types/package/package';
import Decimal from 'decimal.js';

interface PatientBillingProps {
  newPatient: Patient;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  selectedPackages: Package[];
  isGlobalDiscountHidden?: boolean;
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

enum DiscountReason {
  SeniorCitizen = 'Senior Citizen',
  Student = 'Student',
  HealthcareWorker = 'Healthcare Worker',
  CorporateTieUp = 'Corporate Tie-up',
  Referral = 'Referral',
  PreventiveCheckupCamp = 'Preventive Checkup Camp',
  Loyalty = 'Loyalty',
  DisabilitySupport = 'Disability Support',
  BelowPovertyLine = 'Below Poverty Line (BPL)',
  FestiveOffer = 'Festive or Seasonal Offer',
  PackageDiscount = 'Package Discount + Additional Test Discount',
}

// const getSafeDecimal = (value: any): Decimal => {
//   const num = parseFloat(value);
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

interface GetSafeDecimal {
  (value: number | string | undefined | null): Decimal;
}

const getSafeDecimal: GetSafeDecimal = (value) => {
  const num = parseFloat(value as string);
  return !isNaN(num) ? new Decimal(num) : new Decimal(0);
};

const PatientBilling = ({
  newPatient,
  handleChange,
  selectedPackages,
  isGlobalDiscountHidden,
}: PatientBillingProps) => {
  const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
  const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);

  const discountPercentage = totalAmount.gt(0)
    ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
    : '0.00';



  const handleDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const total = totalAmount;
    let inputVal = getSafeDecimal(value);

    if (name === 'visit.billing.discountPercentage') {
      // Cap percentage to 100
      if (inputVal.gt(100)) inputVal = new Decimal(100);

      const fixedDiscount = total
        .mul(inputVal)
        .div(100)
        .toDecimalPlaces(2);

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
      // Cap discount to total amount
      if (inputVal.gt(total)) inputVal = total;

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



  const canEditDiscount =
    selectedPackages.length === 0 && !isGlobalDiscountHidden;

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
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
                  value={discountPercentage || ''}
                  placeholder="0.00"
                  onChange={handleDiscountChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  value={discount.toString()}
                  placeholder="0.00"
                  onChange={handleDiscountChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select reason</option>
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
                ₹
                {canEditDiscount
                  ? totalAmount.sub(discount).toFixed(2)
                  : newPatient.visit?.billing.netAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaInfoCircle className="mr-1.5 text-purple-500 text-xs" />
              Status
            </label>
            <select
              name="visit.billing.paymentStatus"
              value={newPatient.visit?.billing?.paymentStatus ?? ''}
              onChange={handleChange}
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select status</option>
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
              <option value="">Select method</option>
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
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
              name="visit.billing.paymentDate"
              value={newPatient.visit?.billing.paymentDate ?? ''}
              onChange={handleChange}
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientBilling;
