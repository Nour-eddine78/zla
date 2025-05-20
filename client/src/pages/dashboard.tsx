import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/dashboard/stats-card";
import PerformanceChart from "@/components/dashboard/performance-chart";
import MachineCard from "@/components/dashboard/machine-card";
import DocumentCard from "@/components/dashboard/document-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import { Mountain, TruckIcon, GaugeIcon, AlertTriangle, Search, Plus } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

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

  // Fetch machines
  const { data: machines } = useQuery({
    queryKey: ["/api/machines"],
    queryFn: async () => {
      const response = await fetch("/api/machines", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch machines");
      return response.json();
    },
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  // Fetch activities
  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities?limit=4", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  // Handle machine detail view
  const handleViewMachineDetails = (machineId: number) => {
    // You could navigate to a machine detail page, or open a modal
    console.log(`View details for machine: ${machineId}`);
  };

  // Handle view all activities
  const handleViewAllActivities = () => {
    // You could navigate to an activities page
    console.log("View all activities");
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Accueil - Gestion des Opérations de Décapage</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Recherche globale..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
          </div>
          <Link href="/operations/new">
            <Button className="bg-primary hover:bg-primary-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nouvelle Opération</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Volume Total Décapé"
          value={`${formatNumber(statsData?.totalExcavatedVolume || 0)} m³`}
          change={{ value: "8.3% vs mois dernier", positive: true }}
          icon={<Mountain className="h-5 w-5" />}
          iconBgColor="bg-primary-50 dark:bg-primary-900 text-primary"
        />
        
        <StatsCard
          title="Taux de Disponibilité Machines"
          value={`${formatNumber(statsData?.machineAvailability || 0, 1)}%`}
          change={{ value: "2.1% vs semaine dernière", positive: false }}
          icon={<TruckIcon className="h-5 w-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-900 text-blue-500"
        />
        
        <StatsCard
          title="Rendement Moyen"
          value={`${formatNumber(statsData?.averageYield || 0, 1)} m³/h`}
          change={{ value: "5.2% vs objectif", positive: true }}
          icon={<GaugeIcon className="h-5 w-5" />}
          iconBgColor="bg-orange-50 dark:bg-orange-900 text-orange-500"
        />
        
        <StatsCard
          title="Incidents Sécurité (30j)"
          value={statsData?.safetyIncidents30Days || 0}
          change={{ value: "Stable vs mois dernier", positive: undefined }}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBgColor="bg-red-50 dark:bg-red-900 text-red-500"
        />
      </div>

      {/* Machines Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Machines de Décapage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines?.slice(0, 3).map((machine: any) => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onViewDetails={handleViewMachineDetails}
            />
          ))}
        </div>
        
        {/* View All Button */}
        <div className="mt-4 text-center">
          <Button variant="link" className="text-primary hover:text-primary-600 font-medium mx-auto">
            <span>Voir toutes les machines</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Feed */}
        <ActivityFeed 
          activities={activities || []} 
          onViewAll={handleViewAllActivities}
        />
        
        {/* Performance Chart */}
        {performanceData && (
          <PerformanceChart data={performanceData} />
        )}
      </div>

      {/* Documentation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Documentation Technique</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents?.map((document: any) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      </div>
    </div>
  );
}
