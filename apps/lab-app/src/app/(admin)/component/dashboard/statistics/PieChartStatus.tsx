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







// "use client"
// import { useMemo } from "react"
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
//   const chartData = stats.map((stat) => ({
//     name: stat.name,
//     value: Number(stat.value) || 0, 
//   }));

//   const totalVisitors = useMemo(() => {
//     return chartData.reduce((acc, curr) => acc + curr.value, 0);
//   }, [chartData]);

//   if (loading) {
//     return <p className="text-center text-gray-500">Loading data...</p>;
//   }

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
import { TrendingUp, ArrowUpRight } from "lucide-react"
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

const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0", "#FF9F40"];

const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  edge: { label: "Edge", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const PieChartStatus = ({ loading, stats, selectedFilter, customRange }: GraphProps) => {
  const chartData = useMemo(() =>
    stats.map((stat) => ({
      name: stat.name,
      value: Number(stat.value) || 0,
      icon: stat.icon
    })),
    [stats]
  );

  const totalVisitors = useMemo(() =>
    chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  const topCategory = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, item) => item.value > max.value ? item : max);
  }, [chartData]);

  if (loading) {
    return (
      <Card className="flex flex-col h-full animate-pulse">
        <CardHeader className="items-center pb-0">
          <CardTitle className="h-6 w-32 bg-gray-200 rounded"></CardTitle>
          <CardDescription className="h-4 w-48 bg-gray-100 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="h-40 w-40 bg-gray-100 rounded-full"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="h-4 w-full bg-gray-100 rounded"></div>
          <div className="h-3 w-full bg-gray-50 rounded"></div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg font-bold text-gray-800">Visitor Statistics</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {customRange.startDate && customRange.endDate
            ? `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`
            : `Showing data for: ${selectedFilter}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0 relative">
        {topCategory && (
          <div className="absolute top-2 right-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>Top: {topCategory.name}</span>
          </div>
        )}

        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              formatter={(value, name) => [
                `${value} (${((Number(value) / totalVisitors) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={1}
              animationDuration={500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <g>
                        <text
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </text>
                        <text
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 20}
                          textAnchor="middle"
                          className="fill-muted-foreground text-sm"
                        >
                          Total Visitors
                        </text>
                      </g>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-3 text-sm pt-0">
        <div className="flex items-center gap-2 font-medium text-gray-700 bg-gray-50/50 px-3 py-2 rounded-lg">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>Showing total visitors for {customRange.startDate ? "the selected period" : selectedFilter}</span>
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {totalVisitors.toLocaleString()} total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {chartData.map((entry, index) => {
            const percentage = totalVisitors > 0 ? ((entry.value / totalVisitors) * 100).toFixed(1) : 0;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50/80 transition-colors border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    <span className="text-white text-[10px] font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{entry.name}</span>
                    <span className="text-xs text-gray-500">{entry.value.toLocaleString()} visitors</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-bold text-gray-800">{percentage}%</span>
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}

export default PieChartStatus;