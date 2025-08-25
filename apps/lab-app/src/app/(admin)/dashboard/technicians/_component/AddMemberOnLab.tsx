// import Button from "@/app/(admin)/component/common/Button";
// import Loader from "@/app/(admin)/component/common/Loader";
// import Modal from "@/app/(admin)/component/common/Model";
// import Pagination from "@/app/(admin)/component/common/Pagination";
// import TableComponent from "@/app/(admin)/component/common/TableComponent";
// import { useLabs } from "@/context/LabContext";
// import React, { useEffect, useState } from "react";
// import { FaEdit, FaSearch, FaUser, FaUserPlus } from "react-icons/fa";
// import { FiUserPlus } from "react-icons/fi";
// import { RiShieldUserFill } from "react-icons/ri";
// import { TbLockPassword } from "react-icons/tb";
// import Select, { MultiValue } from 'react-select';
// import { toast } from "react-toastify";
// import { createMember, getMembersOfLab, updateMember } from "../../../../../../services/technicianServices";
// import UpdateUserPassword from "./UpdateUserPassword";
// import {memberSchema} from "@/schema/memberSchema";
// interface FormData {
//     username: string;
//     firstName: string;
//     lastName: string;
//     phone: string;
//     email: string;
//     address: string;
//     city: string;
//     state: string;
//     zip: string;
//     roles: string[];
//     country: string;
//     password: string;
//     enabled?: boolean;
// }

// interface Member {
//     id: string;
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     roles: string[];
//     phone?: string;
//     city?: string;
//     status?: 'active' | 'inactive';
//     enabled?: boolean;
// }

// interface Column {
//     header: string;
//     accessor: (member: Member) => React.ReactNode;
// }

// const initialFormState: FormData = {
//     username: "",
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     address: "",
//     city: "",
//     state: "",
//     zip: "",
//     country: "",
//     roles: [],
//     password: "",
//     enabled: true,
// };

// const AddMemberOnLab = () => {
//     const [loading, setLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [isEditing, setIsEditing] = useState(false);
//     const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
//     const { currentLab } = useLabs();
//     const [formData, setFormData] = useState<FormData>(initialFormState);
//     const [members, setMembers] = useState<Member[]>([]);
//     const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);
//     const [refreshMembers, setRefreshMembers] = useState(false);
//     const [showUpdatePassword, setShowUpdatePassword] = useState(false);
//     const [Member, setMember] = useState<Member | null>(null);

//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(5);

//     const roleOptions: Option[] = [
//         { value: 'ADMIN', label: 'Admin' },
//         { value: 'TECHNICIAN', label: 'Technician' },
//         { value: 'DESKROLE', label: 'Desk Role' },
//     ];

//     useEffect(() => {
//         const fetchMembers = async () => {
//             if (currentLab?.id) {
//                 try {
//                     setLoading(true);
//                     const response = await getMembersOfLab(currentLab.id);
//                     setMembers(response?.data || []);
//                 } catch (error) {
//                     toast.error("Failed to fetch members");
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };
//         fetchMembers();
//     }, [currentLab, refreshMembers]);


