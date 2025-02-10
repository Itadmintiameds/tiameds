"use client";

import { checkBillNoExists, createPurchase } from "@/services/purchaseService";
import { PurchaseData } from "@/types/PurchaseData";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { z } from "zod";
import Modal from "../components/Modal";
import "../fonts/style.css";
import Item from "../Item/Item";
import Supplier from "../Supplier/Supplier";
import { getSupplier } from "@/services/supplierService";
import { getItem, getItemById } from "@/services/itemService";

type Supplier = {
  supplierId: number;
  supplierName: string;
};

type Item1 = {
  itemId: string;
  itemName: string;
  unitType: string;
  batchNo: string;
  packageQuantity: number;
  expiryDate: string;
  purchasePrice: number;
  mrpSalePrice: number;
  gstPercentage: number;
  gstAmount: number;
  discount: number;
  amount: number;
};

type PurchaseRow = {
  selectedItem: number;
  batchNo: string;
  packageQuantity: number;
  expiryDate: string;
  purchasePrice: number;
  mrpSalePrice: number;
  gstPercentage: number;
  gstAmount: number;
  discount: number;
  amount: number;
  searchQueryItem?: string; // Add this property for row-specific search queries
  filteredItemList?: Item1[]; // Add this property for row-specific filtered item lists
};


interface FormErrors {
  [key: string]: string;
}

