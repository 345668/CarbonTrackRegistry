import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/types";

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", icon: "dashboard", href: "/" },
  { title: "Projects", icon: "eco", href: "/projects" },
  { title: "Carbon Credits", icon: "account_balance_wallet", href: "/carbon-credits" },
  { title: "Verification", icon: "assignment_turned_in", href: "/verification" },
  { title: "Map View", icon: "map", href: "/map" },
  { title: "Methodologies", icon: "book", href: "/methodologies" },
  { title: "Users", icon: "people", href: "/users" },
  { title: "Settings", icon: "settings", href: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-icons text-white text-sm">eco</span>
          </div>
          <span className="text-xl font-semibold text-neutral-900">Carbon Registry</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = 
              location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
              >
                <a 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive 
                      ? "bg-primary bg-opacity-10 text-primary border-l-3 border-primary" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <span className={cn(
                    "material-icons mr-3",
                    isActive ? "text-primary" : "text-neutral-700"
                  )}>
                    {item.icon}
                  </span>
                  {item.title}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center">
              <span className="material-icons text-primary">person</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900">Admin User</p>
              <p className="text-xs text-neutral-500">Program Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
