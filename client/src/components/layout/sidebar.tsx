import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChevronLeft, 
  Home, 
  ClipboardList, 
  BarChart2, 
  Map, 
  Activity, 
  AlertTriangle 
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const sidebarItems = [
    {
      title: "Accueil",
      href: "/",
      icon: Home,
    },
    {
      title: "Suivi des Opérations",
      href: "/operations",
      icon: ClipboardList,
    },
    {
      title: "Tableau de Bord",
      href: "/performance",
      icon: BarChart2,
    },
    {
      title: "Avancement",
      href: "/advancement",
      icon: Map,
    },
    {
      title: "Performances",
      href: "/performance",
      icon: Activity,
    },
    {
      title: "Sécurité",
      href: "/safety",
      icon: AlertTriangle,
    },
  ];
  
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
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {!collapsed && <span>{item.title}</span>}
              </a>
            </Link>
          ))}
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
