import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, CheckCircle, Play, Plus, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";

// Incident form schema
const incidentSchema = z.object({
  date: z.string().nonempty("La date est requise"),
  incidentType: z.string().nonempty("Le type d'incident est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  severity: z.string().nonempty("La sévérité est requise"),
  location: z.string().nonempty("Le lieu est requis"),
  status: z.string().nonempty("Le statut est requis"),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

// Mock audit data
const mockAudits = [
  { 
    id: 1,
    date: new Date('2025-03-20'),
    type: 'HSE Complet',
    area: 'Panneau Nord-Est',
    status: 'Complété',
    score: 92,
    conductor: 'Youssef Benali',
    observations: 'Quelques points mineurs à améliorer dans la signalisation.'
  },
  { 
    id: 2,
    date: new Date('2025-03-15'),
    type: 'Sécurité Équipements',
    area: 'Zone de Maintenance',
    status: 'Complété',
    score: 88,
    conductor: 'Fatima Zahra',
    observations: 'Mise à jour des procédures de maintenance préventive nécessaire.'
  },
  { 
    id: 3,
    date: new Date('2025-03-28'),
    type: 'HSE Spécifique',
    area: 'Tranche B-3',
    status: 'Planifié',
    score: null,
    conductor: 'Ahmed Bouhmidi',
    observations: 'Audit de suivi des actions correctives précédentes.'
  }
];

// Severity colors
const severityColors: Record<string, string> = {
  "critique": "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  "majeur": "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  "mineur": "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  "négligeable": "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
};

// Status colors
const statusColors: Record<string, string> = {
  "ouvert": "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  "en_cours": "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  "résolu": "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
};

// Stats chart colors
const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

export default function Safety() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Fetch safety incidents
  const { data: incidents, isLoading } = useQuery({
    queryKey: ["/api/safety-incidents"],
    queryFn: async () => {
      const response = await fetch("/api/safety-incidents", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch safety incidents");
      return response.json();
    },
  });
  
  // Prepare incident form
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      incidentType: "",
      description: "",
      severity: "",
      location: "",
      status: "ouvert",
    },
  });
  
  // Handle incident form submission
  const onSubmit = async (data: IncidentFormValues) => {
    try {
      await apiRequest("POST", "/api/safety-incidents", data);
      queryClient.invalidateQueries({ queryKey: ["/api/safety-incidents"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Incident créé",
        description: "L'incident de sécurité a été enregistré avec succès.",
      });
    } catch (error) {
      console.error("Error creating incident:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'incident.",
        variant: "destructive",
      });
    }
  };
  
  // Prepare incident stats (mock data if necessary)
  const incidentStats = [
    { name: "Critiques", value: incidents?.filter((i: any) => i.severity === "critique").length || 0 },
    { name: "Majeurs", value: incidents?.filter((i: any) => i.severity === "majeur").length || 1 },
    { name: "Mineurs", value: incidents?.filter((i: any) => i.severity === "mineur").length || 2 },
    { name: "Négligeables", value: incidents?.filter((i: any) => i.severity === "négligeable").length || 0 }
  ].filter(item => item.value > 0);
  
  // Incidents table columns
  const incidentColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => format(new Date(row.getValue("date")), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      accessorKey: "incidentType",
      header: "Type",
    },
    {
      accessorKey: "location",
      header: "Lieu",
    },
    {
      accessorKey: "severity",
      header: "Sévérité",
      cell: ({ row }: any) => (
        <Badge className={severityColors[row.getValue("severity") || "mineur"]}>
          {row.getValue("severity")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }: any) => (
        <Badge className={statusColors[row.getValue("status") || "ouvert"]}>
          {row.getValue("status") === "en_cours" ? "En cours" : 
           row.getValue("status") === "résolu" ? "Résolu" : "Ouvert"}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => {
        const description = row.getValue("description") as string;
        return description.length > 50 ? `${description.substring(0, 50)}...` : description;
      },
    }
  ];
  
  // Audits table columns
  const auditColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => format(row.getValue("date"), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "area",
      header: "Zone",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }: any) => (
        <Badge className={
          row.getValue("status") === "Complété" 
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        }>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }: any) => {
        const score = row.getValue("score");
        return score ? `${score}%` : "-";
      },
    },
    {
      accessorKey: "conductor",
      header: "Réalisé par",
    }
  ];

  // Handle export data
  const handleExportData = () => {
    alert("Export functionality would be implemented here");
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sécurité & Incidents</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center" onClick={handleExportData}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                <span>Déclarer un Incident</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Déclaration d'Incident de Sécurité</DialogTitle>
                <DialogDescription>
                  Veuillez remplir tous les champs pour déclarer un nouvel incident de sécurité.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="incidentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type d'incident</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="accident">Accident</SelectItem>
                              <SelectItem value="presque_accident">Presque-accident</SelectItem>
                              <SelectItem value="non_conformité">Non-conformité</SelectItem>
                              <SelectItem value="observation">Observation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sévérité</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une sévérité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="critique">Critique</SelectItem>
                              <SelectItem value="majeur">Majeur</SelectItem>
                              <SelectItem value="mineur">Mineur</SelectItem>
                              <SelectItem value="négligeable">Négligeable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Panneau Nord-Est" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez l'incident en détail..." 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <input type="hidden" {...form.register("status")} />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-primary">
                      Soumettre
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-300">Incidents Ouverts</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-200">
                  {incidents?.filter((i: any) => i.status === 'ouvert').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full mr-4">
                <Play className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300">En Cours</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                  {incidents?.filter((i: any) => i.status === 'en_cours').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-300">Résolus</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                  {incidents?.filter((i: any) => i.status === 'résolu').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">Taux de Résolution</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
                  {incidents?.length ? 
                    `${Math.round((incidents.filter((i: any) => i.status === 'résolu').length / incidents.length) * 100)}%` : 
                    "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Incidents par Sévérité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} incident(s)`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Prochains Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAudits
                .filter(audit => audit.status === 'Planifié')
                .map(audit => (
                  <div key={audit.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{audit.type}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{audit.area}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {audit.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{format(audit.date, 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{audit.conductor}</span>
                    </div>
                    {audit.observations && (
                      <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">
                        {audit.observations}
                      </p>
                    )}
                  </div>
                ))
              }
              
              {mockAudits.filter(audit => audit.status === 'Planifié').length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucun audit planifié
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Suivi de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidents">
              <TabsList className="mb-4">
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="audits">Audits HSE</TabsTrigger>
              </TabsList>
              <TabsContent value="incidents">
                <DataTable
                  columns={incidentColumns}
                  data={incidents || []}
                  searchPlaceholder="Rechercher un incident..."
                  exportData={handleExportData}
                />
              </TabsContent>
              <TabsContent value="audits">
                <DataTable
                  columns={auditColumns}
                  data={mockAudits}
                  searchPlaceholder="Rechercher un audit..."
                  exportData={handleExportData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
