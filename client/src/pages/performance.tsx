import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decapingMethodMap } from "@/lib/utils";
import { Download, Filter } from "lucide-react";

// Mock time series data (in a real app, this would come from API)
const mockTimeSeriesData = [
  { date: "Janvier", transport: 42.1, poussage: 38.2, casement: 41.3, total: 780 },
  { date: "Février", transport: 44.3, poussage: 37.8, casement: 40.9, total: 810 },
  { date: "Mars", transport: 43.7, poussage: 39.1, casement: 42.2, total: 795 },
  { date: "Avril", transport: 45.2, poussage: 38.6, casement: 41.5, total: 825 },
  { date: "Mai", transport: 46.1, poussage: 39.3, casement: 43.0, total: 850 },
  { date: "Juin", transport: 45.6, poussage: 38.9, casement: 42.4, total: 840 }
];

// Mock machine performance data
const mockMachinePerformance = [
  { name: "Bulldozer D11-1", performance: 87, uptime: 92 },
  { name: "Excavatrice PH1", performance: 93, uptime: 89 },
  { name: "Transwine 777F", performance: 81, uptime: 85 },
  { name: "Bulldozer D11-2", performance: 90, uptime: 94 },
  { name: "Excavatrice PH2", performance: 88, uptime: 90 }
];

// Volume by method pie chart data
const volumeByMethodData = [
  { name: "Transport", value: 45000 },
  { name: "Poussage", value: 35000 },
  { name: "Casement", value: 40000 }
];

const COLORS = ["#1E8449", "#3498DB", "#E67E22"];

export default function Performance() {
  const [timeRange, setTimeRange] = useState("6months");
  const [methodFilter, setMethodFilter] = useState("all");
  
  // Fetch performance data
  const { data: performanceData } = useQuery({
    queryKey: ["/api/performance/by-method"],
    queryFn: async () => {
      const response = await fetch("/api/performance/by-method", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch performance data");
      return response.json();
    },
  });
  
  // Calculate combined rendering
  const combinedRendering = mockTimeSeriesData.map(item => {
    const total = (item.transport + item.poussage + item.casement) / 3;
    return { ...item, combined: total.toFixed(1) };
  });
  
  // Filter data based on selected method
  const filteredData = methodFilter === "all" 
    ? mockTimeSeriesData 
    : mockTimeSeriesData.map(item => ({
        ...item,
        [methodFilter]: item[methodFilter as keyof typeof item],
      }));
  
  // Handle export data
  const handleExportData = () => {
    alert("Export functionality would be implemented here");
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de Bord des Performances</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filtres</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 lg:col-span-2 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Évolution du Rendement (m³/h)
              </CardTitle>
              <div className="flex space-x-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 mois</SelectItem>
                    <SelectItem value="3months">3 mois</SelectItem>
                    <SelectItem value="6months">6 mois</SelectItem>
                    <SelectItem value="1year">1 an</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="poussage">Poussage</SelectItem>
                    <SelectItem value="casement">Casement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[35, 50]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderColor: '#ddd',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={30} />
                  {(methodFilter === "all" || methodFilter === "transport") && (
                    <Line 
                      type="monotone" 
                      dataKey="transport" 
                      name="Transport" 
                      stroke="#1E8449" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {(methodFilter === "all" || methodFilter === "poussage") && (
                    <Line 
                      type="monotone" 
                      dataKey="poussage" 
                      name="Poussage" 
                      stroke="#3498DB" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {(methodFilter === "all" || methodFilter === "casement") && (
                    <Line 
                      type="monotone" 
                      dataKey="casement" 
                      name="Casement" 
                      stroke="#E67E22" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Volume par Méthode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volumeByMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {volumeByMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value.toLocaleString()} m³`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-4">
              {volumeByMethodData.map((entry, index) => (
                <div key={entry.name} className="text-center">
                  <div className="flex items-center justify-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-1" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.value.toLocaleString()} m³
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Performance des Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance">
              <TabsList className="mb-4">
                <TabsTrigger value="performance">Rendement</TabsTrigger>
                <TabsTrigger value="uptime">Disponibilité</TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockMachinePerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Performance']} />
                      <Legend />
                      <Bar 
                        dataKey="performance" 
                        name="Performance" 
                        fill="#1E8449" 
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="uptime">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockMachinePerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Disponibilité']} />
                      <Legend />
                      <Bar 
                        dataKey="uptime" 
                        name="Disponibilité" 
                        fill="#3498DB" 
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Production Mensuelle (m³)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value.toLocaleString()} m³`, 
                      name === 'total' ? 'Volume Total' : name
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    name="Volume Total" 
                    fill="#1E8449" 
                    barSize={40}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Rendement Moyen par Méthode (m³/h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[performanceData?.averages || { transport: 0, poussage: 0, casement: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 50]} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)} m³/h`, 'Rendement']} />
                  <Legend />
                  <Bar 
                    dataKey="transport" 
                    name="Transport" 
                    fill="#1E8449" 
                    barSize={60}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="poussage" 
                    name="Poussage" 
                    fill="#3498DB" 
                    barSize={60}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="casement" 
                    name="Casement" 
                    fill="#E67E22" 
                    barSize={60}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
