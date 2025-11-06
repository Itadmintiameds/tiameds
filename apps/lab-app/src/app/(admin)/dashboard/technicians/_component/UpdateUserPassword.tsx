import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
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
        <div className="max-w-md mx-auto p-4">
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Update Password</h2>
                <p className="text-sm text-gray-600">
                    Update the password for <span className="font-medium text-gray-800">{member.firstName} {member.lastName}</span>.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword.new ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={handleChangePassword}
                            className={`w-full p-2.5 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword.confirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChangePassword}
                            className={`w-full p-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
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

                <div className="pt-3 flex gap-3">
                    <Button
                        text="Cancel"
                        onClick={() => setShowUpdatePassword(false)}
                        type="button"
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-sm transition-colors"
                        disabled={loading}
                    />
                    <Button
                        text=""
                        type="submit"
                        onClick={()=>{}}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center text-sm transition-colors"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader />
                        ) : (
                            <>
                                <FaLock className="mr-2 h-4 w-4" />
                                Update Password
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UpdateUserPassword;