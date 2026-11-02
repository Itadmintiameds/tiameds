'use client';

import React from 'react';
import Unauthorised from '../../component/Unauthorised';
import useAuthStore from '@/context/userStore';
import LabList from '../../component/lab/LabList';

const Page = () => {
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isSuperAdmin = roles.includes('SUPERADMIN');

  // Lab list and lab creation are Super Admin only
  if (!isSuperAdmin) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['ADMIN', 'TECHNICIAN', 'DESKROLE']}
          allowedRoles={['SUPERADMIN']}
        />
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-secondary-50">
      <LabList />
    </div>
  );
};

export default Page;
