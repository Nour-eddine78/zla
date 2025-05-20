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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines?.slice(0, 3).map((machine: any) => (
            <div key={machine.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-48 bg-gray-200 dark:bg-gray-600">
                {/* Image placeholder - in a real app, this would be fetched from storage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {machine.type === "d11" && (
                    <img 
                      src="https://www.cat.com/en_US/products/new/equipment/dozers/large-dozers/1000035023.html/_jcr_content/contentParsys/twocolumnverticalasset_41acddc9/main/items/imagearea_9e95/image.img.jpg/1581697693433.jpg" 
                      alt={machine.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {machine.type === "ph1" && (
                    <img 
                      src="https://www.constructionequipment.com/sites/ce/files/styles/content_header_medium/public/6015B-hydraulic-shovel.jpg?itok=KIpQj_w3" 
                      alt={machine.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {(machine.type !== "d11" && machine.type !== "ph1") && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                      <span className="text-gray-500 dark:text-gray-400">Image non disponible</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 m-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    machine.currentState === 'running' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {machine.currentState === 'running' ? 'En service' : 'Arrêtée'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{machine.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Méthode: {machine.decapingMethod === 'transport' ? 'Transport' : 
                            machine.decapingMethod === 'poussage' ? 'Poussage' : 'Casement'}
                </p>
                
                {machine.specifications && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spécifications Techniques</h4>
                    <div className="space-y-1">
                      {(() => {
                        try {
                          const specs = JSON.parse(machine.specifications);
                          return Object.entries(specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{String(value)}</span>
                            </div>
                          ));
                        } catch (e) {
                          return (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Spécifications non disponibles</p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewMachineDetails(machine.id)}
                  >
                    Voir les détails
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="mt-6 text-center">
          <Link href="/documentation/machines">
            <Button variant="default" className="bg-primary hover:bg-primary-600 text-white mx-auto">
              <span>Voir toutes les machines</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
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
            <div key={document.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg mr-3">
                    {document.fileType === 'pdf' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 3v5h5M16 13H8v-1h8v1zm0 2H8v1h8v-1zm-3 3H8v1h5v-1z" />
                      </svg>
                    )}
                    {document.fileType === 'xlsx' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 3v5h5M12 18l-4-4h2.55v-3h2.9v3H16l-4 4z" />
                      </svg>
                    )}
                    {document.fileType === 'docx' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 3v5h5M10 12h4M10 16h4M8 10h8" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">{document.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{document.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Catégorie: {document.category === 'equipment' ? 'Équipement' : 
                                       document.category === 'safety' ? 'Sécurité' : 
                                       document.category === 'procedures' ? 'Procédures' : 'Général'}</span>
                      <span>{document.fileSize} MB</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Mise à jour: {new Date(document.lastUpdated).toLocaleDateString('fr-FR')}
                  </span>
                  <a 
                    href={document.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-600"
                  >
                    <span>Télécharger</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/documentation">
            <Button variant="outline" className="mx-auto">
              <span>Voir toute la documentation</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
