import React, { useEffect, useState } from "react";
import Button from "@/app/(admin)/component/common/Button";
// import { getMember, updateMemberDetails } from "../../../../../../services/technicianServices";
import { getMember} from "../../../../../../services/technicianServices";
import { MdOutlineUpdate } from "react-icons/md";
import Loader from "@/app/(admin)/component/common/Loader";
import { toast } from "react-toastify";

interface Member {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    modules?: string[];
    verified?: boolean;
}

interface EditMemberProps {
    updateMember?: Member;
}

const EditMember: React.FC<EditMemberProps> = ({ updateMember }) => {
    const [formData, setFormData] = useState<Member | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Add loading state

    useEffect(() => {
        if (!updateMember) return;

        const fetchMember = async () => {
            try {
                setLoading(true); // Start loading
                const response = await getMember(updateMember.id);
                if (response?.data) {
                    setFormData(response.data);
                }
            } catch (error) {
                // Handle member fetch error
            } finally {
                setLoading(false); // Stop loading after fetching
            }
        };

        fetchMember();
    }, [updateMember]);

    // Show Loader when loading
    if (loading) {
        return <Loader />;
    }

    // Ensure data is loaded before rendering
    if (!formData) return null;

    // Handle form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle update
    const handleUpdate = async () => {
        try {
            toast.info("Update member is disabled in demo");
        
        } catch (error) {
            // Handle member update error
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Member Details</h3>
                <p className="text-sm text-gray-600">Update member information and roles</p>
            </div>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { label: "Username", name: "username", value: formData.username },
                    { label: "Email", name: "email", value: formData.email },
                    { label: "First Name", name: "firstName", value: formData.firstName },
                    { label: "Last Name", name: "lastName", value: formData.lastName },
                    { label: "Phone", name: "phone", value: formData.phone },
                    { label: "Address", name: "address", value: formData.address },
                    { label: "City", name: "city", value: formData.city },
                    { label: "State", name: "state", value: formData.state },
                    { label: "ZIP", name: "zip", value: formData.zip },
                    { label: "Country", name: "country", value: formData.country },
                ].map((field, index) => (
                    <div key={index}>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={field.value || ""}
                            onChange={handleChange}
                        />
                    </div>
                ))}

                {/* Full-width dropdown for Roles */}
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Roles</label>
                    <select
                        name="roles"
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    >
                        <option value="admin">Admin</option>
                        <option value="technician">Technician</option>
                    </select>
                </div>

                {/* Full-width button */}
                <div className="md:col-span-2">
                    <Button
                        text="Update"
                        onClick={handleUpdate}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md text-sm flex items-center justify-center transition-colors"
                    >
                        <MdOutlineUpdate className="mr-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditMember;
