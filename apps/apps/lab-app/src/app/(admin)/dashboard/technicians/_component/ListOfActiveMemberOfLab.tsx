import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
// import { deleteMember as deleteMemberService, getMembersOfLab } from '../../../../../../services/technicianServices';
import { getMembersOfLab } from '../../../../../../services/technicianServices';
import EditMember from './EditMember';

// Define table columns
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
    const [editPopup, setEditPopup] = useState(false);
    const [updateMember, setUpdateMember] = useState<Member | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentLab?.id !== undefined) {
                try {
                    setLoading(true);
                    const response = await getMembersOfLab(currentLab.id);
                    console.log('response', response);
                    setMembers(response?.data || []);
                } catch (error) {
                    console.error('Failed to fetch members:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMembers();
    }, [currentLab]);

    // const deleteMember = async (userId: number) => {
    //     try {
    //         setLoading(true);
    //         console.log('userId', userId);
    //          toast.info('Delete member is disabled in demo');
    //         // await deleteMemberService(userId);
    //         // setMembers((prevMembers) => prevMembers.filter((member) => member.id !== userId));
    //         // toast.success('Member deleted successfully');
    //     } catch (error) {
    //         console.error('Failed to delete member:', error);
    //         toast.error('Failed to delete member');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleEdit = (member: Member) => {
        setEditPopup(true);
        setUpdateMember(member);
    };

    const columns: Column[] = [
        { header: 'ID', accessor: (member) => member.id },
        { header: 'Username', accessor: (member) => member.username },
        { header: 'Email', accessor: (member) => member.email },
        { header: 'First Name', accessor: (member) => member.firstName },
        { header: 'Last Name', accessor: (member) => member.lastName },
        {
            header: 'Status',
            accessor: (member) => (
                <span className={`text-xs ${member.enabled ? 'bg-success text-white p-1' : 'text-whit bg-delete'}`}>
                    {member.enabled ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            header: 'Roles',
            accessor: (member) => <span className="text-xs">{member.roles.join(', ')}</span>,
        },
        {
            header: 'Actions',
            accessor: (member) => (
                <div className="flex items-center space-x-3">
                    <Button
                        text=''
                        onClick={() => handleEdit(member)}
                        className="text-edit hover:text-edithover">
                        <FaEdit className="text-lg" />
                    </Button>
                    {/* <Button
                        text=''
                        onClick={() => { }}
                        className="text-green-500 hover:text-green-700">
                        <FaEye className="text-lg" />
                    </Button> */}
                    {/* <Button
                        text=''
                        onClick={() => deleteMember(member.id)}
                        className="text-deletebutton hover:text-deletehover"
                    >
                        <FaTrash className="text-lg" />
                    </Button> */}
                </div>
            ),
        },
    ];

    return (
        <section>
            {editPopup && updateMember && (
                <Modal
                    isOpen={editPopup}
                    onClose={() => setEditPopup(false)}
                    modalClassName="max-w-xl"
                    title="Edit Member"
                >
                    <EditMember updateMember={updateMember} />
                </Modal>
            )}
            <h2 className="text-xl font-semibold mb-4">Lab Members</h2>
            {loading ? (
                <Loader />
            ) : members.length > 0 ? (
                <TableComponent columns={columns} data={members} />
            ) : (
                <p>No members found</p>
            )}
        </section>
    );
};

export default ListOfActiveMemberOfLab;