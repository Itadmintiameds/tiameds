import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaTimes, FaKey } from 'react-icons/fa';
import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from "@/context/LabContext";
import { resetMemberPassword } from '../../../../../../services/technicianServices';

interface Member {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    phone?: string;
    city?: string;
    status?: 'active' | 'inactive';
    enabled?: boolean;
}

interface UpdateUserPasswordProps {
    member: Member;
    setShowUpdatePassword: (show: boolean) => void;
}


const UpdateUserPassword = ({ member, setShowUpdatePassword }: UpdateUserPasswordProps) => {
    const [loading, setLoading] = useState(false);
    const { currentLab } = useLabs();
    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            newPassword: '',
            confirmPassword: ''
        };

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
            valid = false;
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
            valid = false;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            valid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            if (!currentLab || !member.id) {
                toast.error('Lab or member information is missing');
                return;
            }

            const response = await resetMemberPassword(
                Number(currentLab.id), 
                Number(member.id), 
                formData.newPassword,
                formData.confirmPassword
            );
            
            if (response.error) {
                toast.error(response.error);
                return;
            }
            
            setFormData({
                newPassword: '',
                confirmPassword: ''
            });
            setShowUpdatePassword(false);

            toast.success('Password updated successfully', { autoClose: 2000 });
        } catch (error) {
            // Handle password update error
            toast.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-full mx-auto ">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Update Password</h2>
                    <p className="text-sm text-gray-600">
                        Update the password for <span className="font-medium text-gray-800">{member.firstName} {member.lastName}</span>.
                    </p>
                </div>
                <button
                    onClick={() => setShowUpdatePassword(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                    title="Close"
                >
                    <FaTimes className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Information Section */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-3">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <FaKey className="mr-2 text-blue-600" /> Password Information
                    </h4>
                    
                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={handleChangePassword}
                                className={`w-full p-2.5 border ${errors.newPassword ? 'border-red-500' : 'border-blue-300'} rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm`}
                                placeholder="Enter new password (min 8 characters)"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => togglePasswordVisibility('new')}
                                aria-label={showPassword.new ? "Hide password" : "Show password"}
                            >
                                {showPassword.new ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChangePassword}
                                className={`w-full p-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-blue-300'} rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm`}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => togglePasswordVisibility('confirm')}
                                aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                            >
                                {showPassword.confirm ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex gap-3">
                    <button
                        onClick={() => setShowUpdatePassword(false)}
                        type="button"
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaTimes className="h-4 w-4 inline mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                        }}
                    >
                        {loading ? (
                            <Loader />
                        ) : (
                            <>
                                <FaLock className="h-4 w-4" />
                                Update Password
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateUserPassword;