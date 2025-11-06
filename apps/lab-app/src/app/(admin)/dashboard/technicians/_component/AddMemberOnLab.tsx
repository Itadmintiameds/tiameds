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
        .max(10, "Phone number must be at most 15 digits")
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
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    // Validate individual field
    const validateField = (name: string, value: unknown): string => {
        // Handle roles as array, others as string
        if (name === 'roles') {
            if (!Array.isArray(value) || value.length === 0) {
                return 'At least one role is required';
            }
            return '';
        }
        
        // Type guard to ensure value is a string for other fields
        if (typeof value !== 'string') {
            return `${name} must be a valid value`;
        }
        switch (name) {
            case 'username':
                if (!value || value.trim() === '') return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (value.length > 20) return 'Username must be at most 20 characters';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                return '';
            
            case 'firstName':
                if (!value || value.trim() === '') return 'First name is required';
                if (value.length < 2) return 'First name must be at least 2 characters';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name should contain only alphabets and spaces';
                return '';
            
            case 'lastName':
                if (!value || value.trim() === '') return 'Last name is required';
                if (value.length < 1) return 'Last name is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name should contain only alphabets and spaces';
                return '';
            
            case 'email':
                if (!value || value.trim() === '') return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return '';
            
            case 'phone':
                if (value && value.length < 10) return 'Phone number must be at least 10 digits';
                if (value && value.length > 10) return 'Phone number must be at most 10 digits';
                if (value && !/^\d+$/.test(value)) return 'Phone number should contain only digits';
                return '';
            
            case 'city':
                if (value && value.length < 2) return 'City must be at least 2 characters';
                if (value && value.length > 50) return 'City must be at most 50 characters';
                if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only alphabets and spaces';
                return '';
            
            case 'password':
                if (!isEditing && (!value || value.trim() === '')) return 'Password is required';
                if (value && value.length < 8) return 'Password must be at least 8 characters';
                if (value && !/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                if (value && !/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
                if (value && !/[0-9]/.test(value)) return 'Password must contain at least one number';
                return '';
            
            
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors({ ...errors, [name]: undefined });
        }
        
        if (name === 'phone') {
            // Only allow numeric input for phone and limit to 10 characters
            const numericValue = value.replace(/\D/g, '');
            const limitedValue = numericValue.slice(0, 10); // Limit to 10 characters
            setFormData({ ...formData, [name]: limitedValue });
            
            // Validate phone field when user types
            if (limitedValue) {
                const error = validateField('phone', limitedValue);
                setErrors(prev => ({ ...prev, phone: error }));
            }
        } else if (name === 'firstName' || name === 'lastName' || name === 'city') {
            // Only allow alphabets and spaces for name fields
            const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData({ ...formData, [name]: alphabeticValue });
        } else if (name === 'username') {
            // Only allow alphanumeric and underscore for username
            const usernameValue = value.replace(/[^a-zA-Z0-9_]/g, '');
            setFormData({ ...formData, [name]: usernameValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle field blur (when user leaves the field)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate the field when user leaves it
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleRoleChange = (selectedOptions: MultiValue<Option>) => {
        const roles = selectedOptions ? selectedOptions.map((option: Option) => option.value) : [];
        setSelectedRoles(selectedOptions as Option[]);
        setFormData({ ...formData, roles });

        // Clear error when user selects roles
        if (errors.roles) {
            setErrors({ ...errors, roles: undefined });
        }
        
        // Validate roles when user makes selection
        setTouched(prev => ({ ...prev, roles: true }));
        const error = validateField('roles', roles);
        setErrors(prev => ({ ...prev, roles: error }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const allFields = [
            'username', 'firstName', 'lastName', 'email', 'phone', 'city'
        ];

        // Add password validation only for new members
        if (!isEditing) {
            allFields.push('password');
        }

        // Validate all fields
        allFields.forEach(field => {
            const value = formData[field as keyof FormData];
            const error = validateField(field, value);
            if (error) {
                newErrors[field as keyof FormErrors] = error;
            }
        });

        // Validate roles separately
        const rolesError = validateField('roles', formData.roles);
        if (rolesError) {
            newErrors.roles = rolesError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Mark all fields as touched before validation
        const allFields = ['username', 'firstName', 'lastName', 'email', 'phone', 'city', 'roles'];
        if (!isEditing) {
            allFields.push('password');
        }
        
        const touchedFields: Record<string, boolean> = {};
        allFields.forEach(field => {
            touchedFields[field] = true;
        });
        setTouched(touchedFields);

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
            // Handle operation error
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
        setTouched({});
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
                    <div className="bg-indigo-100 p-1.5 rounded-full mr-3">
                        <RiShieldUserFill className="text-indigo-600 h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Username",
            accessor: (member: Member) => (
                <span className="text-sm font-medium text-gray-700">{member.username}</span>
            )
        },
        {
            header: "Status",
            accessor: (member: Member) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    member.enabled 
                        ? "text-emerald-700 bg-emerald-100" 
                        : "text-red-700 bg-red-100"
                }`}>
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
                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 font-medium"
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
                <div className="flex gap-1 justify-start">
                            {member.roles.includes('SUPERADMIN') ? (
                        <>
                                <button
                                    onClick={() =>
                                        toast.error("Cannot edit Super Admin member.",
                                            { autoClose: 3000, position: "top-center" }
                                        )}
                                className="p-1.5 text-gray-400 cursor-not-allowed rounded-md"
                                title="Edit disabled for Super Admin"
                                aria-disabled
                                >
                                <FaEdit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        toast.error("Cannot update password for Super Admin member.",
                                            { autoClose: 3000, position: "top-center" }
                                        )}
                                className="p-1.5 text-gray-400 cursor-not-allowed rounded-md"
                                title="Password update disabled for Super Admin"
                                aria-disabled
                                >
                                <TbLockPassword className="h-4 w-4" />
                                </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handleEdit(member)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Edit"
                            >
                                <FaEdit className="h-4 w-4" />
                            </button>
                                <button
                                    onClick={() => handleUpdatePassword(member)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                    title="Update Password"
                                >
                                <TbLockPassword className="h-4 w-4" />
                                </button>
                        </>
                            )}
                        </div>
            )
        }
    ];

    return (
        <>
            <div className="w-full bg-gray-50 p-4 rounded-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Lab Member Management</h1>
                            <p className="text-sm text-gray-600">Add and manage lab members</p>
                        </div>
                        <div className="flex items-center">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Form Section */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                    {isEditing ? (
                                        <FaEdit className="text-indigo-600 text-lg" />
                                    ) : (
                                        <FiUserPlus className="text-indigo-600 text-lg" />
                                    )}
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {isEditing ? "Edit Member" : "Add New Member"}
                                </h2>
                            </div>

                            {loading && (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Loader type="progress" fullScreen={false} text="Loading members..." />
                                    <p className="mt-3 text-sm text-gray-600">Please wait while we fetch the latest data.</p>
                                </div>
                            )}

                            {!loading && (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                                            <input
                                                className={`w-full p-2.5 border ${errors.username && touched.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                type="text"
                                                name="username"
                                                placeholder="Enter username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.username && touched.username && (
                                                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                                                <input
                                                    className={`w-full p-2.5 border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                    type="password"
                                                    name="password"
                                                    placeholder="Enter password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {errors.password && touched.password && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                                                <input
                                                    className={`w-full p-2.5 border ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="First name"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {errors.firstName && touched.firstName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                                                <input
                                                    className={`w-full p-2.5 border ${errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Last name"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {errors.lastName && touched.lastName && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                            <input
                                                className={`w-full p-2.5 border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                type="email"
                                                name="email"
                                                placeholder="user@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.email && touched.email && (
                                                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <input
                                                    className={`w-full p-2.5 border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="Enter phone number"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onKeyPress={(e) => {
                                                            // Prevent typing if already at max length (10 digits)
                                                            if (formData.phone.length >= 10) {
                                                                e.preventDefault();
                                                            }
                                                            // Only allow numeric characters
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        maxLength={10}
                                                    />
                                                    {errors.phone && touched.phone && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                    <input
                                                    className={`w-full p-2.5 border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                                        type="text"
                                                        name="city"
                                                        placeholder="Enter city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.city && touched.city && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Roles*</label>
                                                <Select
                                                    isMulti
                                                    isClearable={false}
                                                    isSearchable={false}
                                                    options={roleOptions}
                                                    value={selectedRoles}
                                                    onChange={handleRoleChange}
                                                    placeholder="Select roles..."
                                                className={`react-select-container ${errors.roles && touched.roles ? 'border-red-500 rounded-md' : ''}`}
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                        minHeight: '40px',
                                                            padding: '2px 8px',
                                                            border: errors.roles && touched.roles ? '1px solid #ef4444' : '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.1)' : 'none',
                                                            '&:hover': {
                                                                border: errors.roles && touched.roles ? '1px solid #ef4444' : '1px solid #9ca3af'
                                                            }
                                                        }),
                                                        valueContainer: (provided) => ({
                                                            ...provided,
                                                            padding: '0',
                                                        minHeight: '36px',
                                                            flexWrap: 'wrap',
                                                            gap: '4px'
                                                        }),
                                                        multiValue: (provided) => ({
                                                            ...provided,
                                                            margin: '0',
                                                        backgroundColor: '#e0e7ff',
                                                        borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        border: '1px solid #c7d2fe',
                                                            fontSize: '12px'
                                                        }),
                                                        multiValueLabel: (provided) => ({
                                                            ...provided,
                                                        color: '#4338ca',
                                                            fontSize: '12px',
                                                        padding: '3px 6px',
                                                            fontWeight: '500',
                                                            lineHeight: '1.2'
                                                        }),
                                                        multiValueRemove: (provided) => ({
                                                            ...provided,
                                                        color: '#4338ca',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                        borderRadius: '0 4px 4px 0',
                                                        padding: '3px 4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        fontSize: '12px',
                                                            '&:hover': {
                                                            backgroundColor: '#c7d2fe',
                                                            color: '#4338ca'
                                                            }
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            color: '#9ca3af',
                                                            margin: '0'
                                                        }),
                                                        input: (provided) => ({
                                                            ...provided,
                                                            margin: '0',
                                                            padding: '0',
                                                            display: 'none'
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                        backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f8fafc' : 'white',
                                                        color: state.isSelected ? '#4338ca' : '#374151',
                                                        padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            '&:hover': {
                                                            backgroundColor: state.isSelected ? '#e0e7ff' : '#f8fafc'
                                                            }
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            marginTop: '4px'
                                                        }),
                                                        menuList: (provided) => ({
                                                            ...provided,
                                                            padding: '4px 0',
                                                            maxHeight: '200px'
                                                        }),
                                                        indicatorsContainer: (provided) => ({
                                                            ...provided,
                                                            padding: '0 8px'
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#6b7280',
                                                            '&:hover': {
                                                                color: '#374151'
                                                            }
                                                        })
                                                    }}
                                                />
                                                {errors.roles && touched.roles && (
                                                <p className="mt-1 text-xs text-red-600">{errors.roles}</p>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                                                    <select
                                                        name="enabled"
                                                        value={formData.enabled ? "true" : "false"}
                                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.value === "true" })}
                                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                    >
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </div>
                                            )}

                                        <div className="flex gap-3 pt-3">
                                            <Button
                                                onClick={() => { }}
                                                type="submit"
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors"
                                                text={isEditing ? "Update Member" : "Add Member"}
                                                disabled={loading}
                                            >
                                                <FaUserPlus className="mr-2 h-4 w-4" />
                                            </Button>
                                            {isEditing && (
                                                <Button
                                                    type="button"
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-md text-sm transition-colors"
                                                    text="Cancel"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                />
                                            )}
                                        </div>
                                        </div>
                                </form>
                            )}
                        </div>

                        {/* Members List Section */}
                        <div className="xl:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                <div className="flex items-center">
                                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                        <FaUser className="text-indigo-600 text-lg" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Lab Members</h2>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} found
                                </div>
                            </div>

                            {loading && members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Loader type="progress" fullScreen={false} text="Loading lab members..." />
                                    <p className="mt-3 text-sm text-gray-600">Fetching the lab members, please wait...</p>
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-3">
                                        <FaUser className="mx-auto text-3xl" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-800 mb-1">No members found</h3>
                                    <p className="text-sm text-gray-600">
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