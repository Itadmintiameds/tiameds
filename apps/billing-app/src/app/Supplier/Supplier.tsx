"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import '../globals.css'; 
import '../fonts/style.css'; 
import { supplierSchema } from '@/schema/supplierSchema';
import { ZodError } from 'zod';
import { createSupplier, getSupplier,  supplierDelete, updateSupplier } from '@/services/supplierService';
import { toast } from 'react-toastify';
import { Supplier1 } from '@/types/SupplierData';


interface SupplierProps {
  closeModal: () => void; 
  supplierId?: number | null; // Make supplierId optional
  action?: string | null;
}

const Supplier: React.FC<SupplierProps> = ({ closeModal, supplierId, action}) => {
  // const Supplier_Fetch1 = "http://localhost:8080/api/v1/pharma/supplier/getAll"; 

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
 const [supplier, setsupplier] = useState<Supplier1>({
    supplierName:"",
    supplierMobile:0,
    supplierEmail:"",
    supplierGstinNo:"",
    supplierGstType:"",
    supplierAddress:"",
  });

  const closeIcon = () => {
    
    console.log("Closing modal...");
    closeModal();
    
  };
  
useEffect(() => {
  const fetchSupplierDetails = async () => {
    if ((action === "supplierEdit" || action === "supplierDelete") && supplierId) {
      try {
        const suppliers: Supplier1[] = await getSupplier(); // Fetch all suppliers
        const supplierData: Supplier1 | undefined = suppliers.find(supplier => supplier.supplierId === supplierId);

        if (!supplierData) {
          throw new Error('Supplier not found');
        }

        setsupplier(supplierData);
      } catch (error) {
        console.error(error);
        alert('Unable to fetch supplier details.');
      }
    }
  };

  fetchSupplierDetails();
}, [action, supplierId]);

  
   const handleChange = (eve: React.ChangeEvent<HTMLInputElement  | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = eve.target.value;
    setsupplier({...supplier, [eve.target.name]: value });
   }

  //  const checkSupplierExists = async () => {
  //   try {
  //     const response = await fetch(`${Supplier_Fetch1}`); // Get all suppliers
  //     if (!response.ok) {
  //       throw new Error("Failed to check existing suppliers");
  //     }
      
  //     const suppliers: Supplier1[] = await response.json();
      
  //     // Check for duplicates based on Name, Mobile, or Email
  //     const existingSupplier = suppliers.find(
  //       (sup: Supplier1) => 
  //         sup.supplierName.toLowerCase() === supplier.supplierName.toLowerCase() 
          
  //     );
  
  //     return existingSupplier ? true : false;
  
  //   } catch (error) {
  //     console.error("Error checking supplier:", error);
  //     return false;
  //   }
  // };

  
const addSupplier = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});

    try {
       supplierSchema.parse(supplier);

    await createSupplier(supplier);
            toast.success("Supplier created successfully", {
              position: "top-right",
              autoClose: 3000,
            });

      closeModal();

    } catch (error) {
      if (error instanceof ZodError) {
        // Collect all validation errors and store them in state
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });
  
        setValidationErrors(formattedErrors); // Update state to show messages
      } else if (error instanceof Error) {
        console.error("Unexpected Error:", error.message);
      } else {
        console.error("Unknown error occurred", error);
      }
  } 
};
  

  const onlyNumber = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e); 
    }
  };
  
  const deleteSupplier = async () => {
    if (!supplierId) {
      alert("Supplier ID is required to delete.");
      return;
    }
  
    try {
      await supplierDelete(supplierId); // Call the delete service
  
      toast.success("Supplier deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
  
      closeModal();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("An error occurred while deleting the supplier.");
    }
  };


  const editSupplier = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    if (!supplierId) {
      alert("Supplier ID is required to update.");
      return;
    }
  
    try {
      await updateSupplier(supplierId, supplier); // Use the service function to update supplier
  
      toast.success("Supplier updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
  
      closeModal();
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("An error occurred while updating the supplier.");
    }
  };
  
  
  return (
    <div className="outer_card">
      <header className="supplier_item_header">
        <div className="flex gap-4">
          <Image src="Tiameds_Logo.svg" alt="Logo" width={48} height={48} />
          <span className="heading_text">Add New Supplier</span>
        </div>
        <Image src="Close_Icon.svg" alt="Close Icon" width={24} height={24} onClick={closeIcon} className='cursor-pointer'/>
      </header>

      <main className="supplier_item_main">
        <span className="sub_heading_text">Supplier Details</span>

        <div className="grid grid-cols-4 gap-6">
          <div className="inline-grid gap-1">
            <label htmlFor="supplierName" >Name</label>
            <input type="text" name="supplierName" id="supplierName" value={supplier.supplierName} onChange={(e) => handleChange(e)} placeholder="Enter here..." maxLength={50} className="supplier_item_input" />
            {validationErrors.supplierName && (
                <div className="text-red-500 text-sm mt-1">{validationErrors.supplierName}</div>
              )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="supplierMobile" >Contact No.</label>
            <input type="number" name="supplierMobile" id="supplierMobile" value={supplier.supplierMobile} onChange={onlyNumber} placeholder="Enter here..." className="supplier_item_input" />
            {validationErrors.supplierMobile && (
             <div className="text-red-500 text-sm mt-1">{validationErrors.supplierMobile}</div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="supplierGstinNo" >GSTIN No.</label>
            <input type="text" name="supplierGstinNo" id="supplierGstinNo" value={supplier.supplierGstinNo} onChange={(e) => handleChange(e)} placeholder="Enter here..." maxLength={20} className="supplier_item_input" />
            {validationErrors.supplierGstinNo && (
               <div className="text-red-500 text-sm mt-1">{validationErrors.supplierGstinNo}</div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="supplierGstType" >GST Type</label>
            <select name="supplierGstType" id="supplierGstType" value={supplier.supplierGstType} onChange={(e) => handleChange(e)} className="supplier_item_select" >
              <option value="" disabled>Select</option>
              <option value="CGST">CGST</option>
              <option value="SGST">SGST</option>
              <option value="CGST+SGST">CGST+SGST</option>
            </select>
            {validationErrors.supplierGstType && (
               <div className="text-red-500 text-sm mt-1">{validationErrors.supplierGstType}</div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="supplierEmail" >Email</label>
            <input type="text" name="supplierEmail" id="supplierEmail" value={supplier.supplierEmail} onChange={(e) => handleChange(e)} placeholder="Enter here..." maxLength={50} className="supplier_item_input"  />
          </div>
        </div>

        <div className="inline-grid gap-1">
          <label htmlFor="supplierAddress" >Address</label>
          <textarea cols={188} rows={4}  name="supplierAddress" id="supplierAddress" value={supplier.supplierAddress} onChange={(e) => handleChange(e)} placeholder="Enter here..." maxLength={500} className="supplier_textarea" ></textarea>
        </div>
      </main>

<footer className="space-x-5">
        {action === "supplierEdit" && <button className="button_purple" onClick={editSupplier}>Save</button>}
        {action === "supplierDelete" && <button className="button_red" onClick={deleteSupplier}>Delete</button>}
        {!supplierId && <button className="button_purple w-36"onClick={addSupplier}>Add Supplier</button>}
      </footer>
    </div>
  
);
};


export default Supplier