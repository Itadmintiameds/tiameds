'use client';
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SearchableSelect from "../common/SearchableSelect";
import { getParameters, ParameterMaster } from "../../../../../services/parameterMasterService";

interface ParameterSelectProps {
  parameterId?: number;
  parameterName?: string;
  onChange: (parameter: { parameterId?: number; parameterName?: string }) => void;
  disabled?: boolean;
}

// Select-only dropdown backed by GET /lab/parameter-master
const ParameterSelect = ({ parameterId, parameterName, onChange, disabled }: ParameterSelectProps) => {
  const [parameters, setParameters] = useState<ParameterMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getParameters()
      .then(list => {
        if (!cancelled) setParameters([...list].sort((a, b) => a.parameterName.localeCompare(b.parameterName)));
      })
      .catch(err => {
        if (!cancelled) toast.error(err.message || "Failed to load parameters");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    const list = parameters.map(p => ({ value: String(p.parameterId), label: p.parameterName }));
    // Keep an already-saved parameter visible even if it is no longer active.
    if (parameterId !== undefined && parameterName && !list.some(o => o.value === String(parameterId))) {
      list.unshift({ value: String(parameterId), label: parameterName });
    }
    return list;
  }, [parameters, parameterId, parameterName]);

  return (
    <SearchableSelect
      options={options}
      value={parameterId !== undefined ? String(parameterId) : ""}
      onChange={(id) => {
        const match = options.find(o => o.value === id);
        onChange({ parameterId: Number(id), parameterName: match?.label });
      }}
      disabled={disabled || loading}
      placeholder={loading ? "Loading parameters..." : "Select parameter"}
      searchPlaceholder="Search parameter..."
      emptyText="No parameter found"
    />
  );
};

export default ParameterSelect;
