"use client";

import Input from "@/app/components/common/Input";
import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Button from "@/app/components/common/Button";
import PurchaseReturn from "./components/PurchaseReturn";
import Table from "@/app/components/common/Table";
import Link from "next/link";
import { PurchaseReturnData } from "@/app/types/PurchaseReturnData";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getSupplierById } from "@/app/services/SupplierService";
import { getReturnAll } from "@/app/services/PurchaseReturnService";

const Page = () => {
  const [showPurchaseReturn, setShowPurchaseReturn] = useState(false);
  const [purchaseReturnData, setPurchaseReturnData] = useState<
    PurchaseReturnData[]
  >([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const handlePurchesReturn = () => {
    setShowPurchaseReturn(true);
  };

  const fetchSupplier = async (supplierId: string): Promise<string> => {
    try {
      const supplier = await getSupplierById(supplierId.trim());

      if (!supplier || !supplier.supplierName) {
        console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
        return "Unknown Supplier1";
      }

      return supplier.supplierName;
    } catch (error) {
      console.error(`Error fetching supplier for ID ${supplierId}:`, error);
      return "Unknown Supplier2";
    }
  };

  useEffect(() => {
    const fetchPurchaseReturn = async () => {
      try {
        const response = await getReturnAll();

        if (!response?.data || response.status !== "success") {
          throw new Error("Failed to fetch purchases");
        }

        const purchases: PurchaseReturnData[] = response.data;

        const purchasesWithSuppliers = await Promise.all(
          purchases.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            return { ...purchase, supplierName };
          })
        );

        setPurchaseReturnData(purchasesWithSuppliers);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseReturn();
  }, []);

  const columns = [
    {
      header: "Return ID",
      accessor: "returnId1" as keyof PurchaseReturnData,
    },

    {
      header: "Return Date",
      accessor: "returnDate" as keyof PurchaseReturnData,
    },

    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseReturnData,
    },

    {
      header: "Return Quantity",
      accessor: (row: PurchaseReturnData) =>
        row.purchaseReturnItemDtos?.reduce(
          (acc, item) => acc + (item.returnQuantity || 0),
          0
        ) ?? 0,
    },

    {
      header: "Return Amount",
      accessor: "returnAmount" as keyof PurchaseReturnData,
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: PurchaseReturnData, index: number) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Link
              href={`/dashboard/return/components/${row.returnId}`}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              View
            </Link>
            <button
              onClick={() => console.log("Deleting Item:", index)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  const filteredData = purchaseReturnData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      // item.returnId?.toLowerCase().includes(search) ||
      new Date(item.returnDate)
        .toLocaleDateString()
        .toLowerCase()
        .includes(search) ||
      item.supplierName?.toLowerCase().includes(search) ||
      item.returnReason?.toString().toLowerCase().includes(search) ||
      item.refundType?.toString().toLowerCase().includes(search) ||
      item.returnAmount?.toString().toLowerCase().includes(search)
    );
  });

  return (
    <>
      {!showPurchaseReturn ? (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase Return List
            </div>

            <div>
              <div className="flex space-x-4">
                <div>
                  <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search Table..."
                    className="w-80 border-gray-300"
                    icon={<Search size={18} />}
                  />
                </div>
                <div>
                  <Button
                    onClick={() => handlePurchesReturn()}
                    label="New Return"
                    value=""
                    className="w-40 bg-darkPurple text-white h-11 "
                    icon={<Plus size={15} />}
                  />
                </div>
              </div>
            </div>
          </div>

          <Table
            data={filteredData}
            columns={columns}
            noDataMessage="No purchase records found"
          />
        </main>
      ) : (
        <PurchaseReturn setShowPurchaseReturn={setShowPurchaseReturn} />
      )}
    </>
  );
};

export default Page;
