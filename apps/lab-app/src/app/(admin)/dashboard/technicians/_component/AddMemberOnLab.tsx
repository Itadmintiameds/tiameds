import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import TableComponent from "@/app/(admin)/component/common/TableComponent";
import { useLabs } from "@/context/LabContext";
import React, { useEffect, useState } from "react";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { getMembersOfLab, createMember } from "../../../../../../services/technicianServices";
// import { getMembersOfLab } from "../../../../../../services/technicianServices";

interface FormData {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
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
    accessor: (member: Member) => React.ReactNode;
}
const initialFormState: FormData = {
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
};
// const generatePassword = (): string => {
//     return Math.random().toString(36).slice(-8);
// };
const AddMemberOnLab = () => {
    const [loading, setLoading] = useState(false);
    const { currentLab } = useLabs();
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [members, setMembers] = useState<Member[]>([]);
    // const [updated, setUpdated] = useState(false);  

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentLab?.id) {
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
            toast.info("Adding member will be dissable in demo");
            console.log("Form Data:", formData);
            // const generatedPassword = generatePassword();
            // const newUser = { ...formData, password: generatedPassword, verified: false,modules: [] };
            // const emailData = {
            //     user: newUser,
            //     lab: {
            //         name: currentLab?.name,
            //         address: currentLab?.address,
            //         city: currentLab?.city,
            //         state: currentLab?.state,
            //         description: currentLab?.description,
            //         createdByName: currentLab?.createdByName,
            //     },
            // };
            // const response = await fetch("/api/email", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(emailData),
            // });
            
            // if (response.status === 200) {
            //     const createdMember = await createMember(currentLab?.id as number, newUser);
            //     if (createdMember) {
            //         setMembers([...members, createdMember]);
            //         setFormData(initialFormState);
            //         setUpdated(!updated);
            //         toast.success("Member added successfully.");
            //     }
            // }
        } catch (error) {
            console.error("Error adding member:", error);
            toast.error("Error adding member.");
        }
        setLoading(false);
    };
     
 
    
    const columns: Column[] = [
        { header: "ID", accessor: (member: Member) => <span className="text-xs">{member.id}</span> },
        { header: "Username", accessor: (member: Member) => <span className="text-xs">{member.username}</span> },
        { header: "Email", accessor: (member: Member) => <span className="text-xs">{member.email}</span> },
        { header: "First Name", accessor: (member: Member) => <span className="text-xs">{member.firstName}</span> },
        { header: "Last Name", accessor: (member: Member) => <span className="text-xs">{member.lastName}</span> },
        { 
            header: "Roles", 
            accessor: (member: Member) => (
                <span className="text-xs">{member.roles ? member.roles.join(", ") : ""}</span>
            )
        }
    ];
    
    return (
        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg">
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
                                type="text"
                                name={key}
                                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                value={formData[key as keyof FormData] as string}
                                onChange={handleChange}
                                required
                            />
                        ))}
                    </div>
                    <Button
                        type="submit"
                        className="bg-primary w-40 rounded-lg text-textzinc font-semibold hover:bg-primarydark px-4 py-2"
                        text="Add Member"
                        onClick={() => { }}
                    >
                        <FaUserPlus className="mr-2" />

                    </Button>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700 mb-4">
                    <FaUser /> Lab Member List
                </h2>
                {members.length === 0 ? <p className="text-gray-500">No members added yet.</p> : <TableComponent data={members} columns={columns} />}
            </div>
        </div>
    );
};

export default AddMemberOnLab;








