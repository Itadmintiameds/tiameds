
'use client';
import Button from "../../../_component/Button";
import { Calendar1Icon, EclipseIcon, EllipsisVertical, EyeIcon, HashIcon, PencilIcon, PrinterCheck, Trash2Icon, User2Icon, UserCircle } from 'lucide-react';
import React from 'react';

const Page = () => {
  return (
    <>
      <section className="container mx-auto py-8 px-6">
        {/* Patient Details */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-lg">
          {/* Patient Name */}
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <User2Icon size={24} className="text-blue-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-gray-600">Patient Name</div> {/* Changed to text-xs */}
              <p className="text-xs font-medium text-gray-900">John Doe</p> {/* Changed to text-xs */}
            </div>
          </div>

          {/* Age */}
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Calendar1Icon size={24} className="text-yellow-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-gray-600">Age</div> {/* Changed to text-xs */}
              <p className="text-xs font-medium text-gray-900">25</p> {/* Changed to text-xs */}
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center space-x-4">
            <div className="bg-pink-100 p-2 rounded-full">
              <UserCircle size={24} className="text-pink-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-gray-600">Gender</div> {/* Changed to text-xs */}
              <p className="text-xs font-medium text-gray-900">Male</p> {/* Changed to text-xs */}
            </div>
          </div>

          {/* Patient Number */}
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <HashIcon size={24} className="text-purple-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-gray-600">Patient Number</div> {/* Changed to text-xs */}
              <p className="text-xs font-medium text-gray-900">123456789</p> {/* Changed to text-xs */}
            </div>
          </div>
        </section>

        {/* Test Details */}
        <section className="mt-2">
          <h1 className="text-xs font-bold text-gray-800 mb-2">Test Details</h1> {/* Changed to text-xs */}
          <table className="w-full text-left border-collapse bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-purple-900 text-xs font-semibold text-gray-100">
                <th className="px-4 py-3">Test Name</th>
                <th className="px-4 py-3">Sample</th>
                <th className="px-4 py-3">Report Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-1 text-gray-700 font-medium text-xs">Blood Test</td> {/* Changed to text-xs */}
                <td className="px-4 py-1 text-gray-600 text-xs">Blood Sample</td> {/* Changed to text-xs */}
                <td className="px-4 py-1">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Completed
                  </span>
                </td>
                <td className="px-4 py-1">
                  <EllipsisVertical size={18} className="text-gray-600" />
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-1 text-gray-700 font-medium text-xs">Urine Test</td> {/* Changed to text-xs */}
                <td className="px-4 py-1 text-gray-600 text-xs">Urine Sample</td> {/* Changed to text-xs */}
                <td className="px-4 py-1">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="px-4 py-1">
                  <EllipsisVertical size={18} className="text-gray-600" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Payment Summary */}
        <section className="mt-10 w-1/4 bg-gray-50 p-6 rounded-lg shadow-lg">
          <h1 className="text-xs font-bold text-gray-800 mb-6">Payment Summary</h1> {/* Changed to text-xs */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-medium text-gray-600">
              <h2>Payment Status</h2>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                Paid
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-600">
              <h2>Payment Mode</h2>
              <p className="text-gray-800 font-semibold text-xs">Cash</p> {/* Changed to text-xs */}
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-600">
              <h2>Transaction Number</h2>
              <p className="text-gray-800 font-semibold text-xs">123456789</p> {/* Changed to text-xs */}
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-600">
              <h2>Amount</h2>
              <p className="text-gray-800 font-semibold text-xs">₹10,000</p> {/* Changed to text-xs */}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex gap-4 mt-8">
          <Button text="Delete" onClick={() => alert('Deleted!')} className="bg-red-500 hover:bg-red-600 text-white text-xs"> 
            <Trash2Icon size={18} className="mr-2" />
          </Button>
          <Button text="Edit Order" onClick={() => alert('Edit Order!')} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"> 
            <PencilIcon size={18} className="mr-2" />
          </Button>
          <Button text="View Bill" onClick={() => alert('View Bill!')} className="bg-green-500 hover:bg-green-600 text-white text-xs"> 
            <EyeIcon size={18} className="mr-2" />
          </Button>
          <Button text="Print Bill" onClick={() => alert('Print Bill!')} className="bg-blue-500 hover:bg-blue-600 text-white text-xs"> 
            <PrinterCheck size={18} className="mr-2" />
          </Button>
        </section>
      </section>
    </>
  );
};

export default Page;
