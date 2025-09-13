import Loader from '@/app/(admin)/component/common/Loader';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import React, { useEffect, useState } from 'react';
import { getMembersOfLab } from '../../../../../../services/technicianServices';

interface Member {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    firstName: string;
    lastName: string;
    roles: string[];
}

interface Column {
    header: string;
    accessor: (member: Member) => React.ReactNode;
}

const ListOfActiveMemberOfLab = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const { currentLab } = useLabs();
    const [loading, setLoading] = useState(false);
    // const [editPopup, setEditPopup] = useState(false);
    // const [updateMember, setUpdateMember] = useState<Member | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // You can adjust this number
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentLab?.id !== undefined) {
                try {
                    setLoading(true);
                    const response = await getMembersOfLab(currentLab.id);
                    // Filter active members
                    const activeMembers = (response.data as Member[]).filter((member: Member) => member.enabled);
                    setMembers(activeMembers);
                    setTotalItems(activeMembers.length);
                } catch (error) {
                    // Handle members fetch error
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMembers();
    }, [currentLab]);

    // Calculate paginated data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = members.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns: Column[] = [
        { 
            header: 'ID', 
            accessor: (member) => <span className="font-medium text-gray-700">{member.id}</span> 
        },
        { 
            header: 'Username', 
            accessor: (member) => <span className="text-gray-800">{member.username}</span> 
        },
        { 
            header: 'Email', 
            accessor: (member) => <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a> 
        },
        { 
            header: 'First Name', 
            accessor: (member) => <span className="text-gray-800">{member.firstName}</span> 
        },
        { 
            header: 'Last Name', 
            accessor: (member) => <span className="text-gray-800">{member.lastName}</span> 
        },
        {
            header: 'Status',
            accessor: (member) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {member.enabled ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            header: 'Roles',
            accessor: (member) => (
                <div className="flex flex-wrap gap-1">
                    {member.roles.map((role, index) => (
                        <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <section className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lab Members</h2>
                {currentLab && (
                    <span className="text-sm text-gray-500">
                        Lab: <span className="font-medium">{currentLab.name}</span>
                    </span>
                )}
            </div>


            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader />
                </div>
            ) : members.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <TableComponent 
                            columns={columns} 
                            data={currentItems} 
                            className="min-w-full divide-y divide-gray-200"
                        />
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : (
                <div className="text-center py-8">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No members found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There are currently no members assigned to this lab.
                    </p>
                </div>
            )}
        </section>
    );
};

export default ListOfActiveMemberOfLab;