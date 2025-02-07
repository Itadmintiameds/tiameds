"use client";

import React, { useEffect, useState } from 'react';
import '../fonts/style.css'; 
import Image from 'next/image';
import Modal from './Modal';
import Supplier from '../Supplier/Supplier';
import { getSupplier } from '@/services/supplierService';

interface Supplier {
    supplierId: number; 
    supplierName: string;
    supplierMobile: number;
    supplierEmail: string;
    supplierGstType: string;
    supplierGstinNo: string;
}

const SupplierList = () => {

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
    const [modalAction, setModalAction] = useState<string | null>(null);

   
    const openModal = (supplierId: number, action: string) => {
      setIsModalOpen(true);
      setSelectedSupplierId(supplierId); // Set the supplierId being edited
      setModalAction(action); // Store the action (like 'supplierEdit')
    };
      
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedSupplierId(null);
    };

    const fetchSuppliers = async (): Promise<Supplier[]> => {
      try {
        const suppliers = await getSupplier();
        return suppliers;
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        return [];
      }
    };
    
    
    useEffect(() => {
        const loadSuppliers = async () => {
          const data = await fetchSuppliers();
          setSuppliers(data);
        };
        loadSuppliers();
      }, []);

    return (
      <>
        <main>
          <span className='heading_text'>
            Supplier List
          </span>
          <div>
            <table className="purchase_table">
              <thead>
                <tr className='purchase_table_tr'>
                  <td className="rounded-tl-lg rounded-bl-lg px-2">Supplier Name</td>
                  <td>Contact Number</td>
                  <td>Email</td>
                  <td>GST Type</td>
                  <td>GSTIN No</td>
                  <td className="rounded-tr-lg rounded-br-lg">
                    <Image src="Action_Icon2.svg" alt="Action Icon" width={16} height={16} />
                  </td>

                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <tr key={supplier.supplierId}>
                      <td>{supplier.supplierName}</td>
                      <td>{supplier.supplierMobile}</td>
                      <td>{supplier.supplierEmail}</td>
                      <td>{supplier.supplierGstType}</td>
                      <td>{supplier.supplierGstinNo}</td>
                      
          <td>
          <ul className="flex gap-10 content-center items-center text-lg font-light">
          <li className={`relative group cursor-pointer`} >
              <div className="group-hover:hidden"><Image src="Action_Icon.svg" alt="Action Icon" width={16} height={16}/></div>
              <ul className="navbar_dropdown">
                <li className="dropdown_list cursor-pointer" onClick={() => openModal(supplier.supplierId, "supplierEdit")}> Edit</li>
                <li className="dropdown_list cursor-pointer" onClick={() => openModal(supplier.supplierId, "supplierDelete")} > Delete</li>
              </ul>
          </li>
          </ul>
          </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <Supplier closeModal={closeModal} supplierId={selectedSupplierId} action={modalAction}/>
      </Modal>
        </main>


      </>
    );
};

export default SupplierList;
