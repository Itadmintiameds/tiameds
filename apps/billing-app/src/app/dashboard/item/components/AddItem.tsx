import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { itemSchema } from "@/app/schema/ItemSchema";
import { createItem } from "@/app/services/ItemService";
import { getVariant } from "@/app/services/VariantService";
import { ItemData } from "@/app/types/ItemData";
import { VariantData } from "@/app/types/VariantData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface SupplierProps {
  setShowDrawer: (value: boolean) => void;
}

const AddItem: React.FC<SupplierProps> = ({ setShowDrawer }) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [variant, setVariant] = useState<VariantData[]>([]);

  const [formData, setFormData] = useState<ItemData>({
    itemId: undefined,
    itemName: "",
    purchaseUnit: 0,
    variantId: "",
    unitId: "",
    variantName: "",
    unitName: "",
    manufacturer: "",
    purchasePrice: 0,
    mrpSalePrice: 0,
    purchasePricePerUnit: 0,
    mrpSalePricePerUnit: 0,
    cgstPercentage: 0,
    sgstPercentage: 0,
    gstPercentage: 0,
    hsnNo: "",
    consumables: "",
  });

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getVariant();
        setVariant(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetch();
  }, []);

  // inside the component, before return:
  const unitOptions = React.useMemo(() => {
    // find the currently selected variant
    const chosen = variant.find((v) => v.variantId === formData.variantId);
    // map its unitDtos (or empty array)
    return chosen
      ? chosen.unitDtos.map((u) => ({ id: u.unitId, name: u.unitName }))
      : [];
  }, [variant, formData.variantId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    const numericFields = [
      "purchaseUnit",
      "purchasePrice",
      "mrpSalePrice",
      "purchasePricePerUnit",
      "mrpSalePricePerUnit",
      "cgstPercentage",
      "sgstPercentage",
    ];

    const formattedValue = numericFields.includes(id)
      ? Number(value) || 0
      : value;

    setFormData((prev) => {
      const next = { ...prev, [id]: formattedValue };

      // Automatically update unit prices when dependent fields change
      const purchaseUnit =
        id === "purchaseUnit" ? Number(value) : prev.purchaseUnit;
      const purchasePrice =
        id === "purchasePrice" ? Number(value) : prev.purchasePrice;
      const mrpSalePrice =
        id === "mrpSalePrice" ? Number(value) : prev.mrpSalePrice;

      // Avoid divide-by-zero
      const safeUnit = purchaseUnit || 1;

      // Recalculate derived fields
      next.purchasePricePerUnit = purchasePrice / safeUnit;
      next.mrpSalePricePerUnit = mrpSalePrice / safeUnit;

      if (id === "variantId") {
        const chosen = variant.find((v) => v.variantId === value);
        if (chosen && chosen.unitDtos.length > 0) {
          next.unitId = chosen.unitDtos[0].unitId;
          next.unitName = chosen.unitDtos[0].unitName;
        } else {
          next.unitId = "";
          next.unitName = "";
        }
      }

      return next;
    });

    if (id in itemSchema.shape) {
      const fieldKey = id as keyof typeof itemSchema.shape;
      const singleFieldSchema = z.object({
        [fieldKey]: itemSchema.shape[fieldKey],
      });

      const result = singleFieldSchema.safeParse({
        [fieldKey]: formattedValue,
      });

      if (!result.success) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: result.error.errors[0].message,
        }));
      } else {
        setValidationErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const addItem = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      itemSchema.parse(formData);

      if (formData.mrpSalePrice <= formData.purchasePrice) {
        toast.error("MRP must be greater than Purchase Price", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      await createItem(formData);
      toast.success("Item created successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setShowDrawer(false);
    } catch (error) {
      console.error("Error:", error);
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

  return (
    <>
      <main className="space-y-6">
        <div>
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "itemName",
                label: "Item Name",
                type: "text",
                maxLength: 50,
              },
              {
                id: "purchaseUnit",
                label: "Purchase Unit",
                type: "text",
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={label}
                  maxLength={maxLength}
                  value={String(formData[id as keyof ItemData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "variantId",
                label: "Variant Type",
                type: "select" as const,
                options: variant.map((v) => ({
                  id: v.variantId,
                  name: v.variantName,
                })),
              },
              {
                id: "unitId",
                label: "Unit Type",
                type: "select" as const,
                options: unitOptions, // already [{id,name},…]
              },
            ].map(({ id, label, type, options }) => (
              <div key={id} className="flex flex-col w-full relative">
                {type === "select" ? (
                  <>
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>

                    <select
                      id={id}
                      value={String(formData[id as keyof ItemData] ?? "")}
                      onChange={handleChange}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                    >
                      <option value="" disabled>
                        Select {label}
                      </option>
                      {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <InputField
                    type={type}
                    id={id}
                    label={label}
                    value={String(formData[id as keyof ItemData] ?? "")}
                    onChange={handleChange}
                  />
                )}
                {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "purchasePrice",
                label: "Purchase Price",
                type: "text",
              },
              {
                id: "mrpSalePrice",
                label: "MRP",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={label}
                  value={String(formData[id as keyof ItemData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "purchasePricePerUnit", label: "Purchase Price Per Unit" },
              { id: "mrpSalePricePerUnit", label: "MRP Per Unit" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
                readOnly
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "cgstPercentage",
                label: "CGST Percentage",
                type: "text",
              },
              {
                id: "sgstPercentage",
                label: "SGST Percentage",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={label}
                  value={String(formData[id as keyof ItemData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "manufacturer", label: "Manufacturer", type: "text" },
              { id: "hsnNo", label: "HSN Number", type: "text" },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={label}
                  value={String(formData[id as keyof ItemData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {id === "hsnNo" && validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Button
            onClick={addItem}
            label="Add Item"
            value=""
            className="w-36 h-11 bg-darkPurple text-white"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default AddItem;
