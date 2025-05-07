import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectVerification, VerificationStage } from "@/types";
import { getVerificationStageColor, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function VerificationPipeline() {
  const { data: verifications, isLoading: isLoadingVerifications } = useQuery<ProjectVerification[]>({
    queryKey: ["/api/verifications", { status: "pending" }],
  });

  const { data: stages, isLoading: isLoadingStages } = useQuery<VerificationStage[]>({
    queryKey: ["/api/verification-stages"],
  });

  const isLoading = isLoadingVerifications || isLoadingStages;

  if (isLoading) {
    return <VerificationPipelineLoading />;
  }

  if (!verifications || verifications.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Verification Pipeline</h2>
          <Link href="/verification">
            <a className="text-sm font-medium text-primary hover:text-primary-dark">View all verifications</a>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <span className="material-icons text-3xl text-neutral-300 mb-2">verified</span>
            <p className="text-neutral-500">No pending verifications</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-900">Verification Pipeline</h2>
        <Link href="/verification">
          <a className="text-sm font-medium text-primary hover:text-primary-dark">View all verifications</a>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {verifications.map((verification) => {
            const stage = stages?.find(s => s.id === verification.currentStage);
            return (
              <li key={verification.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="material-icons text-green-600">eco</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{verification.projectId}</div>
                        <div className="text-sm text-neutral-500">ID: {verification.projectId}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getVerificationStageColor(stage?.name || '')}`}>
                          {stage?.name || 'Unknown Stage'}
                        </span>
                      </div>
                      <div>
                        <span className="material-icons text-neutral-400">chevron_right</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                      <span className="material-icons text-xs mr-1.5">calendar_today</span>
                      <p>Submitted on <time dateTime={verification.submittedDate}>
                        {formatDate(verification.submittedDate, 'MMMM d, yyyy')}
                      </time></p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                      <div className="flex items-center">
                        <span className="material-icons text-xs mr-1.5">schedule</span>
                        <p>Est. completion in {verification.estimatedCompletionDate ? 
                          `${Math.ceil((new Date(verification.estimatedCompletionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` : 
                          'calculating...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function VerificationPipelineLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
