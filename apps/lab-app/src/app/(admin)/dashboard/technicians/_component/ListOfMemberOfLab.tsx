import React, { useEffect, useState } from 'react';
import { getMembersOfLab } from '../../../../../../services/technicianServices';
import { useLabs } from '@/context/LabContext';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import Loader from '@/app/(admin)/component/common/Loader';

const ListOfMemberOfLab = () => {
    const [members, setMembers] = useState([]);
    const { currentLab } = useLabs();

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentLab?.id !== undefined) {
                const response = await getMembersOfLab(currentLab.id);
                setMembers(response?.data || []);
            }
        };
        fetchMembers();
    }, [currentLab]);

    if (!members) {
        return <Loader />;
    }

    // Define table columns
    interface Member {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: string[];
    }

    interface Column {
        header: string;
        accessor: (member: Member) => string;
    }

    const columns: Column[] = [
        { header: 'ID', accessor: (member) => member.id },
        { header: 'Username', accessor: (member) => member.username },
        { header: 'Email', accessor: (member) => member.email },
        { header: 'First Name', accessor: (member) => member.firstName },
        { header: 'Last Name', accessor: (member) => member.lastName },
        { 
            header: 'Roles', 
            accessor: (member) => member.roles.join(', ') // Convert array to a comma-separated string
        }
    ];


    return (
        <section>
            <h2 className="text-xl font-semibold mb-4">Lab Members</h2>
            <TableComponent 
                data={members} 
                columns={columns} 
                noDataMessage="No members found." 
            />
        </section>
    );
};

export default ListOfMemberOfLab;
