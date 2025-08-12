// import { Patient, PaymentMethod, PaymentStatus, } from '@/types/patient/patient';
// import React from 'react';
// import {
//   FaCalendarAlt,
//   FaCreditCard,
//   FaInfoCircle,
//   FaMoneyBillWave,
//   FaPercent,
// } from 'react-icons/fa';
// import { Package } from '@/types/package/package';
// import Decimal from 'decimal.js';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// enum DiscountReason {
//   None = 'None',
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

// interface GetSafeDecimal {
//   (value: number | string | undefined | null): Decimal;
// }

// const getSafeDecimal: GetSafeDecimal = (value) => {
//   const num = parseFloat(value as string);
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

// const PatientBilling = ({
//   newPatient,
//   handleChange,
//   selectedPackages,
//   isGlobalDiscountHidden,
// }: PatientBillingProps) => {
//   const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
//   const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);

//   const discountPercentage = totalAmount.gt(0)
//     ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
//     : '0.00';

//   const handleDiscountChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const { name, value } = e.target;
//     const total = totalAmount;
//     let inputVal = getSafeDecimal(value);

//     if (name === 'visit.billing.discountPercentage') {
//       // Cap percentage to 100
//       if (inputVal.gt(100)) inputVal = new Decimal(100);

//       const fixedDiscount = total
//         .mul(inputVal)
//         .div(100)
//         .toDecimalPlaces(2);

//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       // Cap discount to total amount
//       if (inputVal.gt(total)) inputVal = total;

//       const percentage = total.gt(0)
//         ? inputVal.div(total).mul(100).toDecimalPlaces(2)
//         : new Decimal(0);

//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   const canEditDiscount =
//     selectedPackages.length === 0 && !isGlobalDiscountHidden;
//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         <div className="flex flex-wrap gap-5 items-end">
//           {canEditDiscount && (
//             <>
//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                   Discount (%)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discountPercentage"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={discountPercentage || ''}
//                   placeholder="0.00"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   Discount in ₹
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discount"
//                   min="0"
//                   max={totalAmount.toNumber()}
//                   step="0.01"
//                   value={discount.toString()}
//                   placeholder="0.00"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex flex-col min-w-[160px]">
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
//               {/* <option value="">Select reason</option> */}
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">
//               Total Amount
//             </p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{totalAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹
//                 {canEditDiscount
//                   ? totalAmount.sub(discount).toFixed(2)
//                   : newPatient.visit?.billing.netAmount}
//               </p>
//             </div>
//           </div>
//         </div>

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
//                   {status}
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
//                   {method}
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
//               disabled
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PatientBilling;




//=================================================

// import { Patient, PaymentMethod, PaymentStatus, } from '@/types/patient/patient';
// import React from 'react';
// import {
//   FaCalendarAlt,
//   FaCreditCard,
//   FaInfoCircle,
//   FaMoneyBillWave,
//   FaPercent,
// } from 'react-icons/fa';
// import { Package } from '@/types/package/package';
// import Decimal from 'decimal.js';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// enum DiscountReason {
//   None = 'None',
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

// interface GetSafeDecimal {
//   (value: number | string | undefined | null): Decimal;
// }

// const getSafeDecimal: GetSafeDecimal = (value) => {
//   const num = parseFloat(value as string);
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

// const PatientBilling = ({
//   newPatient,
//   handleChange,
//   selectedPackages,
//   isGlobalDiscountHidden,
// }: PatientBillingProps) => {
//   const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
//   const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);

//   const discountPercentage = totalAmount.gt(0)
//     ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
//     : '0.00';

//   const handleDiscountChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const { name, value } = e.target;
//     const total = totalAmount;
//     let inputVal = getSafeDecimal(value);

//     if (name === 'visit.billing.discountPercentage') {
//       // Cap percentage to 100
//       if (inputVal.gt(100)) inputVal = new Decimal(100);

//       const fixedDiscount = total
//         .mul(inputVal)
//         .div(100)
//         .toDecimalPlaces(2);

//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       // Cap discount to total amount
//       if (inputVal.gt(total)) inputVal = total;

//       const percentage = total.gt(0)
//         ? inputVal.div(total).mul(100).toDecimalPlaces(2)
//         : new Decimal(0);

