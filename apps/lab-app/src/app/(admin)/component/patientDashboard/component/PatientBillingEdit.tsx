import { Patient, PaymentMethod, PaymentStatus } from '@/types/patient/patient';
import React from 'react';
import { FaCalendarAlt, FaCreditCard, FaInfoCircle, FaMoneyBillWave, FaPercent } from 'react-icons/fa';
import { Package } from '@/types/package/package';
import Decimal from 'decimal.js';

interface PatientBillingEditProps {
    newPatient: Patient;
    handleChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    selectedPackages: Package[];
    isGlobalDiscountHidden?: boolean;
}

enum DiscountReason {
    None = 'None',
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

interface GetSafeDecimal {
    (value: number | string | undefined | null): Decimal;
}

const getSafeDecimal: GetSafeDecimal = (value) => {
    const num = parseFloat(value as string);
    return !isNaN(num) ? new Decimal(num) : new Decimal(0);
};

const PatientBillingEdit = ({
    newPatient,
    handleChange,
    selectedPackages,
    isGlobalDiscountHidden,
}: PatientBillingEditProps) => {
    const totalAmount = getSafeDecimal(newPatient?.visit?.billing?.totalAmount);
    const discount = getSafeDecimal(newPatient?.visit?.billing?.discount);

    const discountPercentage = totalAmount.gt(0)
        ? discount.div(totalAmount).mul(100).toDecimalPlaces(2).toString()
        : '0.00';

    // const handleDiscountChange = (
    //     e: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //     const { name, value } = e.target;
    //     const total = totalAmount;
    //     let inputVal = getSafeDecimal(value);

    //     if (name === 'visit.billing.discountPercentage') {
    //         // Cap percentage to 100
    //         if (inputVal.gt(100)) inputVal = new Decimal(100);

    //         const fixedDiscount = total
    //             .mul(inputVal)
    //             .div(100)
    //             .toDecimalPlaces(2);

    //         handleChange({
    //             target: {
    //                 name: 'visit.billing.discount',
    //                 value: fixedDiscount.toString(),
    //             },
    //         } as React.ChangeEvent<HTMLInputElement>);

    //         handleChange({
    //             target: {
    //                 name,
    //                 value: inputVal.toString(),
    //             },
    //         } as React.ChangeEvent<HTMLInputElement>);
    //     }

    //     if (name === 'visit.billing.discount') {
    //         // Cap discount to total amount
    //         if (inputVal.gt(total)) inputVal = total;

    //         const percentage = total.gt(0)
    //             ? inputVal.div(total).mul(100).toDecimalPlaces(2)
    //             : new Decimal(0);

    //         handleChange({
    //             target: {
    //                 name: 'visit.billing.discountPercentage',
    //                 value: percentage.toString(),
    //             },
    //         } as React.ChangeEvent<HTMLInputElement>);

    //         handleChange({
    //             target: {
    //                 name,
    //                 value: inputVal.toString(),
    //             },
    //         } as React.ChangeEvent<HTMLInputElement>);
    //     }
    // };

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


    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'visit.billing.discountPercentage' || name === 'visit.billing.discount') {
            handleDiscountChange(e as React.ChangeEvent<HTMLInputElement>);
        } else {
            // For all other fields, pass through the value directly
            handleChange({
                target: {
                    name,
                    value: value, // Keep the original value without conversion
                },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const canEditDiscount =
        selectedPackages.length === 0 && !isGlobalDiscountHidden;


    console.log('Current discount reason:', newPatient.visit?.billing?.discountReason);


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
                            value={newPatient.visit?.billing?.discountReason || DiscountReason.None}
                            onChange={handleFieldChange}
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
                            value={newPatient.visit?.billing?.paymentStatus ?? PaymentStatus.PENDING}
                            onChange={handleFieldChange}
                            className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
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
                            value={newPatient.visit?.billing?.paymentMethod ?? PaymentMethod.CASH}
                            onChange={handleFieldChange}
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
                            onChange={handleFieldChange}
                            className="border rounded-md border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PatientBillingEdit;