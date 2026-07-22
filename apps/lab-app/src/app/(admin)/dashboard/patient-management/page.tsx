'use client';

import useAuthStore from '@/context/userStore';
import Unauthorised from '@/app/(admin)/component/Unauthorised';
import PatientDashboard from '@/app/(admin)/component/patientDashboard/PatientDashboard';

const Page = () => {
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isAllowed = roles.includes('SUPERADMIN') || roles.includes('ADMIN');

  if (!isAllowed) {
    return (
      <Unauthorised
        username={loginedUser?.username || ''}
        currentRoles={roles}
        allowedRoles={['ADMIN', 'SUPERADMIN']}
      />
    );
  }

  return (
    <div className="p-4 bg-secondary-50">
      <PatientDashboard />
    </div>
  );
};

export default Page;
