import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Trash2, Edit, UserCheck, UserX, Clock } from "lucide-react";

// Define form schemas
const createUserSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["admin", "supervisor"])
});

const editUserSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["admin", "supervisor"]),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional()
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

type User = {
  id: number;
  username: string;
  name: string;
  role: "admin" | "supervisor";
  lastLogin: string | null;
};

type ConnectionLog = {
  id: number;
  userId: number;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  logoutTime: string | null;
  sessionDuration: number | null;
};

type Activity = {
  id: number;
  type: string;
  description: string;
  userId: number;
  timestamp: string;
  relatedEntityId: number | null;
  relatedEntityType: string | null;
  ipAddress: string | null;
  actionStatus: string | null;
};

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("utilisateurs");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Queries
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
    retry: false
  });

  const { data: connectionLogs = [], isLoading: isLoadingLogs } = useQuery<ConnectionLog[]>({
    queryKey: ["/api/connection-logs"],
    enabled: isAdmin && activeTab === "connexions",
    retry: false
  });

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: activeTab === "activites",
    retry: false
  });

  const { data: userActivities = [], isLoading: isLoadingUserActivities } = useQuery<Activity[]>({
    queryKey: ["/api/users", selectedUserId, "activities"],
    enabled: !!selectedUserId && activeTab === "activites",
    retry: false
  });

  const { data: userLogs = [], isLoading: isLoadingUserLogs } = useQuery<ConnectionLog[]>({
    queryKey: ["/api/users", selectedUserId, "connection-logs"],
    enabled: !!selectedUserId && activeTab === "connexions",
    retry: false
  });

  // Create user form
  const createUserForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "supervisor"
    }
  });

  // Edit user form
  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      name: "",
      role: "supervisor"
    }
  });

  // Set edit form values when selected user changes
  useEffect(() => {
    if (selectedUser) {
      editUserForm.reset({
        username: selectedUser.username,
        name: selectedUser.name,
        role: selectedUser.role,
      });
    }
  }, [selectedUser, editUserForm]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      return await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
        variant: "default"
      });
      setIsCreateDialogOpen(false);
      createUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'utilisateur",
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; userData: Partial<EditUserFormValues> }) => {
      return await fetch(`/api/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.userData),
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès",
        variant: "default"
      });
      setIsEditDialogOpen(false);
      editUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'utilisateur",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
        variant: "default"
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de l'utilisateur",
        variant: "destructive"
      });
    }
  });

  // Form submit handlers
  const onCreateUserSubmit = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };

  const onEditUserSubmit = (data: EditUserFormValues) => {
    if (!selectedUser) return;
    
    // Only include password in update if it's provided
    const userData: Partial<EditUserFormValues> = {
      username: data.username,
      name: data.name,
      role: data.role
    };
    
    if (data.password && data.password.trim() !== '') {
      userData.password = data.password;
    }
    
    updateUserMutation.mutate({
      id: selectedUser.id,
      userData
    });
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Cette page est réservée aux administrateurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>
                Gérez les utilisateurs, leurs accès et suivez leurs activités.
              </CardDescription>
            </div>
            {isAdmin && activeTab === "utilisateurs" && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvel Utilisateur</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                      Remplissez les champs ci-dessous pour créer un nouvel utilisateur.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createUserForm}>
                    <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                      <FormField
                        control={createUserForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input placeholder="utilisateur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createUserForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createUserForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createUserForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rôle</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Administrateur</SelectItem>
                                <SelectItem value="supervisor">Superviseur</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Administrateur: Accès complet. Superviseur: Lecture seule avec export.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">Annuler</Button>
                        </DialogClose>
                        <Button 
                          type="submit" 
                          disabled={createUserMutation.isPending}
                          className="gap-2"
                        >
                          {createUserMutation.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Créer l'utilisateur
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="utilisateurs" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              setSelectedUserId(null);
            }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
              <TabsTrigger value="connexions">Journaux de Connexion</TabsTrigger>
              <TabsTrigger value="activites">Activités</TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="utilisateurs">
              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Dernière Connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "outline"}>
                              {user.role === "admin" ? "Administrateur" : "Superviseur"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? (
                              new Date(user.lastLogin).toLocaleString('fr-FR')
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Jamais</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (open) setSelectedUser(user);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedUser(user)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:inline-block">Modifier</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Modifier l'utilisateur</DialogTitle>
                                    <DialogDescription>
                                      Modifiez les informations de {user.name}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form {...editUserForm}>
                                    <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4">
                                      <FormField
                                        control={editUserForm.control}
                                        name="username"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Nom d'utilisateur</FormLabel>
                                            <FormControl>
                                              <Input placeholder="utilisateur" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editUserForm.control}
                                        name="name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Nom complet</FormLabel>
                                            <FormControl>
                                              <Input placeholder="Jean Dupont" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editUserForm.control}
                                        name="password"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Nouveau mot de passe (optionnel)</FormLabel>
                                            <FormControl>
                                              <Input type="password" placeholder="Laisser vide pour ne pas changer" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                              Laissez vide pour conserver le mot de passe actuel.
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editUserForm.control}
                                        name="role"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Rôle</FormLabel>
                                            <Select 
                                              onValueChange={field.onChange} 
                                              value={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Sélectionner un rôle" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="admin">Administrateur</SelectItem>
                                                <SelectItem value="supervisor">Superviseur</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormDescription>
                                              Administrateur: Accès complet. Superviseur: Lecture seule avec export.
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <DialogFooter>
                                        <DialogClose asChild>
                                          <Button variant="outline" type="button">Annuler</Button>
                                        </DialogClose>
                                        <Button 
                                          type="submit" 
                                          disabled={updateUserMutation.isPending}
                                          className="gap-2"
                                        >
                                          {updateUserMutation.isPending && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          )}
                                          Enregistrer
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog open={isDeleteDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                setIsDeleteDialogOpen(open);
                                if (open) setSelectedUser(user);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => setSelectedUser(user)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:inline-block">Supprimer</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                                    <DialogDescription>
                                      Êtes-vous sûr de vouloir supprimer {user.name} ? Cette action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline" type="button">Annuler</Button>
                                    </DialogClose>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      disabled={deleteUserMutation.isPending}
                                      className="gap-2"
                                    >
                                      {deleteUserMutation.isPending && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      )}
                                      Supprimer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                                setSelectedUserId(user.id);
                                setActiveTab("activites");
                              }}>
                                <UserCheck className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:inline-block">Activités</span>
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                                setSelectedUserId(user.id);
                                setActiveTab("connexions");
                              }}>
                                <Clock className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:inline-block">Connexions</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Connection Logs Tab */}
            <TabsContent value="connexions">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {selectedUserId ? (
                    <>
                      Connexions de {users.find(u => u.id === selectedUserId)?.name}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2" 
                        onClick={() => setSelectedUserId(null)}
                      >
                        Voir toutes les connexions
                      </Button>
                    </>
                  ) : (
                    "Toutes les connexions"
                  )}
                </h3>
              </div>
              
              {(isLoadingLogs || isLoadingUserLogs) ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Adresse IP</TableHead>
                      <TableHead>Déconnexion</TableHead>
                      <TableHead>Durée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUserId 
                      ? (userLogs.length > 0 ? userLogs.map((log) => (
                        <LogRow key={log.id} log={log} users={users} />
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Aucune connexion trouvée pour cet utilisateur
                          </TableCell>
                        </TableRow>
                      ))
                      : (connectionLogs.length > 0 ? connectionLogs.map((log) => (
                        <LogRow key={log.id} log={log} users={users} />
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Aucune connexion trouvée
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Activities Tab */}
            <TabsContent value="activites">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {selectedUserId ? (
                    <>
                      Activités de {users.find(u => u.id === selectedUserId)?.name}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2" 
                        onClick={() => setSelectedUserId(null)}
                      >
                        Voir toutes les activités
                      </Button>
                    </>
                  ) : (
                    "Toutes les activités"
                  )}
                </h3>
              </div>
              
              {(isLoadingActivities || isLoadingUserActivities) ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUserId 
                      ? (userActivities && userActivities.length > 0 ? userActivities.map((activity: Activity) => (
                        <ActivityRow key={activity.id} activity={activity} users={users} />
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucune activité trouvée pour cet utilisateur
                          </TableCell>
                        </TableRow>
                      ))
                      : (activities && activities.length > 0 ? activities.map((activity: Activity) => (
                        <ActivityRow key={activity.id} activity={activity} users={users} />
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucune activité trouvée
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for log rows
function LogRow({ log, users }: { log: ConnectionLog, users: User[] }) {
  const user = users?.find((u: User) => u.id === log.userId);
  
  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours > 0 ? `${hours}h` : "",
      minutes > 0 ? `${minutes}m` : "",
      `${remainingSeconds}s`
    ].filter(Boolean).join(" ");
  };
  
  return (
    <TableRow>
      <TableCell>{user?.name || `Utilisateur #${log.userId}`}</TableCell>
      <TableCell>{new Date(log.timestamp).toLocaleString('fr-FR')}</TableCell>
      <TableCell>
        <Badge 
          variant={
            log.status === 'success' ? 'default' : 
            log.status === 'failed' ? 'destructive' : 
            'outline'
          }
        >
          {log.status === 'success' ? 'Succès' : 
           log.status === 'failed' ? 'Échec' : 
           log.status}
        </Badge>
      </TableCell>
      <TableCell>{log.ipAddress || "N/A"}</TableCell>
      <TableCell>
        {log.logoutTime 
          ? new Date(log.logoutTime).toLocaleString('fr-FR')
          : <Badge variant="outline">Session active</Badge>
        }
      </TableCell>
      <TableCell>{formatDuration(log.sessionDuration)}</TableCell>
    </TableRow>
  );
}

