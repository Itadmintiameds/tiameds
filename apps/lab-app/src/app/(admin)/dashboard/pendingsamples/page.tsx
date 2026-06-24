'use client';

import React, { Suspense } from 'react';
import useAuthStore from '@/context/userStore';
import Unauthorised from '../../component/Unauthorised';
import PendingSamplesContent from './PendingSamplesContent';

const Page = () => {
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];

  const isAllowed =
    roles.includes('SUPERADMIN') ||
    roles.includes('ADMIN') ||
    roles.includes('TECHNICIAN');

  if (!isAllowed) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['DESKROLE']}
          allowedRoles={['SUPERADMIN', 'ADMIN', 'TECHNICIAN']}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-info-50">
      <div className="p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <PendingSamplesContent />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;








// code is working good , if error  please use this one

// 'use client';

// import React from 'react';
// import useAuthStore from '@/context/userStore';
// import Unauthorised from '../../component/Unauthorised';
// import PendingTable from '../sample/_component/PendingTable';
// import { useSearchParams } from 'next/navigation';
// import RecivedTable from '../sample/_component/RecivedTable';
// import CompletedTable from '../sample/_component/CompletedTable';



// const Page = () => {
//   const { user: loginedUser } = useAuthStore();

//   const roles = loginedUser?.roles || [];

//   const isSuperAdmin = roles.includes('SUPERADMIN');
//   const isAdmin = roles.includes('ADMIN');
//   const isTechnician = roles.includes('TECHNICIAN');

//   const isAllowed = isSuperAdmin || isAdmin || isTechnician;
//   const searchParams = useSearchParams();

// const tab = searchParams.get('tab') || 'pending';

// const renderContent = () => {
//   switch (tab) {
//     case 'pending':
//       return <PendingTable />;

//     case 'collected':
//       return <RecivedTable />;

//     case 'partial':
//       return <RecivedTable />;

//     case 'completed':
//       return <CompletedTable />;

//     case 'configuration':
//       return <RecivedTable />;

//     default:
//       return <PendingTable />;
//   }
// };

//   if (!isAllowed) {
//     return (
//       <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
//         <Unauthorised
//           username={loginedUser?.username || ''}
//           currentRoles={roles}
//           notallowedRoles={['DESKROLE']}
//           allowedRoles={['SUPERADMIN', 'ADMIN', 'TECHNICIAN']}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-info-50">

//       <div className="p-6">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Page;