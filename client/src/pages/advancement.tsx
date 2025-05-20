import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, Filter, Info } from "lucide-react";

// Mock data for zones
const zones = [
  {
    id: 1,
    name: "Panneau Nord-Est",
    progress: 78,
    sections: [
      { id: 1, name: "Tranche A-1", progress: 100, levels: ["N-1", "N-2", "N-3"], volume: 12500 },
      { id: 2, name: "Tranche A-2", progress: 85, levels: ["N-1", "N-2"], volume: 9800 },
      { id: 3, name: "Tranche A-3", progress: 50, levels: ["N-1"], volume: 7200 }
    ]
  },
  {
    id: 2,
    name: "Panneau Sud-Ouest",
    progress: 45,
    sections: [
      { id: 4, name: "Tranche B-1", progress: 70, levels: ["N-1", "N-2"], volume: 10500 },
      { id: 5, name: "Tranche B-2", progress: 40, levels: ["N-1"], volume: 6300 },
      { id: 6, name: "Tranche B-3", progress: 25, levels: ["N-1"], volume: 5100 }
    ]
  },
  {
    id: 3,
    name: "Panneau Central",
    progress: 60,
    sections: [
      { id: 7, name: "Tranche C-1", progress: 90, levels: ["N-1", "N-2"], volume: 11200 },
      { id: 8, name: "Tranche C-2", progress: 65, levels: ["N-1"], volume: 8500 },
      { id: 9, name: "Tranche C-3", progress: 25, levels: ["N-1"], volume: 4900 }
    ]
  }
];

// Mock data for planned vs actual volumes
const planningData = [
  { month: "Janvier", planned: 45000, actual: 43200, variance: -4.0 },
  { month: "Février", planned: 42000, actual: 44500, variance: 6.0 },
  { month: "Mars", planned: 48000, actual: 47200, variance: -1.7 },
  { month: "Avril", planned: 50000, actual: 49100, variance: -1.8 },
  { month: "Mai", planned: 52000, actual: 54800, variance: 5.4 },
  { month: "Juin", planned: 55000, actual: 54200, variance: -1.5 }
];

// Helper function to determine progress color
const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

export default function Advancement() {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("semester");
  
  // Calculate total progress across all zones
  const totalProgress = Math.round(
    zones.reduce((sum, zone) => sum + zone.progress, 0) / zones.length
  );
  
  // Calculate total volume
  const totalVolume = zones.reduce(
    (sum, zone) => sum + zone.sections.reduce(
      (sectionSum, section) => sectionSum + section.volume, 0
    ), 0
  );
  
  // Filter zones based on selection
  const filteredZones = selectedZone === "all" 
    ? zones 
    : zones.filter(zone => zone.id.toString() === selectedZone);
  
  // Handle export data
  const handleExportData = () => {
    alert("Export functionality would be implemented here");
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Suivi des Avancements</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center" onClick={handleExportData}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filtres</span>
          </Button>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Progression Globale</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    strokeDasharray={`${totalProgress * 3.52} 352`}
                    strokeDashoffset="0"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-800 dark:text-white">{totalProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Volume Total Décapé</h3>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {totalVolume.toLocaleString()} m³
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Objectif: {(totalVolume * 1.2).toLocaleString()} m³
              </div>
              <Progress className="h-2 mt-4" value={Math.round((totalVolume / (totalVolume * 1.2)) * 100)} />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {Math.round((totalVolume / (totalVolume * 1.2)) * 100)}% de l'objectif atteint
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Avancement par Zone</h3>
              <div className="space-y-4">
                {zones.map(zone => (
                  <div key={zone.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{zone.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{zone.progress}%</span>
                    </div>
                    <Progress 
                      className={`h-2 ${getProgressColor(zone.progress)}`}
                      value={zone.progress} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Progress Map */}
      <Card className="shadow-md mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Carte des Avancements
            </CardTitle>
            <div>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les zones</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredZones.map(zone => (
              <div key={zone.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{zone.name}</h3>
                  <Badge className={
                    zone.progress >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    zone.progress >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }>
                    {zone.progress}% Complété
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {zone.sections.map(section => (
                    <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {section.name}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6 ml-1">
                                  <Info className="h-4 w-4 text-gray-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Volume: {section.volume.toLocaleString()} m³</p>
                                <p>Niveaux: {section.levels.join(", ")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {section.progress}%
                        </span>
                      </div>
                      <Progress 
                        className={`h-2 ${getProgressColor(section.progress)}`}
                        value={section.progress} 
                      />
                      <div className="mt-2 flex flex-wrap gap-1">
                        {section.levels.map(level => (
                          <Badge key={level} variant="outline" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Planning vs. Actual */}
      <Card className="shadow-md mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Planifié vs. Réalisé
            </CardTitle>
            <div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="semester">Semestre</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right">Volume Planifié (m³)</TableHead>
                <TableHead className="text-right">Volume Réalisé (m³)</TableHead>
                <TableHead className="text-right">Écart (%)</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planningData.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell className="text-right">{month.planned.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{month.actual.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={month.variance >= 0 ? "text-green-600" : "text-red-600"}>
                      {month.variance >= 0 ? "+" : ""}{month.variance.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={
                      month.variance >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      month.variance >= -3 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }>
                      {month.variance >= 0 ? "Conforme" : month.variance >= -3 ? "Alerte" : "Retard"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Total row */}
              <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {planningData.reduce((sum, month) => sum + month.planned, 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {planningData.reduce((sum, month) => sum + month.actual, 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const totalPlanned = planningData.reduce((sum, month) => sum + month.planned, 0);
                    const totalActual = planningData.reduce((sum, month) => sum + month.actual, 0);
                    const variance = ((totalActual - totalPlanned) / totalPlanned) * 100;
                    return (
                      <span className={variance >= 0 ? "text-green-600" : "text-red-600"}>
                        {variance >= 0 ? "+" : ""}{variance.toFixed(1)}%
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const totalPlanned = planningData.reduce((sum, month) => sum + month.planned, 0);
                    const totalActual = planningData.reduce((sum, month) => sum + month.actual, 0);
                    const variance = ((totalActual - totalPlanned) / totalPlanned) * 100;
                    return (
                      <Badge className={
                        variance >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        variance >= -3 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }>
                        {variance >= 0 ? "Conforme" : variance >= -3 ? "Alerte" : "Retard"}
                      </Badge>
                    );
                  })()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