//     const isSuperAdmin = members.some(member => member?.roles?.includes('SUPERADMIN'));
//     const isAdmin = members.some(member => member?.roles?.includes('ADMIN'));

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     interface Option {
//         value: string;
//         label: string;
//     }

//     const handleRoleChange = (selectedOptions: MultiValue<Option>) => {
//         const roles = selectedOptions ? selectedOptions.map((option: Option) => option.value) : [];
//         setSelectedRoles(selectedOptions as Option[]);
//         setFormData({ ...formData, roles });
//     };

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             if (isEditing && currentMemberId) {
//                 const response = await updateMember(currentLab?.id as number, Number(currentMemberId), {
//                     ...formData,
//                     roles: formData.roles,
//                     isVerified: true,
//                 });
//                 if (response?.data) {
//                     setMembers(prevMembers =>
//                         prevMembers.map(member =>
//                             member.id === currentMemberId ? response.data : member
//                         )
//                     );
//                     setRefreshMembers(prev => !prev);
//                 }
//                 else {
//                     toast.error("Failed to update member.");
//                 }
//                 toast.success("Member updated successfully ");
//             } else {
//                 // Validate form data using zod schema
//                 // const validation = memberSchema.safeParse(formData);
//                 const response = await createMember(currentLab?.id as number, {
//                     ...formData,
//                     enabled: true,
//                     isVerified: true,
//                 });

//                 if (response?.data) {
//                     setMembers(prevMembers => [response.data, ...prevMembers]);
//                     setRefreshMembers(prev => !prev);
//                     toast.success("Member added successfully.");
//                 } else {
//                     toast.error(response?.error || "Failed to add member.");
//                 }
//             }

//             setFormData(initialFormState);
//             setSelectedRoles([]);
//             setIsEditing(false);
//             setCurrentMemberId(null);
//         } catch (error) {
//             console.error("Error:", error);
//             toast.error("Operation failed");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEdit = (member: Member) => {
//         const memberRoles = member.roles || [];
//         const selected = roleOptions.filter(option =>
//             memberRoles.includes(option.value)
//         );

//         setFormData({
//             username: member.username,
//             firstName: member.firstName,
//             lastName: member.lastName,
//             phone: member.phone || "",
//             email: member.email,
//             address: "",
//             city: member.city || "",
//             state: "",
//             zip: "",
//             country: "",
//             roles: memberRoles,
//             password: "",
//             enabled: member.enabled,
//         });
//         setSelectedRoles(selected);
//         setIsEditing(true);
//         setCurrentMemberId(member.id);
//     };

//     const handleCancel = () => {
//         setFormData(initialFormState);
//         setSelectedRoles([]);
//         setIsEditing(false);
//         setCurrentMemberId(null);
//     };

//     const handleUpdatePassword = (member: Member) => {
//         setMember(member);
//         setShowUpdatePassword(true);
//     }

//     const filteredMembers = members.filter(member => {
//         const searchTermLower = searchTerm.toLowerCase();
//         return (
//             member.username?.toLowerCase().includes(searchTermLower) ||
//             member.email?.toLowerCase().includes(searchTermLower) ||
//             member.firstName?.toLowerCase().includes(searchTermLower) ||
//             member.lastName?.toLowerCase().includes(searchTermLower)
//         );
//     });

//     // Calculate pagination
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

//     // Reset to first page when search term changes
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchTerm]);

//     const columns: Column[] = [
//         {
//             header: "User",
//             accessor: (member: Member) => (
//                 <div className="flex items-center">
//                     <div className="bg-blue-100 p-2 rounded-full mr-3">
//                         <RiShieldUserFill className="text-blue-600" />
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
//                         <p className="text-xs text-gray-500">{member.email}</p>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             header: "Username",
//             accessor: (member: Member) => (
//                 <span className="text-sm font-medium text-gray-700 -ml-4">{member.username}</span>
//             )
//         },
//         {
//             header: "Active Status",
//             accessor: (member: Member) => (
//                 <span className={`text-sm font-medium ${member.enabled ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
//                     } px-2 py-1 rounded-full`}>
//                     {member.enabled ? "Active" : "Inactive"}
//                 </span>
//             )
//         },
//         {
//             header: "Roles",
//             accessor: (member: Member) => (
//                 <div className="flex flex-wrap gap-1">
//                     {member.roles?.map(role => (
//                         <span
//                             key={role}
//                             className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
//                         >
//                             {role}
//                         </span>
//                     ))}
//                 </div>
//             )
//         },
//         {
//             header: "Actions",
//             accessor: (member: Member) => (
//                 <>
//                     {
//                         isSuperAdmin && isAdmin ? (<div className="flex space-x-2">
//                             {
//                                 member.roles.includes('SUPERADMIN') ? (
//                                     <button
//                                         onClick={() =>
//                                             toast.error("Cannot edit Super Admin member.",
//                                                 { autoClose: 3000, position: "top-center" }
//                                             )}

//                                         className="p-1 text-blue-600 hover:text-blue-800"
//                                         title="Edit"
//                                     >
//                                         <FaEdit />
//                                     </button>
//                                 ) : (

//                                     <button
//                                         onClick={() => handleEdit(member)}
//                                         className="p-1 text-blue-600 hover:text-blue-800"
//                                         title="Edit"
//                                     >
//                                         <FaEdit />
//                                     </button>
//                                 )
//                             }
//                             {
//                                 member.roles.includes('SUPERADMIN') ? (
//                                     <button
//                                         onClick={() =>
//                                             toast.error("Cannot update password for Super Admin member.",
//                                                 { autoClose: 3000, position: "top-center" }
//                                             )}
//                                         className="p-1 text-red-600 hover:text-red-800"
//                                         title="Update Password"
//                                     >
//                                         <TbLockPassword />
//                                     </button>
//                                 ) : (
//                                     <button
//                                         onClick={() => handleUpdatePassword(member)}
//                                         className="p-1 text-red-600 hover:text-red-800"
//                                         title="Update Password"
//                                     >
//                                         <TbLockPassword />
//                                     </button>
//                                 )
//                             }
//                         </div>) : ("")
//                     }
//                 </>
//             )
//         }
//     ];

