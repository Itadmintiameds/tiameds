"use client";

import React, {useState } from "react";
import Image from "next/image";
import "../fonts/style.css";
import { itemSchema } from "@/schema/itemSchema";
import { ZodError } from "zod";
import { Item1 } from "@/types/ItemData";
import { createItem, itemDelete, updateItem } from "@/services/itemService";
import { toast } from "react-toastify";

interface ItemProps {
  closeModal: () => void;
  itemId?: number; // Make supplierId optional
  action?: string;
}

const Item: React.FC<ItemProps> = ({ closeModal, itemId, action }) => {
 
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [item, setitem] = useState<Item1>({
    itemName: "",
    purchaseUnit: "",
    unitType: "",
    manufacturer: "",
    purchasePrice: "",
    mrpSalePrice: "",
    purchasePricePerUnit: "",
    mrpSalePricePerUnit: "",
    gstPercentage: "",
    hsnNo: "",
    consumables: false,
  });

  

  const handleChange = (
    eve: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, type, value } = eve.target;

    const updatedValue =
      type === "checkbox" ? (eve.target as HTMLInputElement).checked : value;

    setitem((prevItem: Item1) => {
      const newItem = {
        ...prevItem,
        [name]: updatedValue,
      };

      // Additional logic for purchase price and unit calculations
      if (
        name === "purchaseUnit" ||
        name === "purchasePrice" ||
        name === "mrpSalePrice"
      ) {
        const purchaseUnit = parseInt(newItem.purchaseUnit);
        const purchasePrice = parseInt(newItem.purchasePrice);
        const mrpSalePrice = parseInt(newItem.mrpSalePrice);

        if (!isNaN(purchaseUnit) && !isNaN(purchasePrice) && purchaseUnit > 0) {
          newItem.purchasePricePerUnit = (
            purchasePrice / purchaseUnit
          ).toString();
        } else {
          newItem.purchasePricePerUnit = ""; // Reset if inputs are invalid
        }

        if (!isNaN(purchaseUnit) && !isNaN(mrpSalePrice) && purchaseUnit > 0) {
          newItem.mrpSalePricePerUnit = (
            mrpSalePrice / purchaseUnit
          ).toString();
        } else {
          newItem.mrpSalePricePerUnit = ""; // Reset if inputs are invalid
        }
      }

      return newItem;
    });
  };

  
  const addItem = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      itemSchema.parse(item);

      await createItem(item);
      toast.success("Item created successfully", {
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

  const onlyNumber = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const value = e.target.value;
    if (value.length <= 10) {
      handleChange(e);
    }
  };

  const deleteItem = async () => {
    if (!itemId) {
      alert("Item ID is required to delete.");
      return;
    }

    try {
      await itemDelete(itemId); // Call the delete service

      toast.success("Item deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      closeModal();
    } catch (error) {
      console.error("Error deleting Item:", error);
      toast.error("An error occurred while deleting the Item.");
    }
  };

  const editItem = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      
      if (!itemId) {
        alert("Item ID is required to update.");
        return;
      }
    
      try {
        await updateItem(itemId, item); // Use the service function to update supplier
    
        toast.success("Item updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
    
        closeModal();
      } catch (error) {
        console.error("Error updating supplier:", error);
        toast.error("An error occurred while updating the supplier.");
      }
    };

  

  const closeIcon = () => {
    closeModal();
  };

  
  return (
    <div className="outer_card">
      <header className="supplier_item_header">
        <div className="flex gap-4">
          <Image src="Tiameds_Logo.svg" alt="Logo" width={48} height={48} />
          <span className="text-2xl font-medium">Add New Item</span>
        </div>
        <Image
          src="Close_Icon.svg"
          alt="Close Icon"
          width={24}
          height={24}
          onClick={closeIcon}
          className="cursor-pointer"
        />
      </header>

      <main className="supplier_item_main">
        <span className="sub_heading_text">Item Details</span>

        <div className="my-3 mb-4 grid grid-cols-4 gap-4">
          <div className="inline-grid gap-1">
            <label htmlFor="itemName">Name</label>
            <input
              type="text"
              name="itemName"
              id="itemName"
              value={item.itemName as string}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              maxLength={50}
              className="supplier_item_input uppercase"
            />
            {validationErrors.supplierName && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.itemName}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="purchaseUnit">Purchase Unit</label>
            <input
              type="text"
              name="purchaseUnit"
              id="purchaseUnit"
              value={item.purchaseUnit}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              maxLength={5}
              className="supplier_item_input"
            />
            {validationErrors.purcahseUnit && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.purchaseUnit}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
          <label htmlFor="purchaseUnit">Unit Type</label>
            <select
              name="unitType"
              id="unitType"
              value={item.unitType as string}
              onChange={(e) => handleChange(e)}
              className="supplier_item_select"
            >
              <option value="">Select</option>
              <option value="Bottel">Bottel</option>
              <option value="Injection">Injection</option>
              <option value="Numbers">Numbers</option>
              <option value="Strips">Strips</option>
              <option value="Vial">Vial</option>
            </select>
            {validationErrors.unitType && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.unitType}
              </div>
            )}

          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              id="manufacturer"
              value={item.manufacturer as string}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              maxLength={50}
              className="supplier_item_input"
            />
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="purchasePrice">Purchase Price</label>
            <input
              type="number"
              name="purchasePrice"
              id="purchasePrice"
              value={item.purchasePrice}
              onChange={onlyNumber}
              placeholder="Enter here..."
              className="supplier_item_input"
            />
            {validationErrors.purchasePrice && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.purchasePrice}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="mrpSalePrice">MRP</label>
            <input
              type="number"
              name="mrpSalePrice"
              id="mrpSalePrice"
              value={item.mrpSalePrice}
              onChange={onlyNumber}
              placeholder="Enter here..."
              className="supplier_item_input"
            />
            {validationErrors.mrpSalePrice && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.mrpSalePrice}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="purchasePricePerUnit">
              Purchase Price Per Unit
            </label>
            <input
              type="number"
              name="purchasePricePerUnit"
              id="purchasePricePerUnit"
              value={item.purchasePricePerUnit}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              readOnly
              className="supplier_item_input"
            />
            {validationErrors.purchasePricePerUnit && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.purchasePricePerUnit}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="mrpSalePricePerUnit">Sale Price Per Unit</label>
            <input
              type="number"
              name="mrpSalePricePerUnit"
              id="mrpSalePricePerUnit"
              value={item.mrpSalePricePerUnit}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              readOnly
              className="supplier_item_input"
            />
            {validationErrors.mrpSalePricePerUnit && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.mrpSalePricePerUnit}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="gstPercentage">GST%</label>
            <select
              name="gstPercentage"
              id="gstPercentage"
              value={item.gstPercentage}
              onChange={(e) => handleChange(e)}
              className="supplier_item_select"
            >
              <option value="">Select</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>

            {validationErrors.gstPercentage && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.gstPercentage}
              </div>
            )}
          </div>

          <div className="inline-grid gap-1">
            <label htmlFor="hsnNo">HSN No.</label>
            <input
              type="text"
              name="hsnNo"
              id="hsnNo"
              value={item.hsnNo as string}
              onChange={(e) => handleChange(e)}
              placeholder="Enter here..."
              maxLength={20}
              className="supplier_item_input"
            />
            {validationErrors.hsnNo && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.hsnNo}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="consumables"
            id="Pharma Consumables"
            onChange={(e) => handleChange(e)}
            className="w-4 h-4 rounded focus:ring-2 focus:ring-inputBorder focus:border-transparent outline-none"
          />
          <label htmlFor="consumables"> Pharma Consumables</label>
        </div>
      </main>

      <footer className="space-x-5">
        {action === "itemEdit" && (
          <button className="button_purple" onClick={editItem}>
            Save
          </button>
        )}
        {action === "itemDelete" && (
          <button className="button_red" onClick={deleteItem}>
            Delete
          </button>
        )}
        {!itemId && (
          <button onClick={addItem} className="button_purple ">
            Add Item
          </button>
        )}
      </footer>
    </div>
  );
};

export default Item;
