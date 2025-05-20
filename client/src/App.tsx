import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Operations from "@/pages/operations";
import OperationsForm from "@/pages/operations-form";
import Performance from "@/pages/performance";
import Safety from "@/pages/safety";
import Advancement from "@/pages/advancement";
import UserManagement from "@/pages/user-management";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import ThemeToggle from "@/components/layout/theme-toggle";
import { Bell, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="min-h-screen flex">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-secondary shadow-sm z-10 flex items-center justify-between px-4 lg:px-6">
          <div></div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-3" asChild>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <div className="text-sm font-medium text-right hidden md:block">
                      <div>{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.role === 'admin' ? 'Administrateur' : 'Superviseur'}
                      </div>
                    </div>
                    <Avatar className="h-8 w-8 bg-primary text-white">
                      <AvatarFallback>{user.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-8 bg-gray-100 dark:bg-gray-900 overflow-auto">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

function Router() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/operations">
        <ProtectedRoute component={Operations} />
      </Route>
      <Route path="/operations/new">
        <ProtectedRoute component={OperationsForm} />
      </Route>
      <Route path="/performance">
        <ProtectedRoute component={Performance} />
      </Route>
      <Route path="/safety">
        <ProtectedRoute component={Safety} />
      </Route>
      <Route path="/advancement">
        <ProtectedRoute component={Advancement} />
      </Route>
      {isAdmin && (
        <Route path="/user-management">
          <ProtectedRoute component={UserManagement} />
        </Route>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
