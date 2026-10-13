'use client';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Edit, Search } from "lucide-react";
import { FaTag } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  activateParameter,
  addParameter,
  deleteParameter,
  getInactiveParameters,
  getParameters,
  ParameterMaster,
  updateParameter,
} from "../../../../../services/parameterMasterService";
import Loader from "@/app/(admin)/component/common/Loader";
import Unauthorised from "@/app/(admin)/component/Unauthorised";
import NewCommonTable from "@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable";
import NewModal from "@/app/(admin)/dashboard/newcommoncomponent/NewModal";
import useAuthStore from "@/context/userStore";

const MAX_LENGTH = 150; // parameter_name column length
const ALLOWED_ROLES = ["SUPERADMIN", "ADMIN", "TECHNICIAN"];

const Page = () => {
  const { user: loginedUser } = useAuthStore();
  const roles = loginedUser?.roles || [];
  const isAuthorized = ALLOWED_ROLES.some(role => roles.includes(role));

  const [parameters, setParameters] = useState<ParameterMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Add / edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<ParameterMaster | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enable / disable confirmation modal
  const [toToggle, setToToggle] = useState<ParameterMaster | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const loadParameters = useCallback(async () => {
    try {
      const [active, inactive] = await Promise.all([getParameters(), getInactiveParameters()]);
      const list = [
        ...active.map(p => ({ ...p, isActive: true })),
        ...inactive.map(p => ({ ...p, isActive: false })),
      ];
      setParameters(list.sort((a, b) => a.parameterName.localeCompare(b.parameterName)));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) loadParameters();
  }, [isAuthorized, loadParameters]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return q ? parameters.filter(p => p.parameterName.toLowerCase().includes(q)) : parameters;
  }, [parameters, searchTerm]);

  const openModal = (parameter?: ParameterMaster) => {
    setSelected(parameter ?? null);
    setName(parameter?.parameterName ?? "");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setName("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Parameter name is required");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Parameter name must be ${MAX_LENGTH} characters or less`);
      return;
    }
    try {
      setIsSubmitting(true);
      if (selected) {
        await updateParameter(selected.parameterId, trimmed);
        toast.success("Parameter updated successfully.", { autoClose: 2000 });
      } else {
        await addParameter(trimmed);
        toast.success("Parameter added successfully.", { autoClose: 2000 });
      }
      closeModal();
      await loadParameters();
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message, { autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!toToggle) return;
    const disabling = toToggle.isActive;
    try {
      setIsToggling(true);
      if (disabling) {
        await deleteParameter(toToggle.parameterId);
      } else {
        await activateParameter(toToggle.parameterId);
      }
      toast.success(`Parameter ${disabling ? "disabled" : "enabled"} successfully.`, { autoClose: 2000 });
      setToToggle(null);
      await loadParameters();
    } catch (err) {
      toast.error((err as Error).message, { autoClose: 3000 });
    } finally {
      setIsToggling(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ""}
          currentRoles={roles}
          notallowedRoles={roles}
          allowedRoles={ALLOWED_ROLES}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading parameters..." />
        <p className="mt-4 text-sm text-gray-500">Fetching the latest parameter data...</p>
      </div>
    );
  }

  const columns = [
    {
      header: "#",
      accessor: "index",
      render: (row: ParameterMaster) => (
        <p className="text-p3 text-pneutral-600">{parameters.findIndex(p => p.parameterId === row.parameterId) + 1}</p>
      ),
    },
    {
      header: "Parameter Name",
      accessor: "parameterName",
      render: (row: ParameterMaster) => (
        <p className={`font-semibold text-p3 ${row.isActive ? "text-pneutral-900" : "text-pneutral-400"}`}>
          {row.parameterName}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row: ParameterMaster) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-p2 font-medium ${
            row.isActive ? "bg-green-100 text-green-700" : "bg-pneutral-100 text-pneutral-600"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: ParameterMaster) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(row)}
            className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
            title="Edit Parameter"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => setToToggle(row)}
            className={`rounded-full border px-3 py-1 text-p2 font-medium transition-colors ${
              row.isActive
                ? "border-warning-500 text-warning-500 hover:bg-warning-50"
                : "border-green-600 text-green-600 hover:bg-green-50"
            }`}
            title={row.isActive ? "Disable Parameter" : "Enable Parameter"}
          >
            {row.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-4 bg-secondary-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-h3 font-semibold text-pneutral-900">Parameter List</h1>
            <p className="mt-1 text-p3 text-pneutral-500">Manage test reference parameters</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Parameter</span>
          </button>
        </div>
      </div>

      {/* Stats and search */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-info-50 p-4 rounded-lg border border-info-100 flex items-center gap-3">
          <FaTag className="text-info-500 text-xl" />
          <span className="text-p3 font-semibold text-info-800">
            Total Parameters: <span className="text-info-900 font-bold">{parameters.length}</span>
          </span>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700" />
          <input
            type="text"
            placeholder="Search by parameter name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 w-full rounded-lg bg-white border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
          <p className="text-sm font-medium text-pneutral-500">
            {searchTerm ? `No results found for "${searchTerm}"` : "No parameters available"}
          </p>
          {searchTerm && <p className="mt-1 text-xs text-pneutral-400">Try adjusting your search criteria</p>}
        </div>
      ) : (
        <NewCommonTable columns={columns} data={filtered} pageSize={10} showPagination={true} resetPageKey={searchTerm} />
      )}

      {/* Add / edit modal */}
      <NewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selected ? "Edit Parameter" : "Add New Parameter"}
        modalClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-info-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-info-700 text-p3 flex items-center gap-2">
              <FaTag className="text-info-600" size={16} />
              Parameter Information
            </h4>
            <div>
              <label htmlFor="parameterName" className="block text-p3 font-medium text-pneutral-900 mb-1.5">
                Parameter Name <span className="text-warning-500">*</span>
              </label>
              <div className="relative">
                <FaTag className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                <input
                  id="parameterName"
                  type="text"
                  value={name}
                  maxLength={MAX_LENGTH}
                  autoFocus
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter parameter name"
                  className={`w-full rounded-lg border pl-9 pr-4 py-2 text-p3 focus:outline-none focus:ring-1 bg-white ${
                    error
                      ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500"
                      : "border-pneutral-200 focus:border-secondary-500 focus:ring-secondary-500"
                  }`}
                />
              </div>
              {error && <p className="mt-1 text-p2 text-danger-600">{error}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-p3 font-medium text-pneutral-700 bg-pneutral-100 rounded-lg hover:bg-pneutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-p3 font-medium text-pneutral-50 bg-secondary-700 rounded-lg hover:bg-secondary-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : selected ? "Update Parameter" : "Add Parameter"}
            </button>
          </div>
        </form>
      </NewModal>

      {/* Enable / disable confirmation */}
      <NewModal
        isOpen={!!toToggle}
        onClose={() => setToToggle(null)}
        title={toToggle?.isActive ? "Disable Parameter" : "Enable Parameter"}
        modalClassName="max-w-md"
      >
        <div className="space-y-5">
          <p className="text-center text-p3 text-pneutral-700">
            Do you want to {toToggle?.isActive ? "disable" : "enable"} this parameter{" "}
            <span className="font-semibold text-pneutral-900">&quot;{toToggle?.parameterName}&quot;</span>?
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setToToggle(null)}
              disabled={isToggling}
              className="px-4 py-2 text-p3 font-medium text-pneutral-700 bg-pneutral-100 rounded-lg hover:bg-pneutral-200 transition-colors disabled:opacity-60"
            >
              No
            </button>
            <button
              type="button"
              onClick={handleConfirmToggle}
              disabled={isToggling}
              className={`px-4 py-2 text-p3 font-medium text-pneutral-50 rounded-lg transition-colors disabled:opacity-60 ${
                toToggle?.isActive ? "bg-warning-500 hover:bg-warning-600" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isToggling ? "Saving..." : "Yes"}
            </button>
          </div>
        </div>
      </NewModal>
    </div>
  );
};

export default Page;
