import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface UsersListProps {
  users: User[];
}

export default function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <span className="material-icons text-5xl text-neutral-300 mb-2">person_off</span>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Users Found</h3>
        <p className="text-neutral-500 mb-4">There are no users matching your criteria</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'verifier':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'project_developer':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return "Administrator";
      case 'project_developer':
        return "Project Developer";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarFallback className="bg-primary-light text-primary">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <div className="text-sm font-medium text-neutral-900">{user.fullName}</div>
                  <div className="text-sm text-neutral-500 flex items-center">
                    <span>{user.email}</span>
                    {user.organization && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{user.organization}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleDisplay(user.role)}
                </Badge>
                <Button variant="ghost" size="sm">
                  <span className="material-icons text-sm">more_vert</span>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}