//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   const canEditDiscount =
//     selectedPackages.length === 0 && !isGlobalDiscountHidden;
//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         <div className="flex flex-wrap gap-5 items-end">
//           {canEditDiscount && (
//             <>
//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                   Discount (%)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discountPercentage"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={discountPercentage || ''}
//                   placeholder="0.00"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   Discount in ₹
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discount"
//                   min="0"
//                   max={totalAmount.toNumber()}
//                   step="0.01"
//                   value={discount.toString()}
//                   placeholder="0.00"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex flex-col min-w-[160px]">
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
//               {/* <option value="">Select reason</option> */}
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">
//               Total Amount
//             </p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{totalAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹
//                 {canEditDiscount
//                   ? totalAmount.sub(discount).toFixed(2)
//                   : newPatient.visit?.billing.netAmount}
//               </p>
//             </div>
//           </div>
//         </div>

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
//                   {status}
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
//                   {method}
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
//               disabled
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PatientBilling;




//=======================================================================================================================================


// import { Patient, PaymentMethod, PaymentStatus, DiscountReason } from '@/types/patient/patient';
// import React, { useEffect } from 'react';
// import {
//   FaCalendarAlt,
//   FaCreditCard,
//   FaInfoCircle,
//   FaMoneyBillWave,
//   FaPercent,
// } from 'react-icons/fa';
// import { Package } from '@/types/package/package';
// import Decimal from 'decimal.js';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// interface GetSafeDecimal {
//   (value: number | string | undefined | null): Decimal;
// }

// const getSafeDecimal: GetSafeDecimal = (value) => {
//   const num = parseFloat(value as string);
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

// // Helper function to format amount without .00 for whole numbers
// const formatAmount = (value: string | number | undefined) => {
//   if (value === undefined || value === null || value === '') return '';
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   if (isNaN(num)) return '';
//   return num % 1 === 0 ? num.toString() : num.toFixed(2);
// };

// const PatientBilling = ({
//   newPatient,
//   handleChange,
//   selectedPackages,
//   isGlobalDiscountHidden,
// }: PatientBillingProps) => {
//   const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
//   const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);
//   const netAmount = totalAmount.sub(discount);
//   const paymentMethod = newPatient?.visit?.billing?.paymentMethod;

//   const discountPercentage = totalAmount.gt(0)
//     ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
//     : '0.00';

//   const handleDiscountChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const { name, value } = e.target;
//     const total = totalAmount;
//     let inputVal = getSafeDecimal(value);

//     if (name === 'visit.billing.discountPercentage') {
//       if (inputVal.gt(100)) inputVal = new Decimal(100);

//       const fixedDiscount = total
//         .mul(inputVal)
//         .div(100)
//         .toDecimalPlaces(2);

//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       if (inputVal.gt(total)) inputVal = total;

//       const percentage = total.gt(0)
//         ? inputVal.div(total).mul(100).toDecimalPlaces(2)
//         : new Decimal(0);

//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const numValue = parseFloat(value) || 0;

//     handleChange(e);

//     // For Cash payment method only
//     if (paymentMethod === PaymentMethod.CASH) {
//       if (name === 'visit.billing.recived_Amount') {
//         if (value === '' || isNaN(numValue)) {
//           // Clear both received and balance amounts if received amount is empty
//           handleChange({
//             target: {
//               name: 'visit.billing.recived_Amount',
//               value: '',
//             },
//           } as React.ChangeEvent<HTMLInputElement>);
//           handleChange({
//             target: {
//               name: 'visit.billing.balance_Amount',
//               value: '',
//             },
//           } as React.ChangeEvent<HTMLInputElement>);
//         } else {
//           // Calculate balance only for Cash payment method
//           const balance = numValue - netAmount.toNumber();
//           handleChange({
//             target: {
//               name: 'visit.billing.balance_Amount',
//               value: formatAmount(balance),
//             },
//           } as React.ChangeEvent<HTMLInputElement>);
//         }
//       }
//     }

