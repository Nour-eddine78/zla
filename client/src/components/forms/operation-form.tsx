import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// Extend the operation schema for the form
const operationFormSchema = z.object({
  operationId: z.string().optional(),
  date: z.string().nonempty("La date est requise"),
  decapingMethod: z.enum(["transport", "poussage", "casement"], {
    required_error: "Veuillez sélectionner une méthode de décapage",
  }),
  machineId: z.number({
    required_error: "Veuillez sélectionner une machine",
  }),
  shift: z.enum(["1", "2", "3"], {
    required_error: "Veuillez sélectionner un poste",
  }),
  panel: z.string().nonempty("Le panneau est requis"),
  section: z.string().nonempty("La tranche est requise"),
  level: z.string().nonempty("Le niveau est requis"),
  machineState: z.enum(["running", "stopped"], {
    required_error: "Veuillez sélectionner l'état de la machine",
  }),
  runningHours: z.number().min(0, "Les heures de marche doivent être positives"),
  stopHours: z.number().min(0, "Les heures d'arrêt doivent être positives"),
  excavatedVolume: z.number().min(0, "Le volume sauté doit être positif"),
  observations: z.string().optional(),
  
  // Transport fields
  dischargeDistance: z.number().optional(),
  truckCount: z.number().optional(),
  excavatorCount: z.number().optional(),
  
  // Poussage fields
  bulldozerCount: z.number().optional(),
  equipmentState: z.string().optional(),
  excavatedMeterage: z.number().optional(),
  
  // Casement fields
  machineCount: z.number().optional(),
  interventionType: z.string().optional(),
});

type OperationFormValues = z.infer<typeof operationFormSchema>;