// Helper component for activity rows
function ActivityRow({ activity, users }: { activity: Activity, users: User[] }) {
  const user = users?.find((u: User) => u.id === activity.userId);
  
  // Function to get activity type badge
  const getActivityTypeBadge = (type: string) => {
    const types: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "destructive" }> = {
      "user_created": { label: "Création utilisateur", variant: "default" },
      "user_updated": { label: "Mise à jour utilisateur", variant: "secondary" },
      "user_deleted": { label: "Suppression utilisateur", variant: "destructive" },
      "login": { label: "Connexion", variant: "outline" },
      "logout": { label: "Déconnexion", variant: "outline" },
      "operation_created": { label: "Création opération", variant: "default" },
      "operation_updated": { label: "Mise à jour opération", variant: "secondary" },
      "machine_created": { label: "Création machine", variant: "default" },
      "machine_updated": { label: "Mise à jour machine", variant: "secondary" },
      "safety_incident_reported": { label: "Incident signalé", variant: "destructive" },
    };
    
    const activityType = types[type] || { label: type, variant: "outline" };
    
    return (
      <Badge variant={activityType.variant}>
        {activityType.label}
      </Badge>
    );
  };
  
  return (
    <TableRow>
      <TableCell>{user?.name || `Utilisateur #${activity.userId}`}</TableCell>
      <TableCell>{new Date(activity.timestamp).toLocaleString('fr-FR')}</TableCell>
      <TableCell>{getActivityTypeBadge(activity.type)}</TableCell>
      <TableCell>{activity.description}</TableCell>
      <TableCell>
        <Badge 
          variant={
            activity.actionStatus === 'success' ? 'default' : 
            activity.actionStatus === 'failure' ? 'destructive' : 
            'outline'
          }
        >
          {activity.actionStatus === 'success' ? 'Succès' : 
           activity.actionStatus === 'failure' ? 'Échec' : 
           activity.actionStatus || 'N/A'}
        </Badge>
      </TableCell>
    </TableRow>
  );
}