//     // For Card payment method - auto-populate received amount with net amount
//     if (paymentMethod === PaymentMethod.CARD) {
//       handleChange({
//         target: {
//           name: 'visit.billing.recived_Amount',
//           value: formatAmount(netAmount.toNumber()),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     // For UPI payment method - auto-populate received amount with UPI amount
//     if (paymentMethod === PaymentMethod.UPI) {
//       if (name === 'visit.billing.Upi_Amout') {
//         handleChange({
//           target: {
//             name: 'visit.billing.recived_Amount',
//             value: formatAmount(value),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }
//     }

//     // For UPI + Cash payment method - FIXED VERSION
//     if (paymentMethod === PaymentMethod.UPI_CASH) {
//       const upiAmount = getSafeDecimal(newPatient?.visit?.billing?.Upi_Amout);
//       const cashAmount = getSafeDecimal(newPatient?.visit?.billing?.Cash_Amount);

//       // When UPI amount changes
//       if (name === 'visit.billing.Upi_Amout') {
//         const remainingCash = netAmount.sub(upiAmount);
//         // Ensure cash amount is not negative
//         const newCashAmount = Math.max(0, remainingCash.toNumber());
//         handleChange({
//           target: {
//             name: 'visit.billing.Cash_Amount',
//             value: formatAmount(newCashAmount),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }

//       // When Cash amount changes
//       if (name === 'visit.billing.Cash_Amount') {
//         const remainingUPI = netAmount.sub(cashAmount);
//         // Ensure UPI amount is not negative
//         const newUPIAmount = Math.max(0, remainingUPI.toNumber());
//         handleChange({
//           target: {
//             name: 'visit.billing.Upi_Amout',
//             value: formatAmount(newUPIAmount),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }

//       // Always update received amount with the sum of UPI and Cash
//       const currentUPI = getSafeDecimal(newPatient?.visit?.billing?.Upi_Amout);
//       const currentCash = getSafeDecimal(newPatient?.visit?.billing?.Cash_Amount);
//       const totalReceived = currentUPI.add(currentCash);