//     return (
//         <>
//             <div className="p-6 bg-gray-50 min-h-screen">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="flex justify-between items-center mb-6">
//                         <h1 className="text-2xl font-bold text-gray-800">Lab Member Management</h1>
//                         <div className="flex items-center space-x-4">
//                             <div className="relative">
//                                 <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search members..."
//                                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                         {/* Form Section */}
//                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                             <div className="flex items-center mb-6">
//                                 <div className="p-2 bg-blue-100 rounded-lg mr-3">
//                                     {isEditing ? (
//                                         <FaEdit className="text-blue-600 text-xl" />
//                                     ) : (
//                                         <FiUserPlus className="text-blue-600 text-xl" />
//                                     )}
//                                 </div>
//                                 <h2 className="text-xl font-semibold text-gray-700">
//                                     {isEditing ? "Edit Member" : "Add New Member"}
//                                 </h2>
//                             </div>

//                             {loading &&
//                                 <div className="flex flex-col items-center justify-center h-64">
//                                     <Loader type="progress" fullScreen={false} text="Loading members..." />
//                                     <p className="mt-4 text-sm text-gray-500">Please wait while we fetch the latest data.</p>
//                                 </div>}

//                             <form onSubmit={handleSubmit} className="space-y-4">
//                                 <div className="grid grid-cols-1 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
//                                         <input
//                                             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                             type="text"
//                                             name="username"
//                                             placeholder="Enter username"
//                                             value={formData.username}
//                                             onChange={handleChange}
//                                             required
//                                         />
//                                     </div>

//                                     {!isEditing && (
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
//                                             <input
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                                 type="password"
//                                                 name="password"
//                                                 placeholder="Enter password"
//                                                 value={formData.password}
//                                                 onChange={handleChange}
//                                                 required={!isEditing}
//                                                 minLength={6}
//                                             />
//                                         </div>
//                                     )}

//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
//                                             <input
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                                 type="text"
//                                                 name="firstName"
//                                                 placeholder="First name"
//                                                 value={formData.firstName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
//                                             <input
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                                 type="text"
//                                                 name="lastName"
//                                                 placeholder="Last name"
//                                                 value={formData.lastName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
//                                         <input
//                                             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                             type="email"
//                                             name="email"
//                                             placeholder="user@example.com"
//                                             value={formData.email}
//                                             onChange={handleChange}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                                             <input
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                                 type="tel"
//                                                 name="phone"
//                                                 placeholder="+1 (555) 123-4567"
//                                                 value={formData.phone}
//                                                 onChange={handleChange}
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                                             <input
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                                 type="text"
//                                                 name="city"
//                                                 placeholder="Enter city"
//                                                 value={formData.city}
//                                                 onChange={handleChange}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Roles*</label>
//                                         <Select
//                                             isMulti
//                                             options={roleOptions}
//                                             value={selectedRoles}
//                                             onChange={handleRoleChange}
//                                             placeholder="Select roles..."
//                                             className="react-select-container"
//                                             classNamePrefix="react-select"
//                                             required
//                                         />
//                                     </div>
//                                     {isEditing && (
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
//                                             <select
//                                                 name="enabled"
//                                                 value={formData.enabled ? "true" : "false"}
//                                                 onChange={(e) => setFormData({ ...formData, enabled: e.target.value === "true" })}
//                                                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                                             >
//                                                 <option value="true">Active</option>
//                                                 <option value="false">Inactive</option>
//                                             </select>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="flex space-x-3 pt-4">
//                                     {
//                                         isSuperAdmin && isAdmin && (<Button
//                                             onClick={() => { }}
//                                             type="submit"
//                                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
//                                             text={isEditing ? "Update Member" : "Add Member"}
//                                             disabled={loading}
//                                         >
//                                             <FaUserPlus className="mr-2" />
//                                         </Button>
//                                         )
//                                     }
//                                     {isEditing && (
//                                         <Button
//                                             type="button"
//                                             className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
//                                             text="Cancel"
//                                             onClick={handleCancel}
//                                             disabled={loading}
//                                         />
//                                     )}
//                                 </div>
//                             </form>
//                         </div>

