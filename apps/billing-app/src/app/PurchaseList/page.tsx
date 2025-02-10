"use client";

import React, { useEffect, useState } from 'react'
import '../fonts/style.css'; 
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { getPurchase } from '@/services/purchaseService';
import { toast } from 'react-toastify';
import LogNewProcurement from '../LogNewProcurement/page';
import { getSupplierById } from '@/services/supplierService';


interface purchase {
  invId: number;
  supplierId: string;
  purchaseDate: string; // or Date if it's directly parsed as Date
  purchaseBillNo: string;
  batchNo: string;
  grandTotal: number;
  paymentStatus: string;
  goodStatus: string;
  supplierName?: string;
}


const PurchaseList = () => {
  const router = useRouter();

  const [purchases, setPurchases] = useState<purchase[]>([]);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Added state for search query
  const [showProcurementForm, setShowProcurementForm] = useState(false); // New state for form visibility


  const fetchSupplier = async (supplierId: string): Promise<string> => {
    try {
      const supplier = await getSupplierById(Number(supplierId)); // Convert supplierId to number
      return supplier.supplierName;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      return "Unknown Supplier"; // Default value in case of failure
    }
  };
  

  
// Fetch purchases and supplier names through service
useEffect(() => {
  const fetchPurchasesWithSuppliers = async () => {
    try {
      const response = await getPurchase();
      if (response?.status !== 'success') {
        throw new Error(response?.message || 'Failed to fetch purchases');
      }

      const purchases: purchase[] = response.data;

      // Fetch supplier names for each purchase
      const purchasesWithSuppliers = await Promise.all(
        purchases.map(async (purchase) => {
          const supplierName = await fetchSupplier(purchase.supplierId);
          return { ...purchase, supplierName };
        })
      );

      setPurchases(purchasesWithSuppliers); // Update state with enriched data
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
    }
  };

  fetchPurchasesWithSuppliers();
}, []);


  // Restore state from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("searchQuery");
    const row = params.get("activeRow");

    if (query) setSearchQuery(query);
    if (row) setActiveRow(Number(row));
  }, []);
  
  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filtered purchases based on search query
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.purchaseBillNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.grandTotal.toString().includes(searchQuery) ||
      new Date(purchase.purchaseDate).toLocaleDateString().includes(searchQuery)
  );
  
    const handleDelete = (invId: number) => {
      router.push(`/DeleteView?invId=${invId}&action=delete&searchQuery=${searchQuery}&activeRow=${activeRow}`);
    };
  
    const handleView = (invId: number) => {
      router.push(`/DeleteView?invId=${invId}&action=view&searchQuery=${searchQuery}&activeRow=${activeRow}`);
    };

    const newProcurement = () => {
      // router.push('/LogNewProcurement'); 
      setShowProcurementForm(true);
    };

  return (
    <>
{!showProcurementForm ? 
    
    <main>
          <span className='heading_text'>
               Procurement List
          </span>

          <div className='search'>
            <div className='space-x-4'>
                <input type="text" name='search' className="input_search" placeholder='Search table...' value={searchQuery} onChange={handleSearch}/>
                {/* <button className='button_filter'>Filter</button> */}
            </div>
            <div>
               <button className='button_log' onClick={newProcurement}> Log New Procurement</button>
            </div>
          </div>

          <div>
        <table className="purchase_table">
          <thead >
            <tr className='purchase_table_tr'>
              <td className="rounded-tl-lg rounded-bl-lg px-2">Supplier Name</td>
              <td>Purchase Date</td>
              <td>Bill No</td>
              {/* <td>Batch No</td> */}
              <td>Bill Amount</td>
              <td>Payment Status</td>
              <td>Goods Status</td>
              <td className="rounded-tr-lg rounded-br-lg"><Image src="Action_Icon2.svg" alt="Action Icon" width={16} height={16}/></td>
            </tr>
          </thead>

          <tbody>
        {filteredPurchases.map((purchase) => (
          <tr key={purchase.invId}>
            <td className='px-2'>{purchase.supplierName}</td>
            <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
            <td>{purchase.purchaseBillNo}</td>
            {/* <td>{purchase.batchNo}</td> */}
            <td>{purchase.grandTotal}</td>
            <td><button className='text-colorWarning bg-buttonWarning h-7 w-20 rounded-3xl'>{purchase.paymentStatus}</button></td>
            <td className='text-colorSuccess'>{purchase.goodStatus}</td>
            
            <td>
            
          <ul className="flex gap-10 content-center items-center text-lg font-light">
          <li className={`relative group cursor-pointer`} >
              <div className="group-hover:hidden"><Image src="Action_Icon.svg" alt="Action Icon" width={16} height={16}/></div>
              <ul className="navbar_dropdown">
                <li className="dropdown_list cursor-pointer" onClick={() => handleView(purchase.invId)}> View</li>
                <li className="dropdown_list cursor-pointer" onClick={() => handleDelete(purchase.invId)}> Delete</li>
              </ul>
          </li>
          </ul>            
          </td>
          </tr>
        ))}
      </tbody>
    </table>

      </div>
    </main>
   : '' }
    <main>
    {showProcurementForm && (
                <LogNewProcurement />
      )}
    </main>
    </>
  )
}

export default PurchaseList

