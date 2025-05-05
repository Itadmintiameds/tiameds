"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loader from "../../common/Loader";
import {
  ChartContainer
} from "@/components/ui/chart";

interface BarGraphProps {
  loading: boolean;
  stats: { name: string; value: number | string; icon: JSX.Element }[];
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  customRange: { startDate: Date | null; endDate: Date | null };
  setCustomRange: (value: { startDate: Date | null; endDate: Date | null }) => void;
}

const BarGraph = ({ loading, stats }: BarGraphProps) => {
  const chartData = [
    { Patient: "Number of Patients", value: stats.find(stat => stat.name === "Number of Patients")?.value ?? 0 },
    { Patient: "Number of Visits", value: stats.find(stat => stat.name === "Number of Visits")?.value ?? 0 },
    { Patient: "Collected Samples", value: stats.find(stat => stat.name === "Collected Samples")?.value ?? 0 },
    { Patient: "Pending Samples", value: stats.find(stat => stat.name === "Pending Samples")?.value ?? 0 },
    { Patient: "Paid Visits", value: stats.find(stat => stat.name === "Paid Visits")?.value ?? 0 },
    { Patient: "Total Sales", value: stats.find(stat => stat.name === "Total Sales")?.value ?? 0 },
    { Patient: "Products Sold", value: stats.find(stat => stat.name === "Products Sold")?.value ?? 0 },
    { Patient: "Average Order Value", value: stats.find(stat => stat.name === "Average Order Value")?.value ?? 0 },
    { Patient: "Total Tests", value: stats.find(stat => stat.name === "Total Tests")?.value ?? 0 },
  ];

  return (
    <>
      {
        loading ? (
          <Loader />) : (
          <Card>
            <CardHeader>
              <CardTitle>Bar Chart</CardTitle>
              <CardDescription>Showing key statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                label: { label: <span>Patients</span> },
                value: { label: "value" },
              }}>
                <BarChart width={600} height={300} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Patient" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing statistics for key performance metrics
              </div>
            </CardFooter>
          </Card>
        )
      }
    </>
  );
};

export default BarGraph;
