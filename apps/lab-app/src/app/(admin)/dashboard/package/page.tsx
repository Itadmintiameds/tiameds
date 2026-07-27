'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PackageCreation from '@/app/(admin)/component/package/Pakage';
import PackageList from '../../component/package/PackageList';
import Unauthorised from '../../component/Unauthorised';
import useAuthStore from '@/context/userStore';

const PackageContent = () => {
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') || 'packageList';

  switch (tab) {
    case 'package':
      return <PackageCreation />;

    case 'packageList':
      return <PackageList />;

    default:
      return <PackageList />;
  }
};

const Page = () => {
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSuperAdmin = roles.includes('SUPERADMIN');

  return (
    <div className="w-full p-4 bg-secondary-50">
      {isAdmin || isSuperAdmin ? (
        <Suspense fallback={<div>Loading...</div>}>
          <PackageContent />
        </Suspense>
      ) : (
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['TECHNICIAN', 'DESKROLE']}
          allowedRoles={['ADMIN']}
        />
      )}
    </div>
  );
};

export default Page;
