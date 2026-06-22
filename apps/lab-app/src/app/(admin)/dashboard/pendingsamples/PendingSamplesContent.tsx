'use client';

import { useSearchParams } from 'next/navigation';

import PendingTable from '../sample/_component/PendingTable';
import RecivedTable from '../sample/_component/RecivedTable';
import CompletedTable from '../sample/_component/CompletedTable';

const PendingSamplesContent = () => {
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') || 'pending';

  switch (tab) {
    case 'pending':
      return <PendingTable />;

    case 'collected':
      return <RecivedTable />;

    case 'partial':
      return <RecivedTable />;

    case 'completed':
      return <CompletedTable />;

    case 'configuration':
      return <RecivedTable />;

    default:
      return <PendingTable />;
  }
};

export default PendingSamplesContent;