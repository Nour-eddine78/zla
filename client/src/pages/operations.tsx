import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Eye, Edit, Trash } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { decapingMethodMap, machineStateMap, generateFilename } from "@/lib/utils";
import * as XLSX from 'xlsx';

export default function Operations() {
  const [, navigate] = useLocation();
  const [deleteOperationId, setDeleteOperationId] = useState<number | null>(null);
  
  // Fetch operations
  const { data: operations, isLoading } = useQuery({
    queryKey: ["/api/operations"],
    queryFn: async () => {
      const response = await fetch("/api/operations", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch operations");
      return response.json();
    },
  });
  
  // Fetch machines for lookup
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
  
  // Map of machine IDs to names
  const machineNameMap = machines?.reduce((acc: Record<number, string>, machine: any) => {
    acc[machine.id] = machine.name;
    return acc;
  }, {}) || {};
  
  // Handle export to Excel
  const handleExportExcel = () => {
    if (!operations) return;
    
    // Prepare data for export
    const exportData = operations.map((op: any) => ({
      "ID Opération": op.operationId,
      "Date": format(new Date(op.date), 'dd/MM/yyyy', { locale: fr }),
      "Méthode": decapingMethodMap[op.decapingMethod],
      "Machine": machineNameMap[op.machineId],
      "Poste": op.shift,
      "Panneau": op.panel,
      "Tranche": op.section,
      "Niveau": op.level,
      "État": machineStateMap[op.machineState],
      "Heures de marche": op.runningHours,
      "Heures d'arrêt": op.stopHours,
      "Volume décapé (m³)": op.excavatedVolume,
      "Observations": op.observations || ""
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Opérations");
    
    // Generate file name
    const fileName = generateFilename("Operations", "xlsx");
    
    // Export to Excel
    XLSX.writeFile(workbook, fileName);
  };
  
  // Handle delete operation
  const handleDeleteOperation = async () => {
    if (!deleteOperationId) return;
    
    try {
      const response = await fetch(`/api/operations/${deleteOperationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (response.ok) {
        // Refresh operations list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting operation:", error);
    }
    
    setDeleteOperationId(null);
  };
  
  // Table columns
  const columns = [
    {
      accessorKey: "operationId",
      header: "ID Opération",
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("operationId")}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => format(new Date(row.getValue("date")), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      accessorKey: "decapingMethod",
      header: "Méthode",
      cell: ({ row }: any) => (
        <Badge variant="outline" className={
          row.getValue("decapingMethod") === "transport" ? "bg-blue-50 text-blue-700 border-blue-200" :
          row.getValue("decapingMethod") === "poussage" ? "bg-green-50 text-green-700 border-green-200" :
          "bg-orange-50 text-orange-700 border-orange-200"
        }>
          {decapingMethodMap[row.getValue("decapingMethod")]}
        </Badge>
      ),
    },
    {
      accessorKey: "machineId",
      header: "Machine",
      cell: ({ row }: any) => machineNameMap[row.getValue("machineId")] || "—",
    },
    {
      accessorKey: "shift",
      header: "Poste",
      cell: ({ row }: any) => row.getValue("shift"),
    },
    {
      accessorKey: "panel",
      header: "Panneau",
      cell: ({ row }: any) => row.getValue("panel"),
    },
    {
      accessorKey: "machineState",
      header: "État Machine",
      cell: ({ row }: any) => (
        <Badge variant={row.getValue("machineState") === "running" ? "success" : "warning"}>
          {machineStateMap[row.getValue("machineState")]}
        </Badge>
      ),
    },
    {
      accessorKey: "excavatedVolume",
      header: "Volume (m³)",
      cell: ({ row }: any) => row.getValue("excavatedVolume"),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/operations/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Voir</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/operations/${row.original.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteOperationId(row.original.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              <span>Supprimer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Suivi des Opérations</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center" onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Link href="/operations/new">
            <Button className="bg-primary hover:bg-primary-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nouvelle Opération</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <DataTable
          columns={columns}
          data={operations || []}
          searchPlaceholder="Rechercher une opération..."
          exportData={handleExportExcel}
        />
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOperationId} onOpenChange={() => setDeleteOperationId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteOperationId(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOperation}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
