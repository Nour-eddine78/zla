import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

type TimeRange = "7days" | "30days" | "90days";

type DataPoint = {
  name: string;
  transport: number;
  poussage: number;
  casement: number;
};

type PerformanceChartProps = {
  data: {
    trend: {
      labels: string[];
      datasets: {
        method: string;
        data: number[];
      }[];
    };
    averages: {
      transport: number;
      poussage: number;
      casement: number;
    };
  };
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  
  // Transform data for chart
  const chartData: DataPoint[] = data.trend.labels.map((label, index) => {
    const point: any = { name: label };
    
    data.trend.datasets.forEach(dataset => {
      point[dataset.method] = dataset.data[index];
    });
    
    return point;
  });
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Performance par Méthode</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={timeRange === "7days" ? "default" : "outline"} 
              onClick={() => setTimeRange("7days")}
              className={timeRange === "7days" ? "bg-primary text-white" : ""}
            >
              7 jours
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === "30days" ? "default" : "outline"} 
              onClick={() => setTimeRange("30days")}
              className={timeRange === "30days" ? "bg-primary text-white" : ""}
            >
              30 jours
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === "90days" ? "default" : "outline"} 
              onClick={() => setTimeRange("90days")}
              className={timeRange === "90days" ? "bg-primary text-white" : ""}
            >
              90 jours
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis domain={[35, 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderColor: '#ddd',
                  borderRadius: '6px',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={30} />
              <Line 
                type="monotone" 
                dataKey="transport" 
                name="Transport" 
                stroke="#1E8449" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="poussage" 
                name="Poussage" 
                stroke="#3498DB" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="casement" 
                name="Casement" 
                stroke="#E67E22" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Transport</div>
            <div className="font-semibold text-gray-800 dark:text-white">
              {data.averages.transport.toFixed(1)} m³/h
            </div>
            <div className="text-xs text-green-500">+3.4%</div>
          </div>
          <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Poussage</div>
            <div className="font-semibold text-gray-800 dark:text-white">
              {data.averages.poussage.toFixed(1)} m³/h
            </div>
            <div className="text-xs text-red-500">-1.2%</div>
          </div>
          <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Casement</div>
            <div className="font-semibold text-gray-800 dark:text-white">
              {data.averages.casement.toFixed(1)} m³/h
            </div>
            <div className="text-xs text-green-500">+2.8%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