export default function OperationForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMethodFields, setCurrentMethodFields] = useState<string | null>(null);
  
  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      shift: "1",
      runningHours: 0,
      stopHours: 0,
      excavatedVolume: 0,
      machineState: "running",
    }
  });
  
  const selectedMethod = form.watch("decapingMethod");
  
  // Fetch machines based on selected method
  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines", selectedMethod],
    queryFn: async ({ queryKey }) => {
      const method = queryKey[1];
      if (!method) return [];
      const response = await fetch(`/api/machines?method=${method}`);
      if (!response.ok) throw new Error("Failed to fetch machines");
      return await response.json();
    },
    enabled: !!selectedMethod
  });
  
  // Update available fields based on selected method
  useEffect(() => {
    if (selectedMethod) {
      setCurrentMethodFields(selectedMethod);
    } else {
      setCurrentMethodFields(null);
    }
  }, [selectedMethod]);
  
  const onSubmit = async (data: OperationFormValues) => {
    try {
      // Convert string shift to number
      const shiftNumber = parseInt(data.shift);
      
      // Create the submission data
      const submissionData = {
        ...data,
        shift: shiftNumber,
      };
      
      // Submit to API
      await apiRequest("POST", "/api/operations", submissionData);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show success message
      toast({
        title: "Opération enregistrée",
        description: "L'opération a été créée avec succès.",
      });
      
      // Navigate back to operations list
      setLocation("/operations");
    } catch (error) {
      console.error("Error submitting operation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'opération.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Suivi des Opérations</h1>
          <div className="flex items-center space-x-2">
            <Button type="submit" className="bg-primary hover:bg-primary-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Enregistrer</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/operations")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Annuler</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nouvelle Fiche d'Opération</h2>
            <Button type="button" variant="ghost" size="sm" className="text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Cloner une fiche</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ID de la fiche */}
            <FormField
              control={form.control}
              name="operationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de la fiche</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Généré automatiquement" 
                      {...field} 
                      disabled 
                      className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date d'intervention */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'intervention</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Méthode de décapage */}
            <FormField
              control={form.control}
              name="decapingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de décapage</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une méthode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="poussage">Poussage</SelectItem>
                      <SelectItem value="casement">Casement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Machine */}
            <FormField
              control={form.control}
              name="machineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={!selectedMethod}
                  >
                    <FormControl>
                      <SelectTrigger className={!selectedMethod ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}>
                        <SelectValue placeholder={!selectedMethod ? "Sélectionner d'abord une méthode" : "Sélectionner une machine"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {machines.map((machine: any) => (
                        <SelectItem key={machine.id} value={machine.id.toString()}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Poste */}
            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal">1</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="2" />
                        </FormControl>
                        <FormLabel className="font-normal">2</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="font-normal">3</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Panneau */}
            <FormField
              control={form.control}
              name="panel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panneau</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nord-Est" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tranche */}
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tranche</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: T-23" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Niveau */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: N-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* État de la machine */}
            <FormField
              control={form.control}
              name="machineState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>État de la machine</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="running" />
                        </FormControl>
                        <FormLabel className="font-normal">En marche</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1">
                        <FormControl>
                          <RadioGroupItem value="stopped" />
                        </FormControl>
                        <FormLabel className="font-normal">À l'arrêt</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Method-specific fields */}
          {!currentMethodFields && (
            <div className="grid grid-cols-1 mt-6">
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">
                Veuillez sélectionner une méthode de décapage pour afficher les champs spécifiques
              </div>
            </div>
          )}
          
          {/* Transport fields */}
          {currentMethodFields === "transport" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Distance de décharge */}
              <FormField
                control={form.control}
                name="dischargeDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance de décharge (m)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 1500" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Nombre de camions */}
              <FormField
                control={form.control}
                name="truckCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de camions</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 5" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Nombre de pelles */}
              <FormField
                control={form.control}
                name="excavatorCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de pelles</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 2" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Heures de marche */}
              <FormField
                control={form.control}
                name="runningHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures de marche</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 7.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Durée d'arrêt */}
              <FormField
                control={form.control}
                name="stopHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée d'arrêt (h)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 1.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Volume sauté */}
              <FormField
                control={form.control}
                name="excavatedVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume sauté (m³)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 2500" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Observation */}
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="lg:col-span-3">
                    <FormLabel>Observation</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Remarques sur l'opération..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Poussage fields */}
          {currentMethodFields === "poussage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Nombre de bulldozers */}
              <FormField
                control={form.control}
                name="bulldozerCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de bulldozers D11</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 3" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* État des équipements */}
              <FormField
                control={form.control}
                name="equipmentState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>État des équipements</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'état" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="bon">Bon</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="mauvais">Mauvais</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Heures de marche */}
              <FormField
                control={form.control}
                name="runningHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures de marche</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 8.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Durée d'arrêt */}
              <FormField
                control={form.control}
                name="stopHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée d'arrêt (h)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 1.0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Volume sauté */}
              <FormField
                control={form.control}
                name="excavatedVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume sauté (m³)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 1800" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Métrage décapé */}
              <FormField
                control={form.control}
                name="excavatedMeterage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Métrage décapé (m)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="Ex: 120.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Observation */}
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="lg:col-span-3">
                    <FormLabel>Observation</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Remarques sur l'opération..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Casement fields */}
          {currentMethodFields === "casement" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Nombre d'engins */}
              <FormField
                control={form.control}
                name="machineCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'engins</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 4" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Type d'intervention */}
              <FormField
                control={form.control}
                name="interventionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'intervention</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="special">Spécial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Heures de marche */}
              <FormField
                control={form.control}
                name="runningHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures de marche</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 6.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Durée d'arrêt */}
              <FormField
                control={form.control}
                name="stopHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée d'arrêt (h)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5" 
                        placeholder="Ex: 2.0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Volume sauté */}
              <FormField
                control={form.control}
                name="excavatedVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume sauté (m³)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 2200" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Observation */}
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="lg:col-span-3">
                    <FormLabel>Observation</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Remarques sur l'opération..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
