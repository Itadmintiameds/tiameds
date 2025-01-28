import React, { useEffect } from 'react'
import { billing } from '@/../services/billing'
import { useLabs } from '@/context/LabContext';
import TableComponent from '../../../common/TableComponent';

const BillingList = () => {
  const [billingData, setBillingData] = React.useState([]);

  const { currentLab } = useLabs();

  const fetchBilling = async () => {
    try {
      if (currentLab?.id !== undefined) {
        const response = await billing(currentLab.id);
        console.log(response);
        setBillingData(response?.data);
      } else {
        console.log('Current lab ID is undefined');
      }
    } catch (error: unknown) {
      console.log(error);
    }
  }

  useEffect(()=>{
    fetchBilling()

  },[])


  console.log(billingData, 'billingData');

  return (
    <>
    <div className="flex flex-col mt-4">
      <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
      <TableComponent
        data={billingData}
        columns={[
          { header: 'Invoice ID', accessor: 'invoice_id' },
          { header: 'Date', accessor: 'date' },
          { header: 'Amount', accessor: 'amount' },
          { header: 'Status', accessor: 'status' },
        ]}
        noDataMessage="No billing data available"
      />

    </div>

    
    </>
  )
}

export default BillingList