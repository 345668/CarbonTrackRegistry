import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard, Statistics } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

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
      color: "bg-primary/10 text-primary", 
      borderColor: "border-primary/20",
    },
    {
      title: "Carbon Credits (tCO₂e)",
      value: formatNumber(stats.totalCredits),
      percentChange: 8.2,
      icon: "account_balance_wallet",
      color: "bg-blue-500/10 text-blue-600",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Verified Projects",
      value: formatNumber(stats.verifiedProjects),
      percentChange: 4,
      icon: "verified",
      color: "bg-green-500/10 text-green-600",
      borderColor: "border-green-500/20",
    },
    {
      title: "Paris Agreement Compliance",
      value: "Article 6",
      percentChange: 23,
      icon: "account_balance",
      color: "bg-purple-500/10 text-purple-600",
      borderColor: "border-purple-500/20",
      href: "/blockchain?tab=paris-compliance",
    },
    {
      title: "Advanced Analytics",
      value: "SDG Impact",
      percentChange: 15,
      icon: "insights",
      color: "bg-cyan-500/10 text-cyan-600",
      borderColor: "border-cyan-500/20",
      href: "/analytics?tab=sdg",
    },
    {
      title: "Pending Verification",
      value: formatNumber(stats.pendingVerification),
      percentChange: -3,
      icon: "pending_actions",
      color: "bg-amber-500/10 text-amber-600",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {statCards.map((card, index) => (
        <StatCardComponent key={index} {...card} />
      ))}
    </div>
  );
}

function StatCardComponent({ title, value, percentChange, icon, color, borderColor, href }: StatCard) {
  const isPositive = percentChange ? percentChange > 0 : false;
  
  const cardContent = (
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
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
  );
  
  const cardClasses = `shadow-sm ${borderColor} border ${href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`;
  
  if (href) {
    return (
      <a href={href}>
        <Card className={cardClasses}>
          {cardContent}
        </Card>
      </a>
    );
  }
  
  return (
    <Card className={cardClasses}>
      {cardContent}
    </Card>
  );
}

function DashboardStatsLoading() {
  const colors = [
    "border-primary/20", 
    "border-blue-500/20", 
    "border-green-500/20", 
    "border-purple-500/20",
    "border-cyan-500/20",
    "border-amber-500/20"
  ];
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className={`shadow-sm ${colors[i-1]} border`}>
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