const Purchase = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<"Supplier" | "Item" | null>(
    null
  );

  const [supplierList, setSupplierList] = useState<Supplier[]>([]); // List of suppliers
  // const [selectedSupplier, setSelectedSupplier] = useState(""); // Selected supplier ID
  const [, setSelectedSupplier] = useState(""); // Selected supplier ID
  const [filteredSupplierList, setFilteredSupplierList] = useState<Supplier[]>(
    []
  ); // Filtered suppliers based on search
  const [searchQuery, setSearchQuery] = useState(""); // Search query input

  const [items, setItems] = useState<Item1[]>([]);
  // const [filteredItemList, setFilteredItemList] = useState<Item1[]>([]);
  const [, setFilteredItemList] = useState<Item1[]>([]);
  //const [errors, setErrors] = useState<Partial<Record<keyof PurchaseData, string>>>({});
  const [, setErrors] = useState<Partial<Record<keyof PurchaseData, string>>>(
    {}
  );

  
  const fetchSuppliers = async () => {
    try {
      const data: Supplier[] = await getSupplier(); // Fetch data
      console.log("Fetched Suppliers:", data); // Log response for debugging
  
      if (!data || data.length === 0) {
        console.warn("No suppliers found in the response.");
        return;
      }
  
      setSupplierList(data);
      setFilteredSupplierList(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };
  
  

  // Fetch supplier list on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);


  const fetchItems = async () => {
    try {
      const data: Item1[] = await getItem(); // Use service function
      console.log("Fetched Items:", data); // Debugging log
  
      if (!data || data.length === 0) {
        console.warn("No items found in the response.");
        return;
      }
  
      setItems(data); // Update items state
      setFilteredItemList(data); // Initialize filtered list
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };
  

  // Fetch item list on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setPurchaseRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        filteredItemList: row.searchQueryItem
          ? items.filter((item) =>
              item.itemName
                .toLowerCase()
                .includes(row.searchQueryItem?.toLowerCase() || "")
            )
          : items, // Reset to all items if query is empty
      }))
    );
  }, [items]);

  const openModal = (content: "Supplier" | "Item") => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    fetchSuppliers();
    fetchItems();
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === "") {
      setFilteredSupplierList(supplierList); // Show all suppliers if query is empty
    } else {
      const filtered = supplierList.filter((supplier) =>
        supplier.supplierName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSupplierList(filtered); // Update filtered list based on search query
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier.supplierId.toString()); // Set the selected supplier ID
    setSearchQuery(supplier.supplierName); // Set the supplier name in the search query (input field)
    setFilteredSupplierList([]); // Hide suggestions after selecting
    setFormData((prev) => ({
      ...prev,
      selectedSupplier: supplier.supplierName, // Add supplier name for display purposes
      supplierId: supplier.supplierId, // Set supplier ID
    }));
  };

  const handleSearchChangeItem = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const query = e.target.value;

    // Update the corresponding row with the search query and filtered list
    setPurchaseRows((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              searchQueryItem: query,
              filteredItemList: query
                ? items.filter((item) =>
                    item.itemName.toLowerCase().includes(query.toLowerCase())
                  )
                : items, // Reset to all items if query is empty
            }
          : row
      )
    );
  };

  const handleItemSelect = (item: Item1, index: number) => {
    // Update the specific row's selected item and details
    setPurchaseRows((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              selectedItem: Number(item.itemId),
              searchQueryItem: item.itemName,
              filteredItemList: [], // Clear filtered list after selection
              purchasePrice: item.purchasePrice || 0,
              mrpSalePrice: item.mrpSalePrice || 0,
              gstPercentage: item.gstPercentage || 0,
              gstAmount:
                ((item.purchasePrice || 0) * (item.gstPercentage || 0)) / 100,
              amount: (item.purchasePrice || 0) * (row.packageQuantity || 1), // Calculate amount
            }
          : row
      )
    );

    // Immediately fetch item details
    fetchItemDetails(item.itemId, index);
  };

  const [formData, setFormData] = useState<PurchaseData>({
    purchaseDate: new Date(),
    purchaseBillNo: "",
    creditPeriod: 0,
    paymentDueDate: new Date(),
    supplierId: 0,
    invoiceAmount: 0,
    totalAmount: 0,
    totalGst: 0,
    totalDiscount: 0,
    grandTotal: 0,
    stockItemDtos: [], // Start with an empty array
  });

  const [purchase, setPurchase] = useState({
    purchaseDate: "",
    purchaseBillNo: "",
    creditPeriod: "",
    paymentDueDate: "",
    supplierId: "",
    invoiceAmount: "",
    totalAmount: 0,
    totalGst: 0,
    totalDiscount: 0,
    grandTotal: 0,
  });

  const [purchaseRows, setPurchaseRows] = useState<PurchaseRow[]>([
    {
      selectedItem: 0,
      batchNo: "",
      packageQuantity: 0,
      expiryDate: "",
      purchasePrice: 0,
      mrpSalePrice: 0,
      gstPercentage: 0,
      gstAmount: 0,
      discount: 0,
      amount: 0,
      searchQueryItem: "", // Initialize with an empty string
      filteredItemList: [], // Initialize with an empty array
    },
  ]);

  const [totalDiscount, setTotalDiscount] = useState(0);

  // Function to fetch item details and update purchaseRow on item change
  const fetchItemDetails = async (itemId: string, index: number) => {
    try {
      const data = await getItemById(Number(itemId)); // Use service function
    console.log("Fetched Item Details:", data); // Debugging log

    if (!data) {
      console.warn("No item details found for itemId:", itemId);
      return;
    }
      const { purchasePrice, mrpSalePrice, gstPercentage } = data;
      const packageQuantity = purchaseRows[index].packageQuantity;
      const gstAmount = purchasePrice * (gstPercentage / 100);
      const amount = purchasePrice * packageQuantity;

      const itemName =
        items.find((item) => item.itemId === itemId)?.itemName || "";

      setPurchaseRows((prevRows) =>
        prevRows.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                purchasePrice,
                mrpSalePrice,
                gstPercentage,
                gstAmount,
                amount,
                itemName,
              }
            : row
        )
      );
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };


  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index?: number
  ) => {
    const { name, value } = event.target;

    // Validation for creditPeriod
    if (name === "creditPeriod" && parseInt(value, 10) > 45) {
      alert("Credit Period cannot exceed 45 days.");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: FormErrors) => ({ ...prev, [name]: "" }));

    if (index !== undefined) {
      setPurchaseRows((prevRows) =>
        prevRows.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [name]: name === "discount" ? parseFloat(value) || 0 : value,
                ...(name === "packageQuantity"
                  ? { amount: parseFloat(value) * row.purchasePrice }
                  : {}), // Automatically calculate amount when packageQuantity changes
              }
            : row
        )
      );
      if (name === "selectedItem") {
        fetchItemDetails(value, index); // Fetch item details when item is selected
      }
    } else {
      setPurchase((prevPurchase) => {
        const updatedPurchase = {
          ...prevPurchase,
          [name]: value,
          ...(name === "selectedSupplier" ? { supplierId: value } : {}),
        };

        // Calculate paymentDueDate when purchaseDate or creditPeriod changes
        if (name === "purchaseDate" || name === "creditPeriod") {
          const purchaseDate = new Date(updatedPurchase.purchaseDate);
          const creditPeriod = parseInt(updatedPurchase.creditPeriod, 10);

          if (
            !isNaN(creditPeriod) &&
            purchaseDate.toString() !== "Invalid Date"
          ) {
            const paymentDueDate = new Date(purchaseDate);
            paymentDueDate.setDate(paymentDueDate.getDate() + creditPeriod);
            updatedPurchase.paymentDueDate = paymentDueDate
              .toISOString()
              .split("T")[0]; // Format to 'YYYY-MM-DD'
          } else {
            updatedPurchase.paymentDueDate = ""; // Clear if invalid
          }
        }

        return updatedPurchase;
      });

      if (name === "selectedSupplier") {
        setSelectedSupplier(value); // Set selected supplier in the main purchase state
      }

      if (name === "discount") {
        handleDiscountChange(parseFloat(value) || 0); // Pass the parsed value directly
      }
    }
  };

  const handleDiscountChange = (discountValue: number) => {
    setTotalDiscount(discountValue);
  };

  // Calculate totals and grand total (main change is in calculation of grand total)
  const calculateTotals = useCallback(() => {
    const totalAmt = purchaseRows.reduce((sum, row) => sum + row.amount, 0);
    const totalGstAmt = purchaseRows.reduce(
      (sum, row) => sum + row.gstAmount,
      0
    );
    const totalDiscountAmt = purchaseRows.reduce(
      (sum, row) => sum + (row.discount || 0),
      0
    );
    const grandTotal = totalAmt + totalGstAmt - totalDiscountAmt;

    setPurchase((prevPurchase) => ({
      ...prevPurchase,
      totalAmount: totalAmt,
      totalGst: totalGstAmt,
      totalDiscount: totalDiscountAmt,
      grandTotal: grandTotal,
    }));
  }, [purchaseRows]);

  useEffect(() => {
    calculateTotals();
  }, [purchaseRows, calculateTotals, totalDiscount]);

  const addPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    const billExists = await checkBillNoExists(
      formData.supplierId,
      formData.purchaseBillNo
    ); // Pass only supplierId
    console.log("Selected billExists:", billExists);
    if (billExists) {
      toast.error(
        "Bill number already exists for the given supplier and the current year.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    // Calculate totals
    const totalAmt = purchaseRows.reduce((sum, row) => sum + row.amount, 0);
    const totalGstAmt = purchaseRows.reduce(
      (sum, row) => sum + row.gstAmount,
      0
    );
    const totalDiscountAmt = purchaseRows.reduce(
      (sum, row) => sum + (row.discount || 0),
      0
    );
    const grandTotal = totalAmt + totalGstAmt - totalDiscountAmt;

    if (Number(purchase.invoiceAmount) !== grandTotal) {
      toast.error("Invoice Amount and Grand Total must be equal.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate rows
    const isValidRow = (row: PurchaseRow) =>
      row.selectedItem && row.amount && row.gstAmount && row.purchasePrice;
    if (!purchaseRows.every(isValidRow)) {
      toast.error("Please fill all required fields for each item.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const transformedFormData = {
        ...formData,
        supplierId: formData.supplierId, // Ensure supplierId is a string
        purchaseDate: formData.purchaseDate,
        paymentDueDate: formData.paymentDueDate,
        creditPeriod: Number(formData.creditPeriod), // Ensure it's a number
        invoiceAmount: Number(formData.invoiceAmount), // Ensure it's a number
        totalAmount: Number(totalAmt), // Ensure it's a number
        totalGst: Number(totalGstAmt), // Ensure it's a number
        totalDiscount: Number(totalDiscountAmt), // Ensure it's a number
        grandTotal: Number(grandTotal), // Ensure it's a number

        stockItemDtos: purchaseRows.map((row) => ({
          itemId: row.selectedItem, // Ensure itemId is a string
          batchNo: row.batchNo || "",
          packageQuantity: Number(row.packageQuantity) || 0, // Ensure it's a number
          expiryDate: row.expiryDate
            ? new Date(row.expiryDate).toISOString().split("T")[0]
            : "", // Ensure YYYY-MM-DD format
          purchasePrice: Number(row.purchasePrice) || 0, // Ensure it's a number
          mrpSalePrice: Number(row.mrpSalePrice) || 0, // Ensure it's a number
          gstPercentage: Number(row.gstPercentage) || 0, // Ensure it's a number
          gstAmount: Number(row.gstAmount) || 0, // Ensure it's a number
          discount: Number(row.discount) || 0, // Ensure it's a number
          amount: Number(row.amount) || 0, // Ensure it's a number
        })),
      };

      await createPurchase(transformedFormData);
      toast.success("Stock created successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      // router.push(`/Navbar?highlight=Stock Purchase&show=purchaseList`);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0] as keyof PurchaseData]: curr.message,
          }),
          {}
        );
        setErrors(fieldErrors);
        return;
      }

      // Handle Axios or similar errors with a `response` property
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response
      ) {
        const responseError = error as {
          response: { data: { message: string } };
        };
        toast.error(`Error: ${responseError.response.data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Generic error handling
      toast.error("An unexpected error occurred", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Adding a new row to purchaseRows
  const addNewRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        selectedItem: 0,
        batchNo: "",
        packageQuantity: 0,
        expiryDate: "",
        purchasePrice: 0,
        mrpSalePrice: 0,
        gstPercentage: 0,
        gstAmount: 0,
        discount: 0,
        amount: 0,
      },
    ]);
  };

  // Handling row deletion
  const handleDeleteRow = (index: number) => {
    if (purchaseRows.length === 1) {
      alert("Cannot delete the last row.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this row?"
    );
    if (confirmDelete) {
      setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
    }
  };

  const [tempValue, setTempValue] = useState("");

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement, Element>,
    idx: number
  ) => {
    const enteredDate = new Date(e.target.value);
    const currentDate = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(currentDate.getMonth() + 3);

    if (enteredDate < threeMonthsFromNow) {
      const confirm = window.confirm(
        "The expiry date is less than 3 months away. Do you want to proceed?"
      );
      if (!confirm) {
        e.target.value = tempValue || ""; // Reset value if not confirmed
      } else {
        handleChange(e, idx); // Allow data entry
      }
    } else {
      handleChange(e, idx); // Allow data entry if valid
    }
  };

  const handleFocus = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setTempValue(e.target.value); // Store the previous value before changing
  };

  return (
    <>
      <main>
        <span className="heading_text">Log New Procurement</span>

        <div className="card_1">
          <div className="sub_heading_text pb-6">Basic Details</div>

          <div className="grid grid-cols-2 small_text gap-6">
            <div className="space_two">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                id="purchaseDate"
                value={purchase.purchaseDate}
                onChange={(e) => handleChange(e)}
                className="procurement_input"
              />
            </div>

            <div className="space_two">
              <label htmlFor="purchaseBillNo">Bill Number</label>
              <input
                type="text"
                name="purchaseBillNo"
                id="purchaseBillNo"
                value={purchase.purchaseBillNo}
                onChange={(e) => handleChange(e)}
                className="procurement_input"
              />
            </div>

            <div className="space_two">
              <label htmlFor="creditPeriod">Credit Period (in Days)</label>
              <input
                type="text"
                name="creditPeriod"
                id="creditPeriod"
                value={purchase.creditPeriod}
                onChange={(e) => handleChange(e)}
                className="procurement_input"
              />
            </div>

            <div className="space_two">
              <label htmlFor="paymentDueDate">Payment Due Date</label>
              <input
                type="date"
                name="paymentDueDate"
                id="paymentDueDate"
                value={purchase.paymentDueDate}
                onChange={(e) => handleChange(e)}
                className="procurement_input"
              />
            </div>

            <div className="space_two">
              <label htmlFor="supplierName">Supplier</label>

              {/* Searchable Input Field */}
              <input
                type="text"
                id="supplierSearch"
                className="procurement_input"
                value={searchQuery}
                placeholder="Search for a Supplier"
                onChange={handleSearchChange}
              />

              {/* Show filtered suppliers as suggestions */}
              {filteredSupplierList.length > 0 && searchQuery && (
                <ul className="absolute bg-white border border-textField max-h-48 overflow-y-auto w-80 rounded-lg p-2">
                  <button
                    className="dropdown_styling p-2"
                    onClick={() => openModal("Supplier")}
                  >
                    Add Supplier
                  </button>
                  {filteredSupplierList.map((supplier) => (
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      key={supplier.supplierId}
                      onClick={() => handleSupplierSelect(supplier)}
                    >
                      {supplier.supplierName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space_two">
              <label htmlFor="invoiceAmount">Invoice Amount</label>
              <input
                type="text"
                name="invoiceAmount"
                id="invoiceAmount"
                value={purchase.invoiceAmount}
                onChange={(e) => handleChange(e)}
                className="procurement_input"
              />
            </div>
          </div>
        </div>

        <div className="sub_heading_text">Procured Items</div>



        <div>
          <table className="purchase_table">
            <thead>
              <tr className="purchase_table_tr">
                <td className="rounded-tl-lg rounded-bl-lg px-2">
                  Name of the Item
                </td>
                <td>Batch No</td>
                <td>Package Qty</td>
                <td>Expiry Date</td>
                <td>Purchase Price</td>
                <td>MRP</td>
                <td>GST %</td>
                <td>GST</td>
                <td>Discount</td>
                <td>Amount</td>
                <td className="rounded-tr-lg rounded-br-lg">
                  <Image
                    src="Action_Icon2.svg"
                    alt="Action Icon"
                    width={16}
                    height={16}
                  />
                </td>
              </tr>
            </thead>

            <tbody>
              {purchaseRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      id="itemSearch"
                      className="procurement_input"
                      value={row.searchQueryItem || ""}
                      placeholder="Search for a Item"
                      onChange={(e) => handleSearchChangeItem(e, index)}
                    />

                    {row.filteredItemList &&
                      row.filteredItemList.length > 0 &&
                      row.searchQueryItem && (
                        <ul className="absolute bg-white border border-textField max-h-48 overflow-y-auto w-80 rounded-lg p-2">
                          <button
                            className="dropdown_styling p-2"
                            onClick={() => openModal("Item")}
                          >
                            Add Item
                          </button>
                          {row.filteredItemList.map((item) => (
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              key={item.itemId}
                              onClick={() => handleItemSelect(item, index)}
                            >
                              {item.itemName}, {item.unitType}
                            </li>
                          ))}
                        </ul>
                      )}

                    {isModalOpen && (
                      <Modal isOpen={isModalOpen} closeModal={closeModal}>
                        {modalContent === "Supplier" && (
                          <Supplier closeModal={closeModal} />
                        )}
                        {modalContent === "Item" && (
                          <Item closeModal={closeModal} />
                        )}
                      </Modal>
                    )}

                    {/* <Modal isOpen={isModalOpen} closeModal={closeModal}>
      {modalContent === "Supplier" && <Supplier closeModal={closeModal} />}
      {modalContent === "Item" && <Item closeModal={closeModal} />}
      </Modal> */}
                  </td>

                  <td>
                    <input
                      type="text"
                      name="batchNo"
                      value={row.batchNo}
                      onChange={(e) => handleChange(e, index)}
                      className="h-11 w-24 procurement_input1"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      name="packageQuantity"
                      onChange={(e) => handleChange(e, index)}
                      className="h-11 w-20 procurement_input1"
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      name="expiryDate"
                      value={row.expiryDate}
                      onChange={(e) => handleChange(e, index)}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, index)}
                      className="h-11 w-28 procurement_input1"
                    />
                  </td>

                  <td>{row.purchasePrice}</td>
                  <td>{row.mrpSalePrice}</td>
                  <td>{row.gstPercentage}</td>
                  <td>{row.gstAmount}</td>
                  <td>
                    <input
                      type="text"
                      name="discount"
                      id="discount"
                      value={row.discount}
                      onChange={(e) => handleChange(e, index)}
                      className="h-11 w-20 procurement_input1"
                    />
                  </td>

                  <td>{row.amount}</td>

                  <td>
                    <RiDeleteBin6Line
                      className="text-red-500 hover:text-red-700 h-6 w-6"
                      onClick={() => handleDeleteRow(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addNewRow}
            className="h-11 w-56 bg-lightGray text-sm font-medium rounded-lg border border-buttonBorder"
          >
            + Add New Purchase Item
          </button>
        </div>

        <div className="card_2">
          <div className="card_2_div">
            <label htmlFor="totalAmount">SUB TOTAL</label>
            <input
              type="text"
              name="totalAmount"
              id="totalAmount"
              value={purchase.totalAmount}
              readOnly
              className="card_2_input"
            />
          </div>

          <div className="card_2_div">
            <label htmlFor="totalGst">GST</label>
            <input
              type="text"
              name="totalGst"
              id="totalGst"
              value={purchase.totalGst}
              readOnly
              className="card_2_input"
            />
          </div>

          <div className="card_2_div">
            <label htmlFor="totalDiscount">DISCOUNT</label>
            <input
              type="text"
              name="totalDiscount"
              id="totalDiscount"
              value={purchase.totalDiscount}
              readOnly
              className="card_2_input"
            />
          </div>

          <div className="card_2_div bg-softPink rounded-md">
            <label htmlFor="grandTotal">Total</label>
            <input
              type="text"
              name="grandTotal"
              id="grandTotal"
              value={purchase.grandTotal}
              readOnly
              className="card_2_input"
            />
          </div>
        </div>
      </main>

      {/* <footer className="procurement_footer">
        {action === "editPurchase" && (
          <button className="button" onClick={updatePurchase}>
            Edit
          </button>
        )}

        {(!action || action === "") && (
          <button className="button_purple" onClick={addPurchase}>
            Save
          </button>
        )}
      </footer> */}
      <div className="procurement_footer">
        <button className="button_purple" onClick={addPurchase}>
          Save
        </button>
      </div>
    </>
  );
};

export default Purchase;

// function setErrors(fieldErrors: {}) {
//   throw new Error('Function not implemented.');
// }