//                         {/* Members List Section */}
//                         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="flex items-center">
//                                     <div className="p-2 bg-blue-100 rounded-lg mr-3">
//                                         <FaUser className="text-blue-600 text-xl" />
//                                     </div>
//                                     <h2 className="text-xl font-semibold text-gray-700">Lab Members</h2>
//                                 </div>
//                                 <div className="text-sm text-gray-500">
//                                     {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} found
//                                 </div>
//                             </div>

//                             {loading && members.length === 0 ? (
//                                 <div className="flex flex-col items-center justify-center h-64">
//                                     <Loader type="progress" fullScreen={false} text="Loading lab members..." />
//                                     <p className="mt-4 text-sm text-gray-500">Fetching the lab members, please wait...</p>
//                                 </div>
//                             ) : filteredMembers.length === 0 ? (
//                                 <div className="text-center py-10">
//                                     <div className="text-gray-400 mb-4">
//                                         <FaUser className="mx-auto text-4xl" />
//                                     </div>
//                                     <h3 className="text-lg font-medium text-gray-700">No members found</h3>
//                                     <p className="text-gray-500 mt-1">
//                                         {searchTerm ? "Try a different search term" : "Add your first member to get started"}
//                                     </p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="border border-gray-200 rounded-lg overflow-hidden">
//                                         <TableComponent
//                                             data={currentMembers}
//                                             columns={columns}
//                                             className="min-w-full divide-y divide-gray-200"
//                                         />
//                                     </div>
//                                     {filteredMembers.length > itemsPerPage && (
//                                         <div className="mt-4">
//                                             <Pagination
//                                                 currentPage={currentPage}
//                                                 totalPages={totalPages}
//                                                 onPageChange={setCurrentPage}
//                                             />
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {
//                 showUpdatePassword && Member && (
//                     <Modal
//                         isOpen={showUpdatePassword}
//                         onClose={() => setShowUpdatePassword(false)}
//                         title=""
//                         modalClassName="max-w-xl mx-auto"
//                     >
//                         <UpdateUserPassword
//                             member={Member}
//                             setShowUpdatePassword={setShowUpdatePassword}
//                         />
//                     </Modal>
//                 )
//             }
//         </>
//     );
// };

// export default AddMemberOnLab;










import { z } from "zod";
import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Modal from "@/app/(admin)/component/common/Model";
import Pagination from "@/app/(admin)/component/common/Pagination";
import TableComponent from "@/app/(admin)/component/common/TableComponent";
import { useLabs } from "@/context/LabContext";
import React, { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaUser, FaUserPlus } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { RiShieldUserFill } from "react-icons/ri";
import { TbLockPassword } from "react-icons/tb";
import Select, { MultiValue } from 'react-select';
import { toast } from "react-toastify";
import { createMember, getMembersOfLab, updateMember } from "../../../../../../services/technicianServices";
import UpdateUserPassword from "./UpdateUserPassword";

export const memberSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .optional(),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    city: z.string().min(2, "City must be at least 2 characters").max(50, "City must be at most 50 characters").optional(),
    roles: z.array(z.string()).nonempty("At least one role is required"),
    // password: z.string().min(8, "Password must be at least 8 characters").optional(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number").optional(),
});

interface FormData {
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    roles: string[];
    password?: string;
    enabled?: boolean;
}

interface Member {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    phone?: string;
    city?: string;
    enabled?: boolean;
}

interface Column {
    header: string;
    accessor: (member: Member) => React.ReactNode;
}

interface FormErrors {
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    city?: string;
    roles?: string;
    password?: string;
}

interface Option {
    value: string;
    label: string;
}

const initialFormState: FormData = {
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    roles: [],
    password: "",
    enabled: true,
};

