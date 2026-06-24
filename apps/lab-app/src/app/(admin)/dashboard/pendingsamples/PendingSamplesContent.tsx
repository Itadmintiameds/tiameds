'use client';

import { useSearchParams } from 'next/navigation';

import PendingTable from '../sample/_component/PendingTable';
import RecivedTable from '../sample/_component/RecivedTable';
import CompletedTable from '../sample/_component/CompletedTable';
import CollectionTable from '../sample/_component/CollectionTable';
import CollectedSample from '../sample/_component/CollectedSample';

const PendingSamplesContent = () => {
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') || 'pending';

  switch (tab) {
    case 'pending':
      return <PendingTable />;

    case 'collected':
      return <CollectedSample />;

    case 'partial':
      return <CollectionTable />;

    case 'completed':
      return <CompletedTable />;

    case 'configuration':
      return <RecivedTable />;

    default:
      return <PendingTable />;
  }
};

export default PendingSamplesContent;