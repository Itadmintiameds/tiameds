'use client'
import React, { useState } from 'react'
import Button from '../../_component/Button'
import { CheckIcon, Circle, CircleXIcon, Package } from 'lucide-react'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'
import TestOrders from './_component/TestOrders'
import PackageOrder from './_component/PackageOrder'
import TestTab from './_component/TestTab'

const page = () => {


    return (
        <>
            <div className="container mx-auto p-4">
                {/* this is heading */}
                <div>
                    <h1 className="text-xl font-bold mb-4 text-zinc-900 font-semibold">New Last Test Bill</h1>
                </div>

                {/* 1st section where patient and doctor details  */}
                <div className='flex justify-between gap-4'>
                    {/*------------- Patient Details ---------------------------------- */}
                    <section className='w-1/2 border rounded-md border-gray-300 p-6 shadow-md'>
                        <h2 className="text-xs font-bold mb-2 text-gray-800">Patient Details</h2>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Mobile Number</label>
                                <input type='tel' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter mobile number' />
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Patient Type</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>IP</option>
                                    <option>OP</option>
                                </select>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Patient Name</label>
                                <div className='flex'>
                                    <select className='border rounded-md border-gray-300 p-2 mr-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                        <option>MR</option>
                                        <option>MS</option>
                                        <option>MRS</option>
                                    </select>
                                    <input type='text' className='border rounded-md border-gray-300 p-2 flex-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter name' />
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Gender</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Email</label>
                                <input type='email' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter email' />
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Age</label>
                                <div className='flex space-x-2'>
                                    <input type='number' className='border rounded-md border-gray-300 p-2 flex-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Years' />
                                    <input type='number' className='border w-20 rounded-md border-gray-300 p-2 flex-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Months' />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*------------- Lab & Reference Details ---------------------------------- */}
                    <section className='w-1/2 border rounded-md border-gray-300 p-6 shadow-md'>
                        <h2 className="text-xs font-bold mb-2 text-gray-800">Lab & Reference Details</h2>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Doctor Refer</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>Dr. A</option>
                                    <option>Dr. B</option>
                                    <option>Dr. C</option>
                                </select>
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Hospital Referred</label>
                                <input type='text' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter hospital name' />
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Lab Name</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>Lab A</option>
                                    <option>Lab B</option>
                                    <option>Lab C</option>
                                </select>
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Lab No</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                </select>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-4'>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Insurance</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>Insurance A</option>
                                    <option>Insurance B</option>
                                    <option>Insurance C</option>
                                    <option>Insurance D</option>
                                </select>
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xs font-semibold mb-1 text-gray-700'>Package</label>
                                <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                    <option>Package A</option>
                                    <option>Package B</option>
                                    <option>Package C</option>
                                    <option>Package D</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                <TestTab />

                {/* 3rd section where payment details  */}
                <section className='flex justify-between space-x-4'>
                    {/* Payment Details */}
                    <section className='border rounded-md border-zinc-200 p-4 mt-4 w-1/2 shadow-md'>
                        <h2 className="text-xs font-bold mb-4 text-zinc-900">Payment Details</h2>
                        <div className='flex justify-between'>
                            <div className='flex flex-col w-1/2 pr-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Payment Type</label>
                                <select className='border rounded-sm border-zinc-200 p-2 text-xs'>
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>Online</option>
                                </select>
                            </div>
                            <div className='flex flex-col w-1/2 pl-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Discount %</label>
                                <input type='number' className='border rounded-sm border-zinc-200 p-2 text-xs' />
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <div className='flex flex-col w-1/2 pr-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Discount</label>
                                <input type='number' className='border rounded-sm border-zinc-200 p-2 text-xs' />
                            </div>
                            <div className='flex flex-col w-1/2 pl-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Reason for Discount</label>
                                <input type='text' className='border rounded-sm border-zinc-200 p-2 text-xs' />
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <div className='flex flex-col w-1/2 pr-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Amount Received</label>
                                <input type='number' className='border rounded-sm border-zinc-200 p-2 text-xs' />
                            </div>
                            <div className='flex flex-col w-1/2 pl-2'>
                                <label className='text-xs font-bold mb-2 text-zinc-900'>Returned Amount</label>
                                <input type='number' className='border rounded-sm border-zinc-200 p-2 text-xs' />
                            </div>
                        </div>
                    </section>

                    {/* Payment Summary */}
                    <section className='border rounded-md border-zinc-200 p-6 mt-4 w-1/2 shadow-md'>
                        <h2 className="text-sm font-semibold mb-6 text-zinc-900">Payment Summary</h2>
                        <div className='flex flex-col gap-4'>
                            <div className='flex justify-between items-center'>
                                <label className='text-sm font-medium text-zinc-700 w-1/2'>Total Amount</label>
                                <p className='text-sm font-bold text-zinc-900 w-1/2 text-right'>1000</p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <label className='text-sm font-medium text-zinc-700 w-1/2'>Discount</label>
                                <p className='text-sm font-bold text-zinc-900 w-1/2 text-right'>100</p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <label className='text-sm font-medium text-zinc-700 w-1/2'>GST</label>
                                <p className='text-sm font-bold text-zinc-900 w-1/2 text-right'>100</p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <label className='text-sm font-medium text-zinc-700 w-1/2'>Gross Amount</label>
                                <p className='text-sm font-bold text-zinc-900 w-1/2 text-right'>1000</p>
                            </div>
                            <div className='flex justify-between items-center border-t border-zinc-300 pt-4'>
                                <label className='text-sm font-semibold text-zinc-900 w-1/2'>Net Amount</label>
                                <p className='text-sm font-semibold text-zinc-900 w-1/2 text-right'>1000</p>
                            </div>
                        </div>
                    </section>
                </section>

                {/* button for submit and cancel  */}
                <div className='flex gap-2 mt-4 text-sm'>
                    <Button
                        text='Cancel'
                        onClick={() => console.log('cancel')}
                        className='bg-red-600 text-white p-2 rounded-md hover:bg-red-800'
                    >
                        <CircleXIcon size={16} />
                    </Button>
                    <Button
                        text='Submit'
                        onClick={() => console.log('submit')}
                        className='bg-green-600 text-white p-2 rounded-md hover:bg-green-800'
                    >
                        <CheckIcon size={16} />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default page
