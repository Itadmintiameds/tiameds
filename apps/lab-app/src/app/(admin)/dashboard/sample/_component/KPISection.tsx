"use client";

import { useState } from "react";

type KPIItem = {
  title: string;
  value: string;
};

interface KPISectionProps {
  data: KPIItem[];
  onCardChange?: (index: number) => void;
}

const KPISection = ({
  data,
  onCardChange,
}: KPISectionProps) => {
  const [selectedCard, setSelectedCard] = useState(0);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);

    if (onCardChange) {
      onCardChange(index);
    }
  };

  const getCardStyles = (index: number) => {
    const isSelected = selectedCard === index;

    switch (index) {
      case 0:
        return {
          cardBg: isSelected
            ? "bg-secondary-200"
            : "bg-white",
          titleColor: "text-pneutral-900",
          valueColor: "text-pneutral-900",
        };

      case 1:
        return {
          cardBg: isSelected
            ? "bg-info-500"
            : "bg-white",
          titleColor: isSelected
            ? "text-white"
            : "text-pneutral-900",
          valueColor: isSelected
            ? "text-white"
            : "text-info-500",
        };

      case 2:
        return {
          cardBg: isSelected
            ? "bg-danger-500"
            : "bg-white",
          titleColor: isSelected
            ? "text-danger-900"
            : "text-pneutral-900",
          valueColor: isSelected
            ? "text-danger-900"
            : "text-danger-600",
        };

      case 3:
        return {
          cardBg: isSelected
            ? "bg-success-400"
            : "bg-white",
          titleColor: isSelected
            ? "text-success-900"
            : "text-pneutral-900",
          valueColor: isSelected
            ? "text-success-900"
            : "text-success-900",
        };

      default:
        return {
          cardBg: "bg-white",
          titleColor: "text-pneutral-900",
          valueColor: "text-pneutral-900",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((item, index) => {
        const styles = getCardStyles(index);

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => handleCardClick(index)}
            className={`
              rounded-xl
              border
              border-pneutral-100
              p-5
              text-left
              transition-all
              duration-200
              cursor-pointer
              ${styles.cardBg}
            `}
          >
            <h3
              className={`text-sm font-medium ${styles.titleColor}`}
            >
              {item.title}
            </h3>

            <p
              className={`mt-4 text-3xl font-semibold ${styles.valueColor}`}
            >
              {item.value}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default KPISection;










// type KPIItem = {
//   title: string;
//   value: string;
//   valueColor: string;
//   bgColor?: string;
// };

// interface KPISectionProps {
//   data: KPIItem[];
// }

// const KPISection = ({ data }: KPISectionProps) => {
//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//       {data.map((item, index) => (
//         <div
//           key={item.title}
//           className={`rounded-xl border border-pneutral-100 p-5
//           ${index === 0 ? "bg-secondary-200" : "bg-white"}`}
//         >
//           <h3 className="text-sm font-medium text-pneutral-900">
//             {item.title}
//           </h3>

//           <p className={`mt-4 text-3xl font-semibold ${item.valueColor}`}>
//             {item.value}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default KPISection;