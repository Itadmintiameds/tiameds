import { Download } from "lucide-react";

// Small download icon shown in a dashboard card header; exports that card's
// currently loaded data (its own date filter) as CSV.
const CardDownloadButton = ({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="rounded-md border border-success-500 bg-[#55D400] p-1 text-pneutral-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Download size={14} />
  </button>
);

export default CardDownloadButton;
