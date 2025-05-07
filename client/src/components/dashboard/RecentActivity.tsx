import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from "@/types";
import { formatTimeAgo, getActivityIcon } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity", { limit: 5 }],
  });

  if (isLoading) {
    return <RecentActivityLoading />;
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-40">
            <p className="text-neutral-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3 divide-y divide-gray-200">
        {activities.map((activity) => {
          const { icon, color } = getActivityIcon(activity.action);
          return (
            <div key={activity.id} className="py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center`}>
                    <span className="material-icons text-sm">{icon}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {formatActivityTitle(activity.action)}
                  </p>
                  <div className="mt-1 flex items-center">
                    <p className="text-sm text-neutral-500">{activity.description}</p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-3">
          <a href="/activity" className="text-sm font-medium text-primary hover:text-primary-dark">View all activity</a>
        </div>
      </CardContent>
    </Card>
  );
}

function formatActivityTitle(action: string): string {
  switch (action) {
    case 'project_created':
    case 'project_registered':
      return 'New project registered';
    case 'project_verified':
      return 'Project verified';
    case 'credit_issued':
      return 'Carbon credits issued';
    case 'verification_requested':
      return 'Verification requested';
    case 'project_updated':
      return 'Project updated';
    case 'credit_retired':
      return 'Carbon credits retired';
    default:
      return action.replace('_', ' ');
  }
}

function RecentActivityLoading() {
  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="py-3">
            <div className="flex items-start">
              <Skeleton className="h-8 w-8 rounded-full mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
