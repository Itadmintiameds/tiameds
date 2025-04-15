"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PurchaseEntry from "./components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import Table from "@/app/components/common/Table";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";

const Page = () => {
  
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntryData, setPurchaseEntryData] = useState<
    PurchaseEntryData[]
  >([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");

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
    const fetchPurchaseEntry = async () => {
      try {
        const response = await getPurchase();

        if (!response?.data || response.status !== "success") {
          throw new Error(response?.message || "Failed to fetch purchases");
        }

        const purchases: PurchaseEntryData[] = response.data;

        const purchasesWithSuppliers = await Promise.all(
          purchases?.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            return { ...purchase, supplierName }; 
          })
        );

        setPurchaseEntryData(purchasesWithSuppliers);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseEntry();
  }, []);

  const handlePurchesEntry = () => {
    setShowPurchasEntry(true);
  };

  const columns = [
    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "Purchase Date",
      accessor: "purchaseDate" as keyof PurchaseEntryData,
    },
    {
      header: "Bill No",
      accessor: "purchaseBillNo" as keyof PurchaseEntryData,
    },
    {
      header: "Bill Amount",
      accessor: "grandTotal" as keyof PurchaseEntryData,
    },
    {
      header: "Payment Status",
      accessor: "paymentStatus" as keyof PurchaseEntryData,
    },
    {
      header: "Goods Status",
      accessor: "goodStatus" as keyof PurchaseEntryData,
    },
    {
      header: <BsThreeDotsVertical size={18} />, 
      accessor: (
        row: PurchaseEntryData,
        index: number 
      ) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Link
              href={`/dashboard/orderSummary?id=${row.invId}`} 
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

  const filteredData = purchaseEntryData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.supplierName?.toLowerCase().includes(search) ||
      new Date(item.purchaseDate)
        .toLocaleDateString()
        .toLowerCase()
        .includes(search) ||
      item.purchaseBillNo?.toLowerCase().includes(search) ||
      item.grandTotal?.toString().toLowerCase().includes(search) ||
      item.paymentStatus?.toString().toLowerCase().includes(search) ||
      item.goodStatus?.toString().toLowerCase().includes(search)
    );
  });

  return (
    <>
      {!showPurchasEntry && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase List
            </div>

            <div>
              <div className="flex space-x-4">
                <div>
                  {/* <Input
                    type="text"
                    value=""
                    onChange={(e) => console.log(e.target.value)}
                    placeholder="Search Table..."
                    className="w-80 border-gray-300"
                    icon={<Search size={18} />}
                  /> */}

                  <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search Table..."
                    className="w-80 border-gray-300"
                    icon={<Search size={18} />}
                  />
                </div>
                {/* <div>
                  <Button
                    onClick={() => handlePurchesEntry()}
                    label="Filter"
                    value=""
                    className="w-24 text-black h-11"
                    icon={<Filter size={15} />}
                  ></Button>
                </div> */}
                <div>
                  <Button
                    onClick={() => handlePurchesEntry()}
                    label="New Purchase Entry"
                    value=""
                    className="w-52 bg-darkPurple text-white h-11 "
                    icon={<Plus size={15} />}
                  ></Button>
                </div>
              </div>
            </div>
          </div>

          {/* <Table
            data={purchaseEntryData}
            columns={columns}
            noDataMessage="No purchase records found"
          /> */}

          <Table
            data={filteredData}
            columns={columns}
            noDataMessage="No purchase records found"
          />
        </main>
      )}

      {showPurchasEntry && (
        <PurchaseEntry setShowPurchaseEntry={setShowPurchasEntry} />
      )}
    </>
  );
};

export default Page;
