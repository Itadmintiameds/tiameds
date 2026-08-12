"use client";

import { useState } from "react";
import { FileText } from "lucide-react";


const ReportDisplay = () => {
  const [settings, setSettings] = useState({
    showTest: true,
    showReferenceRange: false,
    showUnit: true,
    showInterpretation: false,
    highlightAbnormal: true,
    showTrend: false,
  });

  const toggleSwitch = (
    key: keyof typeof settings
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const Toggle = ({
    checked,
    onClick,
  }: {
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
        checked ? "bg-secondary-600" : "bg-pneutral-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-pneutral-200 px-6 py-4">

        <div className="flex items-start gap-3">

          <div className="flex items-center justify-center">

            <FileText
              size={20}
              className=" mt-3 text-secondary-600"
            />

          </div>

          <div>

            <h2 className="text-p4 font-semibold text-pneutral-900">
              Report Display Settings
            </h2>

            <p className="text-p2 text-pneutral-500">
              Control how this test appears on printed and digital reports
            </p>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="grid grid-cols-1 gap-y-6 gap-x-10 p-6 md:grid-cols-2">

        {/* Left */}

        <div className="space-y-6">

          {/* Show Test */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showTest}
              onClick={() =>
                toggleSwitch("showTest")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show test on report
            </span>

          </div>

          {/* Show Unit */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showUnit}
              onClick={() =>
                toggleSwitch("showUnit")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show unit on report
            </span>

          </div>

          {/* Highlight */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.highlightAbnormal}
              onClick={() =>
                toggleSwitch(
                  "highlightAbnormal"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Highlight abnormal values
            </span>

          </div>

        </div>

        {/* Right */}

        <div className="space-y-6">

          {/* Reference */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={
                settings.showReferenceRange
              }
              onClick={() =>
                toggleSwitch(
                  "showReferenceRange"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show reference range on report
            </span>

          </div>

          {/* Interpretation */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={
                settings.showInterpretation
              }
              onClick={() =>
                toggleSwitch(
                  "showInterpretation"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show interpretation on report
            </span>

          </div>

          {/* Trend */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showTrend}
              onClick={() =>
                toggleSwitch("showTrend")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show trend indicator
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}
export default ReportDisplay;










// "use client";

// import { useState } from "react";
// import { FileText } from "lucide-react";


// const ReportDisplay = () => {
//   const [settings, setSettings] = useState({
//     showTest: true,
//     showReferenceRange: false,
//     showUnit: true,
//     showInterpretation: false,
//     highlightAbnormal: true,
//     showTrend: false,
//   });

//   const toggleSwitch = (
//     key: keyof typeof settings
//   ) => {
//     setSettings((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const Toggle = ({
//     checked,
//     onClick,
//   }: {
//     checked: boolean;
//     onClick: () => void;
//   }) => (
//     <button
//       onClick={onClick}
//       className={`relative h-8 w-14 rounded-full transition-all duration-300 ${
//         checked ? "bg-violet-600" : "bg-gray-300"
//       }`}
//     >
//       <span
//         className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
//           checked ? "left-7" : "left-1"
//         }`}
//       />
//     </button>
//   );

//   return (
//     <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

//       {/* Header */}

//       <div className="border-b border-gray-200 px-6 py-5">

//         <div className="flex items-start gap-3">

//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">

//             <FileText
//               size={20}
//               className="text-violet-600"
//             />

//           </div>

//           <div>

//             <h2 className="text-2xl font-semibold text-gray-800">
//               Report Display Settings
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Control how this test appears on printed and digital reports
//             </p>

//           </div>

//         </div>

//       </div>

//       {/* Body */}

//       <div className="grid grid-cols-1 gap-y-6 gap-x-10 p-6 md:grid-cols-2">

//         {/* Left */}

//         <div className="space-y-6">

//           {/* Show Test */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={settings.showTest}
//               onClick={() =>
//                 toggleSwitch("showTest")
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Show test on report
//             </span>

//           </div>

//           {/* Show Unit */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={settings.showUnit}
//               onClick={() =>
//                 toggleSwitch("showUnit")
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Show unit on report
//             </span>

//           </div>

//           {/* Highlight */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={settings.highlightAbnormal}
//               onClick={() =>
//                 toggleSwitch(
//                   "highlightAbnormal"
//                 )
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Highlight abnormal values
//             </span>

//           </div>

//         </div>

//         {/* Right */}

//         <div className="space-y-6">

//           {/* Reference */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={
//                 settings.showReferenceRange
//               }
//               onClick={() =>
//                 toggleSwitch(
//                   "showReferenceRange"
//                 )
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Show reference range on report
//             </span>

//           </div>

//           {/* Interpretation */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={
//                 settings.showInterpretation
//               }
//               onClick={() =>
//                 toggleSwitch(
//                   "showInterpretation"
//                 )
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Show interpretation on report
//             </span>

//           </div>

//           {/* Trend */}

//           <div className="flex items-center gap-3">

//             <Toggle
//               checked={settings.showTrend}
//               onClick={() =>
//                 toggleSwitch("showTrend")
//               }
//             />

//             <span className="text-base font-medium text-gray-700">
//               Show trend indicator
//             </span>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }
// export default ReportDisplay;