const AddMemberOnLab = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
    const { currentLab } = useLabs();
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);
    const [refreshMembers, setRefreshMembers] = useState(false);
    const [showUpdatePassword, setShowUpdatePassword] = useState(false);
    const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const roleOptions: Option[] = [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'TECHNICIAN', label: 'Technician' },
        { value: 'DESKROLE', label: 'Desk Role' },
    ];

    useEffect(() => {
        const fetchMembers = async () => {
            if (currentLab?.id) {
                try {
                    setLoading(true);
                    const response = await getMembersOfLab(currentLab.id);
                    setMembers(response?.data || []);
                } catch (error) {
                    toast.error("Failed to fetch members");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMembers();
    }, [currentLab, refreshMembers]);

    const isSuperAdmin = members.some(member => member?.roles?.includes('SUPERADMIN'));
    const isAdmin = members.some(member => member?.roles?.includes('ADMIN'));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof FormErrors]) {
            setErrors({ ...errors, [name]: undefined });
        }
    };

    const handleRoleChange = (selectedOptions: MultiValue<Option>) => {
        const roles = selectedOptions ? selectedOptions.map((option: Option) => option.value) : [];
        setSelectedRoles(selectedOptions as Option[]);
        setFormData({ ...formData, roles });

        if (errors.roles) {
            setErrors({ ...errors, roles: undefined });
        }
    };

    const validateForm = (): boolean => {
        try {
            // For update, make password optional
            const validationSchema = isEditing
                ? memberSchema.omit({ password: true })
                : memberSchema;

            validationSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {};
                error.errors.forEach(err => {
                    const path = err.path[0];
                    if (path) {
                        newErrors[path as keyof FormErrors] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (isEditing && currentMemberId && currentLab?.id) {
                // Prepare update payload (exclude password)
                const updatePayload = {
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    email: formData.email,
                    city: formData.city,
                    roles: formData.roles,
                    enabled: formData.enabled
                };

                const response = await updateMember(
                    currentLab.id,
                    Number(currentMemberId),
                    updatePayload
                );

                if (response?.data) {
                    setMembers(prevMembers =>
                        prevMembers.map(member =>
                            member.id === currentMemberId ? { ...member, ...response.data } : member
                        )
                    );
                    setRefreshMembers(prev => !prev);
                    toast.success("Member updated successfully");
                    handleCancel();
                } else {
                    toast.error(response?.error || "Failed to update member.");
                }
            } else if (currentLab?.id) {
                // Create new member
                const response = await createMember(currentLab.id, {
                    ...formData,
                    enabled: true,
                    isVerified: true,
                });

                if (response?.data) {
                    setMembers(prevMembers => [response.data, ...prevMembers]);
                    setRefreshMembers(prev => !prev);
                    toast.success("Member added successfully.");
                    setFormData(initialFormState);
                    setSelectedRoles([]);
                } else {
                    toast.error(response?.message);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: Member) => {
        const memberRoles = member.roles || [];
        const selected = roleOptions.filter(option =>
            memberRoles.includes(option.value)
        );

        setFormData({
            username: member.username,
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone || "",
            email: member.email,
            city: member.city || "",
            roles: memberRoles,
            password: "", // Don't include password in edit mode
            enabled: member.enabled ?? true,
        });
        setSelectedRoles(selected);
        setIsEditing(true);
        setCurrentMemberId(member.id);
    };

    const handleCancel = () => {
        setFormData(initialFormState);
        setSelectedRoles([]);
        setIsEditing(false);
        setCurrentMemberId(null);
        setErrors({});
    };

    const handleUpdatePassword = (member: Member) => {
        setMemberToUpdate(member);
        setShowUpdatePassword(true);
    };

    const filteredMembers = members.filter(member => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            member.username?.toLowerCase().includes(searchTermLower) ||
            member.email?.toLowerCase().includes(searchTermLower) ||
            member.firstName?.toLowerCase().includes(searchTermLower) ||
            member.lastName?.toLowerCase().includes(searchTermLower)
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const columns: Column[] = [
        {
            header: "User",
            accessor: (member: Member) => (
                <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <RiShieldUserFill className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Username",
            accessor: (member: Member) => (
                <span className="text-sm font-medium text-gray-700 -ml-4">{member.username}</span>
            )
        },
        {
            header: "Active Status",
            accessor: (member: Member) => (
                <span className={`text-sm font-medium ${member.enabled ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                    } px-2 py-1 rounded-full`}>
                    {member.enabled ? "Active" : "Inactive"}
                </span>
            )
        },
        {
            header: "Roles",
            accessor: (member: Member) => (
                <div className="flex flex-wrap gap-1">
                    {member.roles?.map(role => (
                        <span
                            key={role}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: "Actions",
            accessor: (member: Member) => (
                <>
                    {isSuperAdmin && isAdmin && (
                        <div className="flex space-x-2">
                            {member.roles.includes('SUPERADMIN') ? (
                                <button
                                    onClick={() =>
                                        toast.error("Cannot edit Super Admin member.",
                                            { autoClose: 3000, position: "top-center" }
                                        )}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                            )}
                            {member.roles.includes('SUPERADMIN') ? (
                                <button
                                    onClick={() =>
                                        toast.error("Cannot update password for Super Admin member.",
                                            { autoClose: 3000, position: "top-center" }
                                        )}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Update Password"
                                >
                                    <TbLockPassword />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpdatePassword(member)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Update Password"
                                >
                                    <TbLockPassword />
                                </button>
                            )}
                        </div>
                    )}
                </>
            )
        }
    ];

    return (
        <>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Lab Member Management</h1>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    {isEditing ? (
                                        <FaEdit className="text-blue-600 text-xl" />
                                    ) : (
                                        <FiUserPlus className="text-blue-600 text-xl" />
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-700">
                                    {isEditing ? "Edit Member" : "Add New Member"}
                                </h2>
                            </div>

                            {loading && (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader type="progress" fullScreen={false} text="Loading members..." />
                                    <p className="mt-4 text-sm text-gray-500">Please wait while we fetch the latest data.</p>
                                </div>
                            )}

                            {!loading && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                                            <input
                                                className={`w-full p-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                type="text"
                                                name="username"
                                                placeholder="Enter username"
                                                value={formData.username}
                                                onChange={handleChange}
                                            />
                                            {errors.username && (
                                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                                                <input
                                                    className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                    type="password"
                                                    name="password"
                                                    placeholder="Enter password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                                {errors.password && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                                                <input
                                                    className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="First name"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                                                <input
                                                    className={`w-full p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Last name"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                            <input
                                                className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                type="email"
                                                name="email"
                                                placeholder="user@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <input
                                                    className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Enter phone number"
                                                    value={formData.phone}
                                                    onChange={(event) => {
                                                        // Only allow numeric input
                                                        const numericValue = event.target.value.replace(/\D/g, '');
                                                        const numericEvent = {
                                                            ...event,
                                                            target: {
                                                                ...event.target,
                                                                value: numericValue
                                                            }
                                                        };
                                                        handleChange(numericEvent);
                                                    }}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={10}
                                                    onKeyPress={(e) => {
                                                        // Prevent non-numeric characters
                                                        if (!/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                                {errors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    className={`w-full p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                                                    type="text"
                                                    name="city"
                                                    placeholder="Enter city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                />
                                                {errors.city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Roles*</label>
                                            <Select
                                                isMulti
                                                options={roleOptions}
                                                value={selectedRoles}
                                                onChange={handleRoleChange}
                                                placeholder="Select roles..."
                                                className={`react-select-container ${errors.roles ? 'border-red-500 rounded-lg' : ''}`}
                                                classNamePrefix="react-select"
                                            />
                                            {errors.roles && (
                                                <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                                                <select
                                                    name="enabled"
                                                    value={formData.enabled ? "true" : "false"}
                                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.value === "true" })}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        {/* {isSuperAdmin && isAdmin && (
                                            <Button
                                                onClick={() => { }}
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                                                text={isEditing ? "Update Member" : "Add Member"}
                                                disabled={loading}
                                            >
                                                <FaUserPlus className="mr-2" />
                                            </Button>
                                        )} */}
                                        <Button
                                            onClick={() => { }}
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                                            text={isEditing ? "Update Member" : "Add Member"}
                                            disabled={loading}
                                        >
                                            <FaUserPlus className="mr-2" />
                                        </Button>
                                        {isEditing && (
                                            <Button
                                                type="button"
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
                                                text="Cancel"
                                                onClick={handleCancel}
                                                disabled={loading}
                                            />
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Members List Section */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                        <FaUser className="text-blue-600 text-xl" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-700">Lab Members</h2>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} found
                                </div>
                            </div>

                            {loading && members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader type="progress" fullScreen={false} text="Loading lab members..." />
                                    <p className="mt-4 text-sm text-gray-500">Fetching the lab members, please wait...</p>
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-gray-400 mb-4">
                                        <FaUser className="mx-auto text-4xl" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700">No members found</h3>
                                    <p className="text-gray-500 mt-1">
                                        {searchTerm ? "Try a different search term" : "Add your first member to get started"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <TableComponent
                                            data={currentMembers}
                                            columns={columns}
                                            className="min-w-full divide-y divide-gray-200"
                                        />
                                    </div>
                                    {filteredMembers.length > itemsPerPage && (
                                        <div className="mt-4">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showUpdatePassword && memberToUpdate && (
                <Modal
                    isOpen={showUpdatePassword}
                    onClose={() => setShowUpdatePassword(false)}
                    title=""
                    modalClassName="max-w-xl mx-auto"
                >
                    <UpdateUserPassword
                        member={memberToUpdate}
                        setShowUpdatePassword={setShowUpdatePassword}
                    />
                </Modal>
            )}
        </>
    );
};

export default AddMemberOnLab;