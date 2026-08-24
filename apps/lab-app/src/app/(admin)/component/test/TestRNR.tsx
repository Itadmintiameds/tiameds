"use client";

import {
  FlaskConical,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
} from "lucide-react";

export interface ReferenceRange {
  id: number;
  rangeName: string;
  gender: string;
  ageFrom: string;
  ageFromType: string;
  ageTo: string;
  ageToType: string;
  unit: string;
  min: string;
  max: string;
  criticalLow: string;
  criticalHigh: string;
  interpretation: string;
}

export const defaultReferenceRows: ReferenceRange[] = [
  {
    id: 1,
    rangeName: "Adult Male",
    gender: "Male",
    ageFrom: "18",
    ageFromType: "Yrs",
    ageTo: "18",
    ageToType: "Yrs",
    unit: "g/dL",
    min: "13.5",
    max: "17.0",
    criticalLow: "7.0",
    criticalHigh: "20.0",
    interpretation: "Normal",
  },
  {
    id: 2,
    rangeName: "Adult Male",
    gender: "Female",
    ageFrom: "18",
    ageFromType: "Yrs",
    ageTo: "18",
    ageToType: "Yrs",
    unit: "g/dL",
    min: "12.0",
    max: "16.0",
    criticalLow: "6.0",
    criticalHigh: "20.0",
    interpretation: "Normal",
  },
];

const inputClass =
  "h-9 w-full rounded-md border border-pneutral-300 bg-white px-3 text-sm text-pneutral-900 outline-none transition focus:border-secondary-700";

const greenInput =
  "h-9 w-full rounded-md border border-success-500 bg-white text-center text-sm outline-none focus:border-success-700";

const redInput =
  "h-9 w-full rounded-md border border-warning-500 bg-white text-center text-sm outline-none focus:border-warning-600";

interface TestRNRProps {
  rows: ReferenceRange[];
  onRowsChange: (rows: ReferenceRange[]) => void;
}

const TestRNR = ({ rows, onRowsChange }: TestRNRProps) => {
  const handleChange = (
    id: number,
    field: keyof ReferenceRange,
    value: string
  ) => {
    onRowsChange(
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const addReference = () => {
    onRowsChange([
      ...rows,
      {
        id: Date.now(),
        rangeName: "",
        gender: "Male",
        ageFrom: "",
        ageFromType: "Yrs",
        ageTo: "",
        ageToType: "Yrs",
        unit: "",
        min: "",
        max: "",
        criticalLow: "",
        criticalHigh: "",
        interpretation: "Normal",
      },
    ]);
  };

  const removeReference = (id: number) => {
    onRowsChange(rows.filter((r) => r.id !== id));
  };

  const Input = ({
    value,
    onChange,
    className = inputClass,
    center = false,
  }: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
    center?: boolean;
  }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} ${center ? "text-center" : ""}`}
    />
  );

  const Select = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-pneutral-300 bg-white px-3 pr-8 text-sm text-pneutral-900 outline-none focus:border-secondary-600"
      >
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pneutral-500"
      />
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-pneutral-200 px-6 py-4">

        <div className="flex items-start gap-3">

          <FlaskConical
            size={22}
            className="mt-3 text-secondary-700"
          />

          <div>

            <h2 className="text-p4 font-semibold text-pneutral-900">
              Test Parameters & Reference Ranges
            </h2>

            <p className=" text-p2 text-pneutral-500">
              Define different reference ranges for demographic groups
            </p>

          </div>

        </div>

        <button
          onClick={addReference}
          className="flex h-9 items-center gap-2 rounded-full bg-pneutral-900 px-3 text-p2 font-medium text-pneutral-50"
        >
          <Plus size={16} />
          Add Another Reference
        </button>

      </div>

      {/* Scroll */}

      <div className="overflow-x-auto">

        <div className="min-w-[1280px]">

          {/* Column Heading */}

          <div
            className="
            grid
            grid-cols-[20px_170px_90px_70px_70px_70px_70px_70px_60px_60px_70px_70px_120px_30px]
            items-center
            gap-3
            px-6
            py-3
            text-p2
            font-semibold
            text-pneutral-900
          "
          >
            <div />

            <div>Range Name</div>

            <div>Gender</div>

            <div>Age From</div>

            <div />

            <div>Age To</div>

            <div />

            <div>Unit</div>

            <div>Min</div>

            <div>Max</div>

            <div>Crit Low</div>

            <div>Crit High</div>

            <div>Interpretation</div>

            <div />
          </div>

          {/* Rows */}

          {rows.map((row) => (
            <div
              key={row.id}
              className="
              grid
              grid-cols-[20px_170px_90px_70px_70px_70px_70px_70px_60px_60px_70px_70px_120px_30px]
              items-center
              gap-3
              border-t
              border-pneutral-200
              px-6
              py-3
            "
            >
              {/* Drag */}

              <GripVertical
                size={16}
                className="cursor-grab text-secondary-600"
              />

              {/* Range */}

              <Input
                value={row.rangeName}
                onChange={(v) =>
                  handleChange(row.id, "rangeName", v)
                }
              />

              {/* Gender */}

              <Select
                value={row.gender}
                onChange={(v) =>
                  handleChange(row.id, "gender", v)
                }
                options={["Male", "Female"]}
              />

              {/* Age From */}

              <Input
                value={row.ageFrom}
                center
                onChange={(v) =>
                  handleChange(row.id, "ageFrom", v)
                }
              />

              {/* Age From Type */}

              <Select
                value={row.ageFromType}
                onChange={(v) =>
                  handleChange(row.id, "ageFromType", v)
                }
                options={["Yrs", "Months", "Days"]}
              />

              {/* Age To */}

              <Input
                value={row.ageTo}
                center
                onChange={(v) =>
                  handleChange(row.id, "ageTo", v)
                }
              />

              {/* Age To Type */}

              <Select
                value={row.ageToType}
                onChange={(v) =>
                  handleChange(row.id, "ageToType", v)
                }
                options={["Yrs", "Months", "Days"]}
              />

              {/* Unit */}

              <Input
                value={row.unit}
                center
                onChange={(v) =>
                  handleChange(row.id, "unit", v)
                }
              />
              
               {/* Min */}

              <Input
                value={row.min}
                className={greenInput}
                center
                onChange={(v) =>
                  handleChange(row.id, "min", v)
                }
              />

              {/* Max */}

              <Input
                value={row.max}
                className={greenInput}
                center
                onChange={(v) =>
                  handleChange(row.id, "max", v)
                }
              />

              {/* Critical Low */}

              <Input
                value={row.criticalLow}
                className={redInput}
                center
                onChange={(v) =>
                  handleChange(row.id, "criticalLow", v)
                }
              />

              {/* Critical High */}

              <Input
                value={row.criticalHigh}
                className={redInput}
                center
                onChange={(v) =>
                  handleChange(row.id, "criticalHigh", v)
                }
              />

              {/* Interpretation */}

              <Select
                value={row.interpretation}
                onChange={(v) =>
                  handleChange(row.id, "interpretation", v)
                }
                options={[
                  "Normal",
                  "Low",
                  "High",
                  "Critical",
                ]}
              />

              {/* Delete */}

              <button
                onClick={() => removeReference(row.id)}
                className="flex items-center justify-center text-warning-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default TestRNR;