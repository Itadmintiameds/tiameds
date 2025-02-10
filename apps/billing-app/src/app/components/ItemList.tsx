"use client";

import React, { useEffect, useState } from 'react';
import '../fonts/style.css'; 
import Image from 'next/image';
import Modal from './Modal';
import Item from '../Item/Item';
import { getItem } from '@/services/itemService';

interface Item1 {
  itemId: number; 
  itemName: string;
  purchasePrice: number;
  mrpSalePrice: number;
  gstPercentage: number;
  hsnNo: string;
}

const ItemList = () => {

  const [items, setItems] = useState<Item1[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [modalAction, setModalAction] = useState<string>();
  
  const openModal = (itemId: number, action: string) => {
    setIsModalOpen(true);
    setSelectedItemId(itemId); // Set the supplierId being edited
    setModalAction(action); // Store the action (like 'supplierEdit')
  };
    
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(0);
  };


  // const fetchItems = async (): Promise<Item1[]> => {
  //     try {
  //       const response = await fetch(Fetch_Item); 
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch items');
  //       }
  //       return response.json();
  //     } catch (error) {
  //       console.error(error);
  //       return [];
  //     }
  //   };

  const fetchItems = async (): Promise<Item1[]> => {
    try {
      const items = await getItem();
      return items;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };
  
  useEffect(() => {
      const loadItems = async () => {
        const data = await fetchItems();
        setItems(data);
      };
      loadItems();
    }, []);


  return (
    <>
    <main>
      <span className='heading_text'>
        Item List
      </span>
      <div>
        <table className="purchase_table">
          <thead>
            <tr className='purchase_table_tr'>
              <td className="rounded-tl-lg rounded-bl-lg px-2">Item Name</td>
              <td>Purcahse Price</td>
              <td>MRP</td>
              <td>GST </td>
              <td>HSN No</td>
              <td className="rounded-tr-lg rounded-br-lg">
                <Image src="Action_Icon2.svg" alt="Action Icon" width={16} height={16} />
              </td>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.itemId}>
                  <td>{item.itemName}</td>
                  <td>{item.purchasePrice}</td>
                  <td>{item.mrpSalePrice}</td>
                  <td>{item.gstPercentage}</td>
                  <td>{item.hsnNo}</td>
                  
                  <td>
              <ul className="flex gap-10 content-center items-center text-lg font-light">
                  <li className={`relative group cursor-pointer`} >
                      <div className="group-hover:hidden"><Image src="Action_Icon.svg" alt="Action Icon" width={16} height={16}/></div>
                      <ul className="navbar_dropdown">
                        <li className="dropdown_list cursor-pointer" onClick={() => openModal(item.itemId, "itemEdit")}> Edit</li>
                        <li className="dropdown_list cursor-pointer" onClick={() => openModal(item.itemId, "itemDelete")} > Delete</li>
                      </ul>
                  </li>
              </ul>
      </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <Item closeModal={closeModal} itemId={selectedItemId} action={modalAction}/>
      </Modal>

      
    </main>
  </>
  )
}

export default ItemList