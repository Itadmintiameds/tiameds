import React, { useState } from 'react';
import { FaPrint } from 'react-icons/fa';
import Pagination from '@/app/(admin)/component/common/Pagination';

interface IVisit {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    billing?: {
        totalAmount: number;
        paymentStatus: string;
        paymentMethod: string;
        paymentDate: string;
    };
}

interface PatientVisitDataProps {
    visits: IVisit[];
    handlePrint: () => void;
}

const PatientVisitData = ({ visits, handlePrint }: PatientVisitDataProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page, adjust as needed

    // Logic to calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visits.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(visits.length / itemsPerPage);

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <section>
            <h2 className="text-xl font-semibold mb-4">Patient Visits</h2>
            <table className="table-auto w-full border-collapse border border-gray-200 text-xs">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Visit ID</th>
                        <th className="border px-4 py-2">Visit Date</th>
                        <th className="border px-4 py-2">Visit Type</th>
                        <th className="border px-4 py-2">Visit Status</th>
                        <th className="border px-4 py-2">Visit Description</th>
                        <th className="border px-4 py-2">Total Amount</th>
                        <th className="border px-4 py-2">Payment Status</th>
                        <th className="border px-4 py-2">Payment Method</th>
                        <th className="border px-4 py-2">Payment Date</th>
                        <th className="border px-4 py-2">Actions</th> {/* Added Actions column */}
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((visit: IVisit) => (
                        <tr key={visit.visitId}>
                            <td className="border px-4 py-2">{visit.visitId}</td>
                            <td className="border px-4 py-2">{visit.visitDate}</td>
                            <td className="border px-4 py-2">{visit.visitType}</td>
                            <td className="border px-4 py-2">{visit.visitStatus}</td>
                            <td className="border px-4 py-2">{visit.visitDescription}</td>
                            <td className="border px-4 py-2">{visit.billing?.totalAmount}</td>
                            <td className="border px-4 py-2">{visit.billing?.paymentStatus}</td>
                            <td className="border px-4 py-2">{visit.billing?.paymentMethod}</td>
                            <td className="border px-4 py-2">{visit.billing?.paymentDate}</td>
                            <td className="border px-4 py-2">
                                {/* Print Button for each row */}
                                <button
                                    onClick={handlePrint}
                                    className="px-2 py-1 text-white bg-blue-500 rounded-md flex items-center justify-center"
                                >
                                    <FaPrint className="mr-1" />
                                    Print
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </section>
    );
};

export default PatientVisitData;
