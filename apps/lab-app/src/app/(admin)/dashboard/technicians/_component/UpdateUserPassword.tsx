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
        <div className="max-w-md mx-auto p-6 ">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Update Password</h2>
            <p className="text-sm text-gray-600 mb-4">
                Update the password for <span className="font-semibold">{member.firstName} {member.lastName}</span>.
            </p>

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
                            className={`w-full p-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter new password (min 8 characters)"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => togglePasswordVisibility('new')}
                            aria-label={showPassword.new ? "Hide password" : "Show password"}
                        >
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
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
                            className={`w-full p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => togglePasswordVisibility('confirm')}
                            aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                        >
                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                <div className="pt-4 flex space-x-4">
                    <Button
                        text="Cancel"
                        onClick={() => setShowUpdatePassword(false)}
                        type="button"
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
                        disabled={loading}
                    />
                    <Button
                        text=""
                        type="submit"
                        onClick={()=>{}}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader />
                        ) : (
                            <>
                                <FaLock className="mr-2" />
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