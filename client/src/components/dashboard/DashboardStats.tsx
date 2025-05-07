import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard, Statistics } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  if (isLoading) {
    return <DashboardStatsLoading />;
  }

  if (!stats) {
    return null;
  }

  const statCards: StatCard[] = [
    {
      title: "Total Projects",
      value: formatNumber(stats.totalProjects),
      percentChange: 12,
      icon: "eco",
      color: "bg-primary-light text-primary",
    },
    {
      title: "Carbon Credits (tCO₂e)",
      value: formatNumber(stats.totalCredits),
      percentChange: 8.2,
      icon: "account_balance_wallet",
      color: "bg-secondary-light text-secondary",
    },
    {
      title: "Verified Projects",
      value: formatNumber(stats.verifiedProjects),
      percentChange: 4,
      icon: "verified",
      color: "bg-accent-light text-accent-dark",
    },
    {
      title: "Pending Verification",
      value: formatNumber(stats.pendingVerification),
      percentChange: -3,
      icon: "pending_actions",
      color: "bg-neutral-100 text-neutral-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((card, index) => (
        <StatCardComponent key={index} {...card} />
      ))}
    </div>
  );
}

function StatCardComponent({ title, value, percentChange, icon, color }: StatCard) {
  const isPositive = percentChange ? percentChange > 0 : false;
  
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <span className="material-icons">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">{value}</div>
                {percentChange && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
                    <span className="material-icons text-sm">{isPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                    <span className="sr-only">{isPositive ? 'Increased by' : 'Decreased by'}</span>
                    {Math.abs(percentChange)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardStatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="ml-5 w-0 flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
