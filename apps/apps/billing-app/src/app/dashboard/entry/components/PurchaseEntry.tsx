"use client";
import Button from "@/app/components/common/Button";
import React, { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import Table from "@/app/components/common/Table";
import {
  PurchaseEntryData,
  PurchaseEntryItem,
} from "@/app/types/PurchaseEntry";
import Drawer from "@/app/components/common/Drawer";
import AddItem from "../../item/components/AddItem";
import AddSupplier from "../../supplier/component/AddSupplier";
import InputField from "@/app/components/common/InputField";
import { ItemData } from "@/app/types/ItemData";
import { getItem, getItemById } from "@/app/services/ItemService";
import {
  getPurchaseOrder,
  getPurchaseOrderById,
} from "@/app/services/PurchaseOrderService";
import { PurchaseOrderData } from "@/app/types/PurchaseOrderData";
import { createPurchase } from "@/app/services/PurchaseEntryService";
import { getPharmacyById } from "@/app/services/PharmacyService";
import { getSupplierById } from "@/app/services/SupplierService";
import { toast } from "react-toastify";
import Modal from "@/app/components/common/Modal";
import { BsThreeDotsVertical } from "react-icons/bs";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    () => Promise<void> | void
  >(() => {});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSecondaryMessage, setModalSecondaryMessage] = useState("");
  const [modalBgClass, setModalBgClass] = useState("");
  const [modalCancelCallback, setModalCancelCallback] = useState<() => void>(
    () => {}
  );
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  interface ModalOptions {
    message: string;
    secondaryMessage?: string;
    bgClassName?: string;
    onConfirmCallback: () => Promise<void> | void;
    onCancelCallback?: () => void;
  }

  const [orderPurchase, setOrderPurchase] = useState<PurchaseOrderData[]>([]);
  const [, setShowDrawer] = useState<boolean>(false);
  const [purchaseRows, setPurchaseRows] = useState<PurchaseEntryItem[]>([
    {
      itemId: "",
      batchNo: "",
      packageQuantity: 0,
      expiryDate: "",
      purchasePrice: 0,
      mrpSalePrice: 0,
      cgstPercentage: 0,
      purchasePricePerUnit: 0,
      mrpSalePricePerUnit: 0,
      sgstPercentage: 0,
      gstPercentage: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      gstAmount: 0,
      discount: 0,
      amount: 0,
      pharmacyId: "",
    },
  ]);

  const [formData, setFormData] = useState<PurchaseEntryData>({
    orderId: "",
    purchaseDate: new Date(), // Default to current date
    purchaseBillNo: "",
    creditPeriod: 0,
    paymentDueDate: new Date(), // Default to current date
    supplierId: "",
    invoiceAmount: 0,
    paymentStatus: "",
    goodStatus: "",
    totalAmount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalDiscount: 0,
    grandTotal: 0,
    stockItemDtos: [], // Initially empty array for stock items
  });

  const [items, setItems] = useState<ItemData[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [gstTotal, setGstTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItem();
        setItems(data); // Store fetched items in state
      } catch (error) {
        console.error("Failed to fetch items", error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getPurchaseOrder();

        if (!response?.data || response.status !== "success") {
          throw new Error(
            response?.message || "Failed to fetch purchase order"
          );
        }

        setOrderPurchase(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrderPurchase([]);
      }
    };

    fetchOrders();
  }, []);

  const columns: {
    header: string;
    accessor:
      | keyof PurchaseEntryItem
      | ((row: PurchaseEntryItem, index: number) => React.ReactNode);
    className?: string;
  }[] = [
    {
      header: "Item Name",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <select
          value={row.itemId}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "newItem") {
              handleItemDrawer(); // open the drawer
            } else {
              handleChange(e, index); // update formData
            }
          }}
          className="border border-gray-300 p-2 rounded w-full text-left outline-none focus:ring-0 focus:outline-none"
        >
          <option value="">Select Item</option>
          <option value="newItem" className="text-Purple">
            + Add New Item
          </option>
          {items.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.itemName}
            </option>
          ))}
        </select>
      ),
      className: "text-left",
    },

    {
      header: "Batch No",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="text"
            name="batchNo"
            value={row.batchNo}
            onChange={(e) => handleChange(e, index)}
            className="border border-Gray p-2 rounded w-28 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    {
      header: "Package Qty",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="number"
            name="packageQuantity"
            value={row.packageQuantity}
            onChange={(e) => handleChange(e, index)}
            className="border border-Gray p-2 rounded w-24 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    {
      header: "Expiry Date",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="date"
            name="expiryDate"
            value={row.expiryDate}
            onChange={(e) => handleChange(e, index)}
            onBlur={(e) => checkExpiry(e, index)}
            className="border border-Gray p-2 rounded w-32 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    {
      header: "Purchase Price",
      accessor: "purchasePrice",
      className: "text-left",
    },
    { header: "MRP", accessor: "mrpSalePrice", className: "text-left" },
    { header: "GST %", accessor: "gstPercentage", className: "text-left" },
    { header: "GST", accessor: "gstAmount", className: "text-left" },
    { header: "Discount", accessor: "discount", className: "text-left" },
    { header: "Amount", accessor: "amount", className: "text-left" },
    {
      header: "Action",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="relative group">
        <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
          <BsThreeDotsVertical size={18} />
        </button>
      
        <div className="absolute right-0 mt-2 w-32 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => handleItemDrawer(row.itemId)}
            className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg whitespace-nowrap"
          >
            Edit Item Details
          </button>

          <button
            onClick={() => handleDeleteRow(index)}
            className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>     
      ),
    },
  ];

  const [showSupplier, setShowSupplier] = useState(false);
  const [showItem, setShowItem] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedRows = [...purchaseRows];

    let updatedValue: number | string = value;
    if (name === "packageQuantity") {
      updatedValue = Number(value) || 0; // Ensure it's a number
    }

    // Update the row with the new value
    updatedRows[index] = {
      ...updatedRows[index],
      [name]: updatedValue,
    };

    // If package quantity is changed, recalculate amount and GST
    if (name === "packageQuantity") {
      const packageQuantity = Number(value) || 0;
      const purchasePrice = updatedRows[index].purchasePrice || 0;

      // ✅ Correct Amount Calculation
      const amount = packageQuantity * purchasePrice;

      // ✅ Correct GST Calculation
      const gstPercentage = updatedRows[index].gstPercentage || 0;
      const gstAmount = (amount * gstPercentage) / 100;

      // ✅ Correct CGST & SGST Calculation
      const cgstAmount = gstAmount / 2; // Assuming CGST and SGST are equal
      const sgstAmount = gstAmount / 2;

      // Update the row with new calculated values
      updatedRows[index] = {
        ...updatedRows[index],
        amount,
        gstAmount,
        cgstAmount,
        sgstAmount,
      };
    }

    setPurchaseRows(updatedRows);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Corrected Function to Add a New Row
  const addNewRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        itemId: "",
        pharmacyId: "",
        batchNo: "",
        packageQuantity: 0,
        expiryDate: "",
        purchasePrice: 0,
        mrpSalePrice: 0,
        purchasePricePerUnit: 0,
        mrpSalePricePerUnit: 0,
        cgstPercentage: 0,
        sgstPercentage: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        gstAmount: 0,
        discount: 0, // ✅ Ensure number type
        amount: 0, // ✅ Ensure number type
      },
    ]);
  };

  const checkExpiry = async (
    e: React.FocusEvent<HTMLInputElement, Element>,
    idx: number
  ) => {
    const enteredDate = new Date(e.target.value);
    const currentDate = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(currentDate.getMonth() + 3);

    if (enteredDate < threeMonthsFromNow) {
      const userConfirmed = await new Promise<boolean>((resolve) => {
        handleShowModal({
          message:
            "The expiry date is less than 3 months away. Do you want to proceed?",
          secondaryMessage: "Confirm Expiry Date",
          bgClassName: "bg-darkPurple",
          onConfirmCallback: () => resolve(true),
          onCancelCallback: () => {
            // ✅ Clear from STATE (not input directly)
            setPurchaseRows((prev) =>
              prev.map((row, i) =>
                i === idx ? { ...row, expiryDate: "" } : row
              )
            );
            resolve(false);
          },
        });
      });

      if (userConfirmed) {
        handleChange(e, idx);
      }
    } else {
      handleChange(e, idx);
    }
  };

  const handlePurchaseList = () => {
    setShowPurchaseEntry(false);
  };

  const handleDeleteRow = (index: number) => {
    if (purchaseRows.length === 1) {
      toast.error("Cannot delete the last row", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    handleShowModal({
      message:
        "Are you sure you want to delete this item? This action cannot be undone",
      secondaryMessage: "Confirm Deletion",
      bgClassName: "bg-darkRed",
      onConfirmCallback: () => {
        setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
      },
    });
  };

  // const handleSupplierDrawer = () => {
  //   setShowItem(false); // ✅ Close Item Drawer
  //   setShowSupplier(true);
  //   setShowDrawer(true);
  // };

  const handleItemDrawer = (itemId?: string) => {
    console.log("Item Idddd", itemId);
    
    if (itemId) {
      setCurrentItemId(itemId); // Only set if provided
    } 
  
    setShowSupplier(false);
    setShowItem(true);
    setShowDrawer(true);
  };
  
  

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowItem(false); 
    setShowSupplier(false); 
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      billDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    if (formData.creditPeriod && formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate); 
      const creditPeriod = Number(formData.creditPeriod); 

      if (!isNaN(creditPeriod) && !isNaN(purchaseDate.getTime())) {
        const paymentDueDate = new Date(purchaseDate);
        paymentDueDate.setDate(paymentDueDate.getDate() + creditPeriod); 

        setFormData((prev) => ({
          ...prev,
          paymentDueDate, 
        }));
      }
    }
  }, [formData.creditPeriod, formData.purchaseDate]);

  const handleOrderSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOrderId = e.target.value.trim(); 

    if (!selectedOrderId) {
      console.warn("Order ID is empty or invalid!");
      return;
    }

    setFormData((prev) => ({ ...prev, orderId: selectedOrderId }));

    try {
      const purchaseOrder = await getPurchaseOrderById(selectedOrderId); 

      if (purchaseOrder?.purchaseOrderItemDtos) {
        const pharmacyId = purchaseOrder.pharmacyId || ""; 
        const supplierId = purchaseOrder.supplierId || "";

        let updatedRows: PurchaseEntryItem[] =
          purchaseOrder.purchaseOrderItemDtos.map(
            (item: PurchaseEntryItem): PurchaseEntryItem => ({
              itemId: item.itemId,
              itemName: item.itemName,
              batchNo: item.batchNo || "",
              packageQuantity: item.packageQuantity || 0,
              expiryDate: item.expiryDate || "",
              purchasePrice: item.purchasePrice || 0,
              mrpSalePrice: item.mrpSalePrice || 0,
              purchasePricePerUnit: item.purchasePricePerUnit || 0,
              mrpSalePricePerUnit: item.mrpSalePricePerUnit || 0,
              cgstPercentage: item.cgstPercentage || 0,
              sgstPercentage: item.sgstPercentage || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstAmount: item.sgstAmount || 0,
              gstAmount: item.gstAmount || 0,
              discount: item.discount || 0,
              amount: item.amount || 0,
              pharmacyId,
              gstPercentage:
                (item.cgstPercentage || 0) + (item.sgstPercentage || 0),
            })
          );

        setPurchaseRows(updatedRows);

        updatedRows = await Promise.all(
          updatedRows.map(
            async (row: PurchaseEntryItem): Promise<PurchaseEntryItem> => {
              try {
                const itemDetails = await getItemById(row.itemId.toString());

                return {
                  ...row,
                  purchasePrice: itemDetails.purchasePrice ?? row.purchasePrice,
                  mrpSalePrice: itemDetails.mrpSalePrice ?? row.mrpSalePrice,
                  cgstPercentage:
                    itemDetails.cgstPercentage ?? row.cgstPercentage,
                  sgstPercentage:
                    itemDetails.sgstPercentage ?? row.sgstPercentage,
                  gstPercentage:
                    (itemDetails.cgstPercentage ?? 0) +
                    (itemDetails.sgstPercentage ?? 0), 
                };
              } catch (error) {
                console.error(
                  "Error fetching item details for itemId:",
                  row.itemId,
                  error
                );
                return row; 
              }
            }
          )
        );

        setPurchaseRows(updatedRows);

        if (pharmacyId) {
          try {
            const response = await getPharmacyById(pharmacyId);
            const pharmacy = response?.data;

            setFormData((prev) => ({
              ...prev,
              pharmacyId,
              pharmacyName: pharmacy?.pharmacyName || "N/A",
            }));
          } catch (error) {
            console.error(
              "Error fetching pharmacy details for pharmacyId:",
              pharmacyId,
              error
            );
            setFormData((prev) => ({
              ...prev,
              pharmacyId,
              pharmacyName: "N/A",
            }));
          }
        }

        if (supplierId) {
          try {
            console.log(
              "Fetching supplier details for supplierId:",
              supplierId
            );

            const supplier = await getSupplierById(supplierId);

            setFormData((prev) => ({
              ...prev,
              supplierId,
              supplierName: supplier?.supplierName || "N/A",
            }));
          } catch (error) {
            console.error(
              "Error fetching supplier details for supplierId:",
              supplierId,
              error
            );
            setFormData((prev) => ({
              ...prev,
              supplierId,
              supplierName: "N/A",
            }));
          }
        }
      } else {
        setPurchaseRows([]);
      }
    } catch (error) {
      console.error("Error fetching purchase order items:", error);
    }
  };

  useEffect(() => {
    const newSubTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.amount || 0),
      0
    );

    const newGstTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.gstAmount || 0),
      0
    );

    const newGrandTotal = newSubTotal + newGstTotal;

    setSubTotal(newSubTotal);
    setGstTotal(newGstTotal);
    setGrandTotal(newGrandTotal);
  }, [purchaseRows]);

  useEffect(() => {
    const newSubTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.amount || 0),
      0
    );

    // ✅ Fix GST Total Calculation
    const newGstTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.gstAmount || 0),
      0
    );

    const newGrandTotal = newSubTotal + newGstTotal;

    setSubTotal(newSubTotal);
    setGstTotal(newGstTotal);
    setGrandTotal(newGrandTotal);
  }, [purchaseRows]);

  const handleShowModal = (options: ModalOptions) => {
    setModalMessage(options.message);
    setModalSecondaryMessage(options.secondaryMessage || "");
    setModalBgClass(options.bgClassName || "");
    setModalConfirmCallback(() => options.onConfirmCallback);
    if (options.onCancelCallback) {
      setModalCancelCallback(() => options.onCancelCallback); // ✅
    }
    setShowModal(true);
  };

  const handleModalCancel = () => {
    modalCancelCallback();
    setShowModal(false);
  };

  const handleModalConfirm = async () => {
    await modalConfirmCallback();
    setShowModal(false);
  };

  const addPurchase = () => {
    if (Number(formData.invoiceAmount) !== grandTotal) {
      toast.error(
        "Invoice amount must match the grand total before confirming."
      );
      return;
    }

    const purchaseData: PurchaseEntryData = {
      orderId: formData.orderId,
      purchaseBillNo: formData.purchaseBillNo,
      purchaseDate: new Date(formData.purchaseDate),
      creditPeriod: formData.creditPeriod
        ? Number(formData.creditPeriod)
        : undefined,
      paymentDueDate: formData.paymentDueDate
        ? new Date(formData.paymentDueDate)
        : undefined,
      supplierId: formData.supplierId,
      invoiceAmount: formData.invoiceAmount
        ? Number(formData.invoiceAmount)
        : undefined,
      totalAmount: subTotal,
      totalCgst: gstTotal,
      totalSgst: gstTotal,
      grandTotal: grandTotal,
      stockItemDtos: purchaseRows.map((row) => ({
        itemId: row.itemId,
        batchNo: row.batchNo,
        packageQuantity: row.packageQuantity,
        expiryDate: row.expiryDate,
        purchasePrice: row.purchasePrice,
        mrpSalePrice: row.mrpSalePrice,
        purchasePricePerUnit: row.purchasePricePerUnit,
        mrpSalePricePerUnit: row.mrpSalePricePerUnit,
        cgstPercentage: row.cgstPercentage,
        sgstPercentage: row.sgstPercentage,
        gstPercentage: row.gstPercentage,
        cgstAmount: row.cgstAmount,
        sgstAmount: row.sgstAmount,
        gstAmount: row.gstAmount,
        discount: row.discount,
        amount: row.amount,
        pharmacyId: row.pharmacyId,
      })),
      paymentStatus: "",
      goodStatus: "",
    };

    handleShowModal({
      message:
        "Are you sure you want to confirm the entry? Once confirmed cannot be edited",
      secondaryMessage: "Confirm Entry Completion",
      bgClassName: "bg-darkPurple",
      onConfirmCallback: async () => {
        try {
          await createPurchase(purchaseData);

          setFormData({
            orderId: "",
            purchaseDate: new Date(),
            purchaseBillNo: "",
            creditPeriod: 0,
            paymentDueDate: new Date(),
            supplierId: "",
            invoiceAmount: 0,
            paymentStatus: "",
            goodStatus: "",
            totalAmount: 0,
            totalCgst: 0,
            totalSgst: 0,
            totalDiscount: 0,
            grandTotal: 0,
            stockItemDtos: [],
          });

          setPurchaseRows([]);
          window.location.reload();
        } catch (error) {
          console.error("Error adding purchase:", error);
          toast.error("Failed to add purchase. Please try again.");
        }
      },
    });
  };

  return (
    <>
      {showModal && (
        <Modal
          message={modalMessage}
          secondaryMessage={modalSecondaryMessage}
          bgClassName={modalBgClass}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
      {(showItem || showSupplier) && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20"
          onClick={handleCloseDrawer}
        />
      )}

      {showItem && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add New Item"}>
          <AddItem setShowDrawer={handleCloseDrawer} itemId={currentItemId}/>
        </Drawer>
      )}

      {showSupplier && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add New Supplier"}>
          <AddSupplier setShowDrawer={handleCloseDrawer} />
        </Drawer>
      )}

      <main className="space-y-6">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 ">
            Purchase Entry
          </div>

          <div>
            <Button
              onClick={() => handlePurchaseList()}
              label="Purchase List"
              value=""
              className="w-48 bg-darkPurple text-white h-11"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
        </div>

        <div className="border border-Gray max-full h-full rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>

          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { id: "orderId", label: "Order ID", type: "select" },
              { id: "pharmacyName", label: "Pharmacy" },
              { id: "purchaseBillNo", label: "Bill No" },
              { id: "billDate", label: "Bill Date", type: "date" },
            ].map(({ id, label, type }) => (
              <div key={id} className="relative w-full">
                {id === "orderId" ? (
                  <>
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>

                    <select
                      id="orderId"
                      value={formData.orderId || ""}
                      onChange={handleOrderSelect}
                      className="peer w-full h-[49px] px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                    >
                      <option value="" disabled>
                        Select Order
                      </option>
                      {orderPurchase.map((order) => (
                        <option
                          key={order.orderId ?? "unknown"}
                          value={order.orderId?.toString() || ""}
                        >
                          {order.orderId1 || "Unknown Order"}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <InputField
                    id={id}
                    label={label}
                    type={type}
                    value={
                      formData[id as keyof PurchaseEntryData]?.toString() ?? ""
                    }
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { id: "creditPeriod", label: "Credit Period", type: "number" },
              { id: "paymentDueDate", label: "Payment Due Date", type: "date" },
              { id: "supplierName", label: "Supplier", type: "text" },
              { id: "invoiceAmount", label: "Invoice Amount", type: "number" },
            ].map(({ id, label, type }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                type={type}
                value={
                  id === "paymentDueDate" && formData.paymentDueDate
                    ? new Date(formData.paymentDueDate)
                        .toISOString()
                        .split("T")[0]
                    : formData[id as keyof PurchaseEntryData]?.toString() ?? ""
                }
                onChange={
                  id === "paymentDueDate" ? () => {} : handleInputChange
                }
                readOnly={id === "paymentDueDate"}
              />
            ))}
          </div>
        </div>

        <Table
          data={purchaseRows}
          columns={columns}
          noDataMessage="No purchase items found"
        />

        <div>
          <Button
            onClick={() => addNewRow()}
            label="Add Item Row"
            value=""
            className="w-44 bg-gray h-11"
            icon={<Plus size={15} />}
          ></Button>
        </div>

        <div className="border h-56 w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            { label: "SUB TOTAL", value: subTotal.toFixed(2) },
            { label: "GST TOTAL", value: gstTotal.toFixed(2) },
            { label: "DISCOUNT", value: 0 },
            {
              label: "GRAND TOTAL",
              value: grandTotal.toFixed(2),
              isTotal: true,
            },
          ].map(({ label, value, isTotal }, index) => (
            <div
              key={index}
              className={`flex justify-between ${
                isTotal
                  ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
                  : ""
              }`}
            >
              <div>{label}</div>
              <div>₹{value}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={addPurchase}
            label="Save"
            value=""
            className="w-28 bg-darkPurple text-white h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default PurchaseEntry;
