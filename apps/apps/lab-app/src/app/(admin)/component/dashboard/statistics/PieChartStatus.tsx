// "use client"
// import {useMemo} from "react"
// import { TrendingUp } from "lucide-react"
// import { Label, Pie, PieChart, Cell } from "recharts"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// interface GraphProps {
//   loading: boolean;
//   stats: { name: string; value: number | string; icon: JSX.Element }[];
//   selectedFilter: string;
//   setSelectedFilter: (value: string) => void;
//   customRange: { startDate: Date | null; endDate: Date | null };
//   setCustomRange: (value: { startDate: Date | null; endDate: Date | null }) => void;
// }

// // Define color scheme
// const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];

// const chartConfig = {
//   visitors: { label: "Visitors" },
//   chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
//   safari: { label: "Safari", color: "hsl(var(--chart-2))" },
//   firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
//   edge: { label: "Edge", color: "hsl(var(--chart-4))" },
//   other: { label: "Other", color: "hsl(var(--chart-5))" },
// } satisfies ChartConfig;

// const PieChartStatus = ({ loading, stats, selectedFilter, customRange }: GraphProps) => {
//   if (loading) {
//     return <p className="text-center text-gray-500">Loading data...</p>;
//   }

//   const chartData = stats.map((stat) => ({
//     name: stat.name,
//     value: Number(stat.value) || 0, 
//   }));

//   const totalVisitors = useMemo(() => {
//     return chartData.reduce((acc, curr) => acc + curr.value, 0);
//   }, [chartData]);
  
  
//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Visitor Statistics</CardTitle>
//         <CardDescription>
//           {customRange.startDate && customRange.endDate
//             ? `Data from ${customRange.startDate.toDateString()} to ${customRange.endDate.toDateString()}`
//             : `Showing data for: ${selectedFilter}`}
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
//           <PieChart>
//             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//             <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
//               {chartData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//               ))}
//               <Label
//                 content={({ viewBox }) => {
//                   if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                     return (
//                       <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
//                         <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
//                           {totalVisitors.toLocaleString()}
//                         </tspan>
//                         <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
//                           Total Visitors
//                         </tspan>
//                       </text>
//                     );
//                   }
//                 }}
//               />
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           Showing total visitors for {customRange.startDate ? "the selected period" : selectedFilter} <TrendingUp className="h-4 w-4" />
//         </div>
//         <ul className="mt-2 w-full space-y-1 text-xs text-muted-foreground">
//           {chartData.map((entry, index) => (
//             <li key={index} className="flex justify-between">
//               <span>{entry.name}</span>
//               <span>{totalVisitors > 0 ? ((entry.value / totalVisitors) * 100).toFixed(1) + "%" : "0%"}</span>
//             </li>
//           ))}
//         </ul>
//       </CardFooter>
//     </Card>
//   );
// }

// export default PieChartStatus;







"use client"
import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface GraphProps {
  loading: boolean;
  stats: { name: string; value: number | string; icon: JSX.Element }[];
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  customRange: { startDate: Date | null; endDate: Date | null };
  setCustomRange: (value: { startDate: Date | null; endDate: Date | null }) => void;
}

// Define color scheme
const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];

const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  edge: { label: "Edge", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const PieChartStatus = ({ loading, stats, selectedFilter, customRange }: GraphProps) => {
  const chartData = stats.map((stat) => ({
    name: stat.name,
    value: Number(stat.value) || 0, 
  }));

  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading data...</p>;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Visitor Statistics</CardTitle>
        <CardDescription>
          {customRange.startDate && customRange.endDate
            ? `Data from ${customRange.startDate.toDateString()} to ${customRange.endDate.toDateString()}`
            : `Showing data for: ${selectedFilter}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Total Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Showing total visitors for {customRange.startDate ? "the selected period" : selectedFilter} <TrendingUp className="h-4 w-4" />
        </div>
        <ul className="mt-2 w-full space-y-1 text-xs text-muted-foreground">
          {chartData.map((entry, index) => (
            <li key={index} className="flex justify-between">
              <span>{entry.name}</span>
              <span>{totalVisitors > 0 ? ((entry.value / totalVisitors) * 100).toFixed(1) + "%" : "0%"}</span>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  );
}

export default PieChartStatus;