//       handleChange({
//         target: {
//           name: 'visit.billing.recived_Amount',
//           value: formatAmount(totalReceived.toNumber()),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   useEffect(() => {
//     // Reset payment fields when payment method changes
//     if (paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.CARD) {
//       handleChange({
//         target: {
//           name: 'visit.billing.Upi_id',
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({
//         target: {
//           name: 'visit.billing.Upi_Amout',
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({
//         target: {
//           name: 'visit.billing.Cash_Amount',
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       // For Card, auto-populate received amount with net amount
//       if (paymentMethod === PaymentMethod.CARD) {
//         handleChange({
//           target: {
//             name: 'visit.billing.recived_Amount',
//             value: formatAmount(netAmount.toNumber()),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }
//     }

//     if (paymentMethod === PaymentMethod.UPI) {
//       handleChange({
//         target: {
//           name: 'visit.billing.Cash_Amount',
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//       // Auto-populate UPI amount with net amount if empty
//       if (!newPatient?.visit?.billing?.Upi_Amout) {
//         handleChange({
//           target: {
//             name: 'visit.billing.Upi_Amout',
//             value: formatAmount(netAmount.toNumber()),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }
//       // Auto-populate received amount with UPI amount
//       handleChange({
//         target: {
//           name: 'visit.billing.recived_Amount',
//           value: formatAmount(newPatient?.visit?.billing?.Upi_Amout || netAmount.toNumber()),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (paymentMethod === PaymentMethod.UPI_CASH) {
//       // Initialize UPI and Cash amounts if empty
//       if (!newPatient?.visit?.billing?.Upi_Amout && !newPatient?.visit?.billing?.Cash_Amount) {
//         handleChange({
//           target: {
//             name: 'visit.billing.Upi_Amout',
//             value: formatAmount(netAmount.toNumber()),
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//         handleChange({
//           target: {
//             name: 'visit.billing.Cash_Amount',
//             value: '0',
//           },
//         } as React.ChangeEvent<HTMLInputElement>);
//       }

//       // Calculate current values (using current state rather than newPatient to avoid stale data)
//       const currentUPI = getSafeDecimal(newPatient?.visit?.billing?.Upi_Amout);
//       const currentCash = getSafeDecimal(newPatient?.visit?.billing?.Cash_Amount);
//       const totalReceived = currentUPI.add(currentCash);

//       // Update received amount
//       handleChange({
//         target: {
//           name: 'visit.billing.recived_Amount',
//           value: formatAmount(totalReceived.toNumber()),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   }, [paymentMethod, handleChange, netAmount, newPatient?.visit?.billing?.Upi_Amout, newPatient?.visit?.billing?.Cash_Amount]);

//   const canEditDiscount =
//     selectedPackages.length === 0 && !isGlobalDiscountHidden;

//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         <div className="flex flex-wrap gap-5 items-end">
//           {canEditDiscount && (
//             <>
//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                   Discount (%)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discountPercentage"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={discountPercentage || ''}
//                   placeholder="0"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   Discount in ₹
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discount"
//                   min="0"
//                   max={totalAmount.toNumber()}
//                   step="0.01"
//                   value={discount.toString()}
//                   placeholder="0"
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex flex-col min-w-[160px]">
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
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">
//               Total Amount
//             </p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{totalAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹
//                 {canEditDiscount
//                   ? netAmount.toFixed(2)
//                   : newPatient.visit?.billing.netAmount}
//               </p>
//             </div>
//           </div>
//         </div>

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
//                   {status}
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
//                   {method}
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
//               disabled
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Payment Details Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI ID
//               </label>
//               <input
//                 type="text"
//                 name="visit.billing.Upi_id"
//                 value={newPatient.visit?.billing?.Upi_id ?? ''}
//                 onChange={handleChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 placeholder="Enter UPI ID"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.Upi_Amout"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.Upi_Amout ?? undefined)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 placeholder="0"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI_CASH && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   UPI Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.Upi_Amout"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.Upi_Amout ?? undefined)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="0"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Cash Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.Cash_Amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.Cash_Amount ?? undefined)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="0"
//                 />
//               </div>
//             </>
//           )}

//           {(paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Received Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.recived_Amount"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.recived_Amount ?? undefined)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 placeholder="0"
//               />
//             </div>
//           )}

//           {/* Show balance amount only for CASH payment method */}
//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Refund Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.balance_Amount"
//                 min={0}
//                 disabled
//                 value={formatAmount(newPatient.visit?.billing?.Refend_Amount ?? undefined)}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
//                 placeholder="0"
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PatientBilling;










// import {
//   Patient,
//   PaymentMethod,
//   PaymentStatus,
//   DiscountReason,
// } from '@/types/patient/patient';
// import React, { useEffect } from 'react';
// import {
//   FaCalendarAlt,
//   FaCreditCard,
//   FaInfoCircle,
//   FaMoneyBillWave,
//   FaPercent,
// } from 'react-icons/fa';
// import { Package } from '@/types/package/package';
// import Decimal from 'decimal.js';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// interface GetSafeDecimal {
//   (value: number | string | undefined | null): Decimal;
// }

// const getSafeDecimal: GetSafeDecimal = (value) => {
//   if (value === undefined || value === null || value === '') return new Decimal(0);
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

// const formatAmount = (value: string | number | undefined | null): string => {
//   if (value === undefined || value === null || value === '') return '';
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   if (isNaN(num)) return '';
//   return num % 1 === 0 ? num.toString() : num.toFixed(2);
// };

// const calculatePaymentStatus = (received: Decimal, net: Decimal): PaymentStatus => {
//   return received.gte(net) ? PaymentStatus.PAID : PaymentStatus.DUE;
// };

// const calculateRefundDueAmounts = (received: Decimal, net: Decimal) => {
//   if (received.gte(net)) {
//     return {
//       refund: received.sub(net),
//       due: new Decimal(0),
//     };
//   }
//   return {
//     refund: new Decimal(0),
//     due: net.sub(received),
//   };
// };

// const PatientBilling = ({
//   newPatient,
//   handleChange,
//   selectedPackages,
//   isGlobalDiscountHidden,
// }: PatientBillingProps) => {
//   const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
//   const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);
//   const netAmount = totalAmount.sub(discount);
//   const paymentMethod = newPatient?.visit?.billing?.paymentMethod;

//   const discountPercentage = totalAmount.gt(0)
//     ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
//     : '0';

//   const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const total = totalAmount;
//     let inputVal = getSafeDecimal(value);

//     if (name === 'visit.billing.discountPercentage') {
//       if (inputVal.gt(100)) inputVal = new Decimal(100);
//       if (inputVal.lt(0)) inputVal = new Decimal(0);

//       const fixedDiscount = total.mul(inputVal).div(100).toDecimalPlaces(2);

//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       if (inputVal.gt(total)) inputVal = total;
//       if (inputVal.lt(0)) inputVal = new Decimal(0);

//       const percentage = total.gt(0)
//         ? inputVal.div(total).mul(100).toDecimalPlaces(2)
//         : new Decimal(0);

//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     if (paymentMethod === PaymentMethod.CASH && name === 'visit.billing.received_amount') {
//       const receivedAmount = getSafeDecimal(value);

//       handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.cash_amount', value } } as React.ChangeEvent<HTMLInputElement>);

//       const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
//       const status = calculatePaymentStatus(receivedAmount, netAmount);

//       handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);

//       return;
//     }

//     handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
//   };

//   useEffect(() => {
//     if (!paymentMethod) return;
//     const fieldsToReset = [
//       'visit.billing.upi_id',
//       'visit.billing.upi_amount',
//       'visit.billing.cash_amount',
//       'visit.billing.card_amount',
//       'visit.billing.received_amount',
//       'visit.billing.refund_amount',
//       'visit.billing.due_amount',
//     ];

//     fieldsToReset.forEach((field) => {
//       handleChange({
//         target: {
//           name: field,
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     });
//   }, [paymentMethod]);

//   const canEditDiscount = selectedPackages.length === 0 && !isGlobalDiscountHidden;
//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         <div className="flex flex-wrap gap-5 items-end">
//           {canEditDiscount && (
//             <>
//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                   Discount (%)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discountPercentage"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={discountPercentage}
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   Discount in ₹
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discount"
//                   min="0"
//                   max={totalAmount.toNumber()}
//                   step="0.01"
//                   value={formatAmount(discount.toNumber())}
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex flex-col min-w-[160px]">
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
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">
//               Total Amount
//             </p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{totalAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{netAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>
//         </div>

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
//                   {status}
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
//               {Object.values(PaymentMethod).map((method) => (
//                 <option key={method} value={method}>
//                   {method}
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
//               disabled
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Payment Details Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI ID
//               </label>
//               <input
//                 type="text"
//                 name="visit.billing.upi_id"
//                 value={newPatient.visit?.billing?.upi_id ?? ''}
//                 onChange={handleChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 placeholder="Enter UPI ID"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Received Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.received_amount"
//                 min="0"
//                 step="0.01"
//                 value={newPatient.visit?.billing?.received_amount || ''}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Cash Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.cash_amount"
//                 min="0"
//                 step="0.01"
//                 disabled
//                 value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CARD && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Card Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.card_amount"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.card_amount)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.upi_amount"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.upi_amount)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI_CASH && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   UPI Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.upi_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.upi_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Cash Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.cash_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           {paymentMethod === PaymentMethod.CARD_CASH && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Card Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.card_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.card_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Cash Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.cash_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 {getSafeDecimal(newPatient.visit?.billing?.refund_amount).gt(0) ? 'Refund Amount' : 'Due Amount'} (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.refund_amount"
//                 min="0"
//                 disabled
//                 value={formatAmount(
//                   getSafeDecimal(newPatient.visit?.billing?.refund_amount).gt(0)
//                     ? newPatient.visit?.billing?.refund_amount
//                     : newPatient.visit?.billing?.due_amount
//                 )}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PatientBilling;



//================


// import {
//   Patient,
//   PaymentMethod,
//   PaymentStatus,
//   DiscountReason,
// } from '@/types/patient/patient';
// import React, { useEffect } from 'react';
// import {
//   FaCalendarAlt,
//   FaCreditCard,
//   FaInfoCircle,
//   FaMoneyBillWave,
//   FaPercent,
// } from 'react-icons/fa';
// import { Package } from '@/types/package/package';
// import Decimal from 'decimal.js';

// interface PatientBillingProps {
//   newPatient: Patient;
//   handleChange: (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => void;
//   selectedPackages: Package[];
//   isGlobalDiscountHidden?: boolean;
// }

// interface GetSafeDecimal {
//   (value: number | string | undefined | null): Decimal;
// }

// const getSafeDecimal: GetSafeDecimal = (value) => {
//   if (value === undefined || value === null || value === '') return new Decimal(0);
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   return !isNaN(num) ? new Decimal(num) : new Decimal(0);
// };

// const formatAmount = (value: string | number | undefined | null): string => {
//   if (value === undefined || value === null || value === '') return '';
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   if (isNaN(num)) return '';
//   return num % 1 === 0 ? num.toString() : num.toFixed(2);
// };

// const calculatePaymentStatus = (received: Decimal, net: Decimal): PaymentStatus => {
//   return received.gte(net) ? PaymentStatus.PAID : PaymentStatus.DUE;
// };

// const calculateRefundDueAmounts = (received: Decimal, net: Decimal) => {
//   if (received.gte(net)) {
//     return {
//       refund: received.sub(net),
//       due: new Decimal(0),
//     };
//   }
//   return {
//     refund: new Decimal(0),
//     due: net.sub(received),
//   };
// };

// const PatientBilling = ({
//   newPatient,
//   handleChange,
//   selectedPackages,
//   isGlobalDiscountHidden,
// }: PatientBillingProps) => {
//   const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
//   const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);
//   const netAmount = totalAmount.sub(discount);
//   const paymentMethod = newPatient?.visit?.billing?.paymentMethod;

//   const discountPercentage = totalAmount.gt(0)
//     ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
//     : '0';

//   const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const total = totalAmount;
//     let inputVal = getSafeDecimal(value);

//     if (name === 'visit.billing.discountPercentage') {
//       if (inputVal.gt(100)) inputVal = new Decimal(100);
//       if (inputVal.lt(0)) inputVal = new Decimal(0);

//       const fixedDiscount = total.mul(inputVal).div(100).toDecimalPlaces(2);

//       handleChange({
//         target: {
//           name: 'visit.billing.discount',
//           value: fixedDiscount.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }

//     if (name === 'visit.billing.discount') {
//       if (inputVal.gt(total)) inputVal = total;
//       if (inputVal.lt(0)) inputVal = new Decimal(0);

//       const percentage = total.gt(0)
//         ? inputVal.div(total).mul(100).toDecimalPlaces(2)
//         : new Decimal(0);

//       handleChange({
//         target: {
//           name: 'visit.billing.discountPercentage',
//           value: percentage.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);

//       handleChange({
//         target: {
//           name,
//           value: inputVal.toString(),
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     }
//   };

//   const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     if (paymentMethod === PaymentMethod.CASH && name === 'visit.billing.received_amount') {
//       const receivedAmount = getSafeDecimal(value);

//       handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.cash_amount', value } } as React.ChangeEvent<HTMLInputElement>);

//       const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
//       const status = calculatePaymentStatus(receivedAmount, netAmount);

//       handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
//       handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);

//       return;
//     }

//     handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
//   };

//   useEffect(() => {
//     if (!paymentMethod) return;
//     const fieldsToReset = [
//       'visit.billing.upi_id',
//       'visit.billing.upi_amount',
//       'visit.billing.cash_amount',
//       'visit.billing.card_amount',
//       'visit.billing.received_amount',
//       'visit.billing.refund_amount',
//       'visit.billing.due_amount',
//     ];

//     fieldsToReset.forEach((field) => {
//       handleChange({
//         target: {
//           name: field,
//           value: '',
//         },
//       } as React.ChangeEvent<HTMLInputElement>);
//     });
//   }, [paymentMethod]);

//   const canEditDiscount = selectedPackages.length === 0 && !isGlobalDiscountHidden;
//   return (
//     <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
//       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//         <h2 className="text-sm font-medium text-gray-800 flex items-center">
//           <FaMoneyBillWave className="mr-2 text-purple-500 text-sm" />
//           Billing Details
//         </h2>
//       </div>

//       <div className="p-4 space-y-4">
//         <div className="flex flex-wrap gap-5 items-end">
//           {canEditDiscount && (
//             <>
//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   <FaPercent className="mr-1.5 text-purple-500 text-xs" />
//                   Discount (%)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discountPercentage"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={discountPercentage}
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex flex-col min-w-[100px]">
//                 <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//                   Discount in ₹
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.discount"
//                   min="0"
//                   max={totalAmount.toNumber()}
//                   step="0.01"
//                   value={formatAmount(discount.toNumber())}
//                   onChange={handleDiscountChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex flex-col min-w-[160px]">
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
//               {Object.values(DiscountReason).map((reason) => (
//                 <option key={reason} value={reason}>
//                   {reason}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col min-w-[160px]">
//             <p className="text-xs font-medium text-gray-500 mb-1">
//               Total Amount
//             </p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{totalAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col min-w-auto">
//             <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
//             <div className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 h-[38px] flex items-center">
//               <p className="text-sm font-semibold text-gray-800">
//                 ₹{netAmount.toFixed(2)}
//               </p>
//             </div>
//           </div>
//         </div>

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
//                   {status}
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
//               {Object.values(PaymentMethod).map((method) => (
//                 <option key={method} value={method}>
//                   {method}
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
//               disabled
//               name="visit.billing.paymentDate"
//               value={newPatient.visit?.billing.paymentDate ?? ''}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Payment Details Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI ID
//               </label>
//               <input
//                 type="text"
//                 name="visit.billing.upi_id"
//                 value={newPatient.visit?.billing?.upi_id ?? ''}
//                 onChange={handleChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 placeholder="Enter UPI ID"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Received Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.received_amount"
//                 min="0"
//                 step="0.01"
//                 value={newPatient.visit?.billing?.received_amount || ''}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Cash Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.cash_amount"
//                 min="0"
//                 step="0.01"
//                 disabled
//                 value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.CARD && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 Card Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.card_amount"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.card_amount)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 UPI Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.upi_amount"
//                 min="0"
//                 step="0.01"
//                 value={formatAmount(newPatient.visit?.billing?.upi_amount)}
//                 onChange={handlePaymentFieldChange}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {paymentMethod === PaymentMethod.UPI_CASH && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   UPI Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.upi_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.upi_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Cash Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.cash_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           {paymentMethod === PaymentMethod.CARD_CASH && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Card Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.card_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.card_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-xs font-medium text-gray-600 mb-1">
//                   Cash Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   name="visit.billing.cash_amount"
//                   min="0"
//                   step="0.01"
//                   value={formatAmount(newPatient.visit?.billing?.cash_amount)}
//                   onChange={handlePaymentFieldChange}
//                   className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           {paymentMethod === PaymentMethod.CASH && (
//             <div className="flex flex-col">
//               <label className="text-xs font-medium text-gray-600 mb-1">
//                 {getSafeDecimal(newPatient.visit?.billing?.refund_amount).gt(0) ? 'Refund Amount' : 'Due Amount'} (₹)
//               </label>
//               <input
//                 type="number"
//                 name="visit.billing.refund_amount"
//                 min="0"
//                 disabled
//                 value={formatAmount(
//                   getSafeDecimal(newPatient.visit?.billing?.refund_amount).gt(0)
//                     ? newPatient.visit?.billing?.refund_amount
//                     : newPatient.visit?.billing?.due_amount
//                 )}
//                 className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PatientBilling;

//-----------------------------------------new code after cash 

import {
  Patient,
  PaymentMethod,
  PaymentStatus,
  DiscountReason,
} from '@/types/patient/patient';
import React, { useEffect } from 'react';
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
  isGlobalDiscountHidden,
}: PatientBillingProps) => {
  const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
  const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);
  const netAmount = totalAmount.sub(discount);
  const paymentMethod = newPatient?.visit?.billing?.paymentMethod;

  const discountPercentage = totalAmount.gt(0)
    ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
    : '0';

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const total = totalAmount;
    let inputVal = getSafeDecimal(value);

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

  const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const receivedAmount = getSafeDecimal(value);

    // For CASH payment method (keep exactly as is)
    if (paymentMethod === PaymentMethod.CASH && name === 'visit.billing.received_amount') {
      handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.cash_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      const status = calculatePaymentStatus(receivedAmount, netAmount);

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For CARD payment method (received amount → card amount)
    if (paymentMethod === PaymentMethod.CARD && name === 'visit.billing.received_amount') {
      handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.card_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      const status = calculatePaymentStatus(receivedAmount, netAmount);

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For UPI payment method (received amount → upi amount)
    if (paymentMethod === PaymentMethod.UPI && name === 'visit.billing.received_amount') {
      handleChange({ target: { name: 'visit.billing.received_amount', value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.upi_amount', value } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(receivedAmount, netAmount);
      const status = calculatePaymentStatus(receivedAmount, netAmount);

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For UPI_CASH payment method (sum amounts → received amount)
    if (paymentMethod === PaymentMethod.UPI_CASH && 
        (name === 'visit.billing.upi_amount' || name === 'visit.billing.cash_amount')) {
      const upiAmount = getSafeDecimal(name === 'visit.billing.upi_amount' ? value : newPatient.visit?.billing?.upi_amount);
      const cashAmount = getSafeDecimal(name === 'visit.billing.cash_amount' ? value : newPatient.visit?.billing?.cash_amount);
      const totalReceived = upiAmount.add(cashAmount);

      handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.received_amount', value: totalReceived.toString() } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(totalReceived, netAmount);
      const status = calculatePaymentStatus(totalReceived, netAmount);

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // For CARD_CASH payment method (sum amounts → received amount)
    if (paymentMethod === PaymentMethod.CARD_CASH && 
        (name === 'visit.billing.card_amount' || name === 'visit.billing.cash_amount')) {
      const cardAmount = getSafeDecimal(name === 'visit.billing.card_amount' ? value : newPatient.visit?.billing?.card_amount);
      const cashAmount = getSafeDecimal(name === 'visit.billing.cash_amount' ? value : newPatient.visit?.billing?.cash_amount);
      const totalReceived = cardAmount.add(cashAmount);

      handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.received_amount', value: totalReceived.toString() } } as React.ChangeEvent<HTMLInputElement>);

      const { refund, due } = calculateRefundDueAmounts(totalReceived, netAmount);
      const status = calculatePaymentStatus(totalReceived, netAmount);

      handleChange({ target: { name: 'visit.billing.refund_amount', value: refund.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.due_amount', value: due.toString() } } as React.ChangeEvent<HTMLInputElement>);
      handleChange({ target: { name: 'visit.billing.paymentStatus', value: status } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // Default case for other fields
    handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
  };

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
  }, [paymentMethod]);

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
  const { refund, due } = calculateRefundDueAmounts(totalReceived, netAmount);

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
                  value={formatAmount(discount.toNumber())}
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
              className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.UPI_CASH) && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                name="visit.billing.upi_id"
                value={newPatient.visit?.billing?.upi_id ?? ''}
                onChange={handleChange}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter UPI ID"
              />
            </div>
          )}

          {/* Received Amount - Show for all payment methods except UPI+CASH and CARD+CASH */}
          {(paymentMethod !== PaymentMethod.UPI_CASH && paymentMethod !== PaymentMethod.CARD_CASH) && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Received Amount (₹)
              </label>
              <input
                type="number"
                name="visit.billing.received_amount"
                min="0"
                step="0.01"
                value={newPatient.visit?.billing?.received_amount || ''}
                onChange={handlePaymentFieldChange}
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
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
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
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
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
              />
            </div>
          )}

          {paymentMethod === PaymentMethod.UPI_CASH && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  UPI Amount (₹)
                </label>
                <input
                  type="number"
                  name="visit.billing.upi_amount"
                  min="0"
                  step="0.01"
                  value={formatAmount(newPatient.visit?.billing?.upi_amount)}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Cash Amount (₹)
                </label>
                <input
                  type="number"
                  name="visit.billing.cash_amount"
                  min="0"
                  step="0.01"
                  value={formatAmount(newPatient.visit?.billing?.cash_amount)}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {paymentMethod === PaymentMethod.CARD_CASH && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Card Amount (₹)
                </label>
                <input
                  type="number"
                  name="visit.billing.card_amount"
                  min="0"
                  step="0.01"
                  value={formatAmount(newPatient.visit?.billing?.card_amount)}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Cash Amount (₹)
                </label>
                <input
                  type="number"
                  name="visit.billing.cash_amount"
                  min="0"
                  step="0.01"
                  value={formatAmount(newPatient.visit?.billing?.cash_amount)}
                  onChange={handlePaymentFieldChange}
                  className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
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
                className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full bg-gray-50"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatientBilling;