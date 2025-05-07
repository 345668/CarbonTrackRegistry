import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 hover:text-primary hover:bg-neutral-50 focus:outline-none"
          >
            <span className="material-icons">menu</span>
          </Button>
        </div>

        <div className="flex items-center ml-auto">
          <div className="relative mr-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative p-1 text-neutral-700 rounded-full hover:bg-neutral-50 focus:outline-none"
                >
                  <span className="material-icons">notifications</span>
                  {/* Notification indicator */}
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-2 font-medium border-b">Notifications</div>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="text-sm font-medium">New project registered</p>
                    <p className="text-xs text-neutral-500 mt-1">Amazon Rainforest Conservation Project</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="text-sm font-medium">Verification request submitted</p>
                    <p className="text-xs text-neutral-500 mt-1">Solar Energy Initiative - Phase 2</p>
                  </div>
                </DropdownMenuItem>
                <div className="p-2 text-center border-t">
                  <Button variant="ghost" size="sm">View all notifications</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden relative">
            <Button variant="ghost" size="icon" className="flex text-sm rounded-full focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center">
                <span className="material-icons text-primary text-sm">person</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
