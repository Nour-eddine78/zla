import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "./theme-toggle";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/operations", label: "Suivi des Opérations" },
  { href: "/performance", label: "Tableau de Bord" },
  { href: "/advancement", label: "Avancement" },
  { href: "/performance", label: "Performances" },
  { href: "/safety", label: "Sécurité" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <nav className="bg-white dark:bg-secondary shadow-md z-10 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold">OCP</div>
              <span className="ml-2 text-lg font-semibold">OCP - GestDécap</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                >
                  <a className={`border-b-2 ${
                    location === link.href 
                      ? "border-primary" 
                      : "border-transparent hover:border-primary"
                    } px-3 py-2 text-sm font-medium`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <ThemeToggle />
              <button className="p-2 ml-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-3 relative" asChild>
                    <div className="flex items-center space-x-3 cursor-pointer">
                      <div className="text-sm font-medium text-right">
                        <div>{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role === 'admin' ? 'Administrateur' : 'Superviseur'}
                        </div>
                      </div>
                      <Avatar className="h-8 w-8 bg-primary text-white">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
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
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
              >
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === link.href 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-secondary-light"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
