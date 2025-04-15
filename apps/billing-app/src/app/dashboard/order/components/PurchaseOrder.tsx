import Button from "@/app/components/common/Button";
import Drawer from "@/app/components/common/Drawer";
import InputField from "@/app/components/common/InputField";
import Table from "@/app/components/common/Table";
import { getItem, getItemById } from "@/app/services/ItemService";
import { getSupplier } from "@/app/services/SupplierService";
import { getVariantById } from "@/app/services/VariantService";
import { ItemData } from "@/app/types/ItemData";
import {
  PurchaseOrderData,
  PurchaseOrderItem,
} from "@/app/types/PurchaseOrderData";
import { SupplierData } from "@/app/types/SupplierData";
import { ClipboardList, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddItem from "../../item/components/AddItem";
import AddSupplier from "../../supplier/component/AddSupplier";
import { createPurchaseOrder } from "@/app/services/PurchaseOrderService";
import { PharmacyData } from "@/app/types/PharmacyData";
import { getPharmacy } from "@/app/services/PharmacyService";
import Modal from "@/app/components/common/Modal";
import { toast } from "react-toastify";
import { UnitData } from "@/app/types/VariantData";

interface PurchaseOrderProps {
  setShowPurchasOrder: (value: boolean) => void;
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  setShowPurchasOrder,
}) => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyData[]>([]);

  const [, setShowDrawer] = useState<boolean>(false);
  const [showSupplier, setShowSupplier] = useState(false);
  const [showItem, setShowItem] = useState(false);

  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    () => Promise<void> | void
  >(() => {});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSecondaryMessage, setModalSecondaryMessage] = useState("");
  const [modalBgClass, setModalBgClass] = useState("");

  interface ModalOptions {
    message: string;
    secondaryMessage?: string;
    bgClassName?: string;
    onConfirmCallback: () => Promise<void> | void;
  }

  const [formData, setFormData] = useState<PurchaseOrderData>({
    orderId: "",
    orderId1: "",
    pharmacyId: "",
    supplierId: "",
    supplierName: "",
    orderedDate: new Date(),
    intendedDeliveryDate: new Date(),
    totalAmount: 0,
    totalGst: 0,
    grandTotal: 0,
    purchaseOrderItemDtos: [],
  });

  const [orderItemRows, setorderItemRows] = useState<PurchaseOrderItem[]>([
    {
      itemId: "",
      itemName: "",
      quantity: 0,
      manufacturer: "",
      unitTypeId: "",
      variantTypeId: "",
      variantName: "",
      unitName: "",
      gstPercentage: 0,
      gstAmount: 0,
      amount: 0,
      purchasePrice: 0,
    },
  ]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierList = await getSupplier();
        setSuppliers(supplierList); // Set the suppliers to state
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemList = await getItem();
        setItems(itemList);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    fetchItems();
  }, []);

  const columns: {
    header: string;
    accessor:
      | keyof PurchaseOrderItem
      | ((row: PurchaseOrderItem, index: number) => React.ReactNode);
    className?: string;
  }[] = [
    {
      header: "Item Name",
      accessor: (row: PurchaseOrderItem, index: number) => (
        <select
          value={row.itemId}
          name="itemId"
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
            + Add Item
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
      header: "Order Qty",
      accessor: (row: PurchaseOrderItem, index: number) => (
        <input
          type="number"
          name="quantity"
          value={row.quantity}
          onChange={(e) => handleChange(e, index)}
          className="border border-gray-300 p-2 rounded w-24 text-left outline-none focus:ring-0 focus:outline-none"
        />
      ),
      className: "text-left",
    },

    {
      header: "Manufacturer",
      accessor: "manufacturer",
      className: "text-left",
    },

    {
      header: "Variant Type",
      accessor: "variantName",
      className: "text-left",
    },
    { header: "Unit Type", accessor: "unitName", className: "text-left" },
    {
      header: "Purchase Price",
      accessor: "purchasePrice",
      className: "text-left",
    },
    // { header: "GST %", accessor: "gstPercentage", className: "text-left" },
    // { header: "GST", accessor: "gstAmount", className: "text-left" },
    { header: "Estimated Amount", accessor: "amount", className: "text-left" },
    {
      header: "Action",
      accessor: (row: PurchaseOrderItem, index: number) => (
        <RiDeleteBin6Line
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={() => handleDeleteRow(index)}
        />
      ),
      className: "text-left",
    },
  ];

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;

    if (name === "itemId") {
      try {
        const selectedItem = await getItemById(value);
        const variantDetails = await getVariantById(selectedItem.variantId);

        const matchedUnit = variantDetails?.unitDtos?.find(
          (unit: UnitData) => unit.unitId === selectedItem.unitId
        );

        setorderItemRows((prev) =>
          prev.map((row, i) =>
            i === index
              ? {
                  ...row,
                  itemId: selectedItem.itemId,
                  itemName: selectedItem.itemName,
                  manufacturer: selectedItem.manufacturer || "",
                  variantTypeId: selectedItem.variantId,
                  unitTypeId: selectedItem.unitId,
                  purchasePrice: selectedItem.purchasePrice || 0,
                  variantName: variantDetails?.variantName || "",
                  unitName: matchedUnit?.unitName || "",
                }
              : row
          )
        );
      } catch (error) {
        console.error("Error fetching item or variant details:", error);
      }
    } else {
      setorderItemRows((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                [name]: value,
                amount:
                  name === "quantity"
                    ? parseFloat(value) * (row.purchasePrice || 0)
                    : row.amount,
              }
            : row
        )
      );
    }
  };

  const handleDeleteRow = (index: number) => {
    if (orderItemRows.length === 1) {
      toast.error("Cannot delete the last row", {
                position: "top-right",
                autoClose: 3000,
              });
      return;
    }

    handleShowModal({
      message: "Are you sure you want to delete this item? This action cannot be undone",
      secondaryMessage: "Confirm Deletion",
      bgClassName: "bg-darkRed", 
      onConfirmCallback: () => {
        setorderItemRows(orderItemRows.filter((_, i) => i !== index));
      },
    });
  };

  const handlePurchaseOrderList = () => {
    setShowPurchasOrder(false);
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      orderedDate: new Date(),
      intendedDeliveryDate: new Date(),
    }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "orderedDate" || id === "intendedDeliveryDate"
          ? new Date(value)
          : value, // Convert date inputs to Date object
    }));
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getSupplier();
        if (response?.data) {
          setSuppliers(response.data);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const addNewRow = () => {
    setorderItemRows([
      ...orderItemRows,
      {
        itemId: "",
        itemName: "",
        quantity: 0,
        manufacturer: "",
        gstPercentage: 0,
        gstAmount: 0,
        amount: 0,
        unitTypeId: "",
        variantTypeId: "",
        variantName: "",
        unitName: "",
        purchasePrice: 0,
      },
    ]);
  };

  useEffect(() => {
    const grandTotal = orderItemRows.reduce(
      (total, item) => total + (item.amount || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      grandTotal,
    }));
  }, [orderItemRows]);

  const handleSupplierDrawer = () => {
    setShowItem(false);
    setShowSupplier(true);
    setShowDrawer(true);
  };

  const handleItemDrawer = () => {
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
    const fetchPharmacies = async () => {
      try {
        const data = await getPharmacy();
        setPharmacies(data.data); 
      } catch (error) {
        console.error(error);
      }
    };

    fetchPharmacies();
  }, []);

  const handleShowModal = (options: ModalOptions) => {
    setModalMessage(options.message);
    setModalSecondaryMessage(options.secondaryMessage || "");
    setModalBgClass(options.bgClassName || "");
    setModalConfirmCallback(() => options.onConfirmCallback);
    setShowModal(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleModalConfirm = async () => {
    await modalConfirmCallback();
    setShowModal(false);
  };

  const addPurchaseOrder = () => {
    const purchaseOrderData: PurchaseOrderData = {
      pharmacyId: formData.pharmacyId,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      orderedDate: new Date(formData.orderedDate),
      intendedDeliveryDate: new Date(formData.intendedDeliveryDate),
      totalAmount: 0,
      totalGst: 0,
      grandTotal: formData.grandTotal,
      purchaseOrderItemDtos: orderItemRows.map((row) => ({
        itemId: row.itemId,
        itemName: row.itemName,
        quantity: row.quantity,
        manufacturer: row.manufacturer,
        unitTypeId: row.unitTypeId,
        variantTypeId: row.variantTypeId,
        variantName: row.variantName,
        unitName: row.unitName,
        gstPercentage: row.gstPercentage || 0,
        gstAmount: row.gstAmount || 0,
        amount: row.amount || 0,
        purchasePrice: row.purchasePrice || 0,
      })),
    };
  
    handleShowModal({
      message: "Are you sure you want to confirm the order? Once confirmed cannot be edited",
      secondaryMessage:
        "Confirm Order Completion",
      bgClassName: "bg-darkPurple", 
      onConfirmCallback: async () => {
        try {
        await createPurchaseOrder(purchaseOrderData);
          setFormData({
            orderId: "",
            orderId1: "",
            pharmacyId: "",
            supplierId: "",
            supplierName: "",
            orderedDate: new Date(),
            intendedDeliveryDate: new Date(),
            totalAmount: 0,
            totalGst: 0,
            grandTotal: 0,
            purchaseOrderItemDtos: [],
          });
      
          setorderItemRows([
            {
              itemId: "",
              itemName: "",
              quantity: 0,
              manufacturer: "",
              unitTypeId: "",
              variantTypeId: "",
              variantName: "",
              unitName: "",
              gstPercentage: 0,
              gstAmount: 0,
              amount: 0,
              purchasePrice: 0,
            },
          ]);
      
          window.location.reload();
        } catch (error) {
          console.error("Failed to submit purchase order:", error);
          toast.error("Failed to submit purchase order. Please try again.");
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
          <AddItem setShowDrawer={handleCloseDrawer} />
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
            New Purchase Order
          </div>

          <div>
            <Button
              onClick={() => handlePurchaseOrderList()}
              label="Purchase Order List"
              value=""
              className="w-48 bg-darkPurple text-white h-11"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
        </div>

        <div className="border border-Gray max-w-7xl h-44 rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>

          <div className="relative mt-8 grid grid-cols-4 gap-4">
            {[
              { id: "orderedDate", label: "Order Date", type: "date" },
              { id: "pharmacyId", label: "Pharmacy", type: "dropdown" },
              { id: "supplierId", label: "Supplier", type: "dropdown" },
              {
                id: "intendedDeliveryDate",
                label: "Intended Delivery Date",
                type: "date",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="relative w-72">
                {/* Supplier Dropdown */}
                {id === "supplierId" ? (
                  <>
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>

                    <select
                      id={id}
                      value={formData.supplierId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "newSupplier") {
                          handleSupplierDrawer();
                        } else {
                          handleInputChange(e);
                        }
                      }}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                      name="supplierId"
                    >
                      <option value="" disabled>
                        Select Supplier
                      </option>

                      <option value="newSupplier" className="text-Purple">
                        + New Supplier
                      </option>

                      {suppliers.map((sup) => (
                        <option key={sup.supplierId} value={sup.supplierId}>
                          {sup.supplierName}
                        </option>
                      ))}
                    </select>
                  </>
                ) : id === "pharmacyId" ? (
                  <>
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>

                    <select
                      id={id}
                      value={formData.pharmacyId || ""}
                      onChange={handleInputChange}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                      name="pharmacyId"
                    >
                      <option value="" disabled>
                        Select Pharmacy
                      </option>

                      {Array.isArray(pharmacies) &&
                        pharmacies.map((pharmacy) => (
                          <option
                            key={pharmacy.pharmacyId}
                            value={pharmacy.pharmacyId}
                          >
                            {pharmacy.pharmacyName}
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
                      id === "orderedDate" || id === "intendedDeliveryDate"
                        ? formData[id as keyof PurchaseOrderData] instanceof
                          Date
                          ? (formData[id as keyof PurchaseOrderData] as Date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                        : formData[id as keyof PurchaseOrderData]?.toString() ??
                          ""
                    }
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Table
          data={orderItemRows}
          columns={columns}
          noDataMessage="No purchase items found"
        />

        <div>
          <Button
            onClick={() => addNewRow()}
            label="Add New Item"
            value=""
            className="w-44 bg-gray  h-11"
            icon={<Plus size={15} />}
          ></Button>
        </div>

        <div className="border h-auto w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            // { label: "SUB TOTAL", value: 0 },
            // { label: "GST TOTAL", value: 0 },
            {
              label: "GRAND TOTAL",
              value: formData.grandTotal.toFixed(2),

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
            onClick={addPurchaseOrder}
            label="Confirm"
            value=""
            className="w-28 bg-darkPurple text-white  h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default PurchaseOrder;
