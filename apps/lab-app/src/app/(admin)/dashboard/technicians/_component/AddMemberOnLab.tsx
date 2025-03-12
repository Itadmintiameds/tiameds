import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import TableComponent from "@/app/(admin)/component/common/TableComponent";
import { useLabs } from "@/context/LabContext";
import React, { useEffect, useState } from 'react';
import { FaUser, FaUserPlus } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { getMembersOfLab } from "../../../../../../services/technicianServices";

interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    verified: boolean;
}

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

const initialFormState: FormData = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    verified: false,
};

const AddMemberOnLab = () => {
    const [loading, setLoading] = useState(false);
    const { currentLab } = useLabs();
    const [users, setUsers] = useState<FormData[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [members, setMembers] = useState([]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("Submitting Data:", formData);
            setUsers((prevUsers) => [...prevUsers, formData]);
            setFormData(initialFormState);
            toast.success("Member added successfully!");
        } catch (error) {
            toast.error("Failed to add member. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    console.log(members, 'members');
    console.log(users, 'users');

    const columns: Column[] = [
        { header: 'ID', accessor: (member) => member.id },
        { header: 'Username', accessor: (member) => member.username },
        { header: 'Email', accessor: (member) => member.email },
        { header: 'First Name', accessor: (member) => member.firstName },
        { header: 'Last Name', accessor: (member) => member.lastName },
        { header: 'Roles', accessor: (member) => member.roles.join(', ') }
    ];

    return (
        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg">
            {/* Add Member Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700 mb-4">
                    <FiUserPlus /> Add Member
                </h2>
                {loading && <Loader />}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(initialFormState).map((key) => (
                            <input
                                key={key}
                                className="p-2 border border-gray-300 rounded-lg"
                                type={key === "password" ? "password" : "text"}
                                name={key}
                                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                value={typeof formData[key as keyof FormData] === 'boolean' ? String(formData[key as keyof FormData]) : formData[key as keyof FormData] as string | number | readonly string[] | undefined}
                                onChange={handleChange}
                                required
                            />
                        ))}
                    </div>
                    <Button
                        type="submit"
                        className="bg-primary w-40 rounded-lg text-white font-semibold hover:bg-primarydark px-4 py-2"
                        text="Add Member"
                        onClick={() => { }}>
                        <FaUserPlus className="mr-2" />
                    </Button>
                </form>
            </div>

            {/* Member List */}
            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700 mb-4">
                    <FaUser /> Member List
                </h2>
                {members.length === 0 ? (
                    <p className="text-gray-500">No members added yet.</p>
                ) : (
                    <TableComponent data={members} columns={columns} noDataMessage="No members found." />
                )}
            </div>
        </div>
    );
};

export default AddMemberOnLab;