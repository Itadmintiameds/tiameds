'use client';

import { useEffect } from 'react';
// import useUserStore from '../../../../context/userStore';
import useUserStore from '@/context/userStore';
import { motion } from 'framer-motion'; // Import Framer Motion
import { FaChalkboardTeacher, FaCheckCircle, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaTimesCircle, FaUserAlt, FaUserEdit } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import Loader from '../../component/common/Loader';
import { LoginResponseData } from '@/types/auth';


const ProfilePage = () => {
    const { user } = useUserStore();

    const formatAddress = (user: LoginResponseData | null) => {
        const addressParts = [
            user?.address,
            user?.city,
            user?.state,
            user?.zip,
            user?.country
        ].filter(part => part && part.trim() !== '');
        
        return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';
    };

    useEffect(() => {
        if (user) {
            console.log('User data from store:', user);
        }
    }, [user]);

    if (!user) return <Loader />;

    return (
        <div className="min-h-screen">
            <motion.div
                className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center space-x-6">
                    <motion.div
                        className="w-32 h-32 rounded-full bg-primary text-white text-4xl flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        {user?.firstName[0].toUpperCase()}{user?.lastName[0].toUpperCase()}
                    </motion.div>

                    <div>
                        <h1 className="text-4xl font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-lg text-gray-600 mt-2">{user?.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            <FaUserAlt className="inline mr-2" /> {user?.roles?.join(', ') || 'No Roles'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h2 className="text-2xl font-semibold text-gray-700">Contact Information</h2>
                        <div className="text-gray-600 mt-4 space-y-3">
                            <p className="flex items-center"><FaPhoneAlt className="mr-3 text-primary" /> {user?.phone}</p>
                            <p className="flex items-center"><FaEnvelope className="mr-3 text-primary" /> {user?.email}</p>
                            <p className="flex items-center"><FaMapMarkerAlt className="mr-3 text-primary" /> {formatAddress(user)}</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        initial={{ x: 100 }}
                        animate={{ x: 0 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h2 className="text-2xl font-semibold text-gray-700">Additional Information</h2>
                        <div className="text-gray-600 mt-4 space-y-3">
                            <p className="flex items-center"><FaCheckCircle className="mr-3 text-green-500" /> Verified: {user?.is_verified ? 'Yes' : 'No'}</p>
                            <p className="flex items-center"><FaTimesCircle className="mr-3 text-red-500" /> Enabled: {user?.enabled ? 'Yes' : 'No'}</p>
                        </div>
                    </motion.div>
                </div>
                <div className="mt-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700">Roles</h2>
                        <motion.div
                            className="flex flex-wrap mt-4 space-x-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            {user?.roles?.map((role, index) => (
                                <motion.span
                                    key={index}
                                    className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <IoIosArrowForward className="mr-2" /> {role}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">Modules</h2>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            {user?.modules?.map((module, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-blue-50 p-4 rounded-lg shadow-md hover:bg-blue-100 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    <div className="flex items-center">
                                        <FaChalkboardTeacher className="text-blue-500 mr-3" />
                                        <span className="font-medium text-gray-700">Module {index + 1}: {module.name}</span>
                                    </div>
                                    <p className="mt-2 text-gray-500 text-sm">This module helps in {module.name.toLowerCase()} related tasks.</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <motion.button
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <FaUserEdit className="inline mr-2" />
                        Edit
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;

