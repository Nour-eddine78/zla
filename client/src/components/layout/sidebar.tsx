import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChevronLeft, 
  ChevronDown,
  Home, 
  ClipboardList, 
  BarChart2, 
  Map, 
  Activity, 
  AlertTriangle,
  FileText, 
  Users,
  Settings
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Créer les éléments de la barre latérale en fonction du rôle de l'utilisateur
  const createSidebarItems = () => {
    const items = [
      {
        title: "Accueil",
        href: "/",
        icon: Home,
      },
      {
        title: "Suivi des Opérations",
        href: "/operations",
        icon: ClipboardList,
        subItems: [
          { title: "Liste des Opérations", href: "/operations" },
          { title: "Nouvelle Opération", href: "/operations/new" },
          { title: "Historique", href: "/operations/history" }
        ]
      },
      {
        title: "Tableau de Bord",
        href: "/dashboard",
        icon: BarChart2,
        subItems: [
          { title: "Vue Générale", href: "/dashboard" },
          { title: "Statistiques", href: "/dashboard/stats" },
          { title: "Rapports", href: "/dashboard/reports" }
        ]
      },
      {
        title: "Avancement",
        href: "/advancement",
        icon: Map,
        subItems: [
          { title: "Par Panneau", href: "/advancement/panel" },
          { title: "Par Niveau", href: "/advancement/level" },
          { title: "Planification", href: "/advancement/planning" }
        ]
      },
      {
        title: "Performances",
        href: "/performance",
        icon: Activity,
        subItems: [
          { title: "Machines", href: "/performance/machines" },
          { title: "Opérateurs", href: "/performance/operators" },
          { title: "Méthodes", href: "/performance/methods" }
        ]
      },
      {
        title: "Sécurité",
        href: "/safety",
        icon: AlertTriangle,
        subItems: [
          { title: "Incidents", href: "/safety" },
          { title: "Rapports HSE", href: "/safety/reports" },
          { title: "Procédures", href: "/safety/procedures" }
        ]
      },
      {
        title: "Documentation",
        href: "/documentation",
        icon: FileText,
        subItems: [
          { title: "Machines", href: "/documentation/machines" },
          { title: "Méthodes", href: "/documentation/methods" },
          { title: "Fiches Techniques", href: "/documentation/technical" }
        ]
      },
    ];
    
    // Ajouter les éléments réservés aux administrateurs
    if (user?.role === 'admin') {
      items.push({
        title: "Gestion Utilisateurs",
        href: "/user-management",
        icon: Users,
        subItems: [
          { title: "Utilisateurs", href: "/user-management" },
          { title: "Connexions", href: "/user-management?tab=connexions" },
          { title: "Activités", href: "/user-management?tab=activites" }
        ]
      });
      
      items.push({
        title: "Paramètres",
        href: "/settings",
        icon: Settings,
      });
    }
    
    return items;
  };
  
  const sidebarItems = createSidebarItems();
  
  return (
    <div 
      className={cn(
        "bg-sidebar border-r border-sidebar-border h-full transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold">
              OCP
            </div>
            <span className="ml-2 text-lg font-semibold text-sidebar-foreground">GestDécap</span>
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = location === item.href || 
              (item.subItems && item.subItems.some(sub => location === sub.href));
            const isExpanded = expandedItems[item.href] || false;
            
            return (
              <div key={item.href} className="mb-1">
                <div
                  className={cn(
                    "group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => {
                    if (item.subItems) {
                      setExpandedItems(prev => ({
                        ...prev,
                        [item.href]: !prev[item.href]
                      }));
                    } else {
                      setLocation(item.href);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {!collapsed && <span>{item.title}</span>}
                  </div>
                  {!collapsed && item.subItems && (
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform", 
                        isExpanded ? "transform rotate-180" : ""
                      )} 
                    />
                  )}
                </div>
                
                {!collapsed && item.subItems && isExpanded && (
                  <div className="pl-9 mt-1 space-y-1">
                    {item.subItems.map(subItem => (
                      <Link key={subItem.href} href={subItem.href}>
                        <div
                          className={cn(
                            "block py-1.5 px-2 text-sm rounded-md cursor-pointer",
                            location === subItem.href
                              ? "bg-sidebar-accent/50 text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                          )}
                        >
                          {subItem.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      {!collapsed && user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground opacity-70">
                {user.role === 'admin' ? 'Administrateur' : 'Superviseur'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
