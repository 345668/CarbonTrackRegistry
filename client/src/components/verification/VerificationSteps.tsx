import { useQuery } from "@tanstack/react-query";
import { VerificationStage, ProjectVerification } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVerificationStageColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface VerificationStepsProps {
  verification: ProjectVerification;
  onUpdate?: (stageId: number) => void;
  readOnly?: boolean;
}

export default function VerificationSteps({ 
  verification, 
  onUpdate,
  readOnly = false
}: VerificationStepsProps) {
  const { data: stages, isLoading } = useQuery<VerificationStage[]>({
    queryKey: ["/api/verification-stages"],
  });

  if (isLoading) {
    return <VerificationStepsLoading />;
  }

  if (!stages || stages.length === 0) {
    return <div>No verification stages defined</div>;
  }

  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const currentStageIndex = sortedStages.findIndex(s => s.id === verification.currentStage);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Verification Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />
          
          {sortedStages.map((stage, index) => {
            const isComplete = index < currentStageIndex;
            const isCurrent = stage.id === verification.currentStage;
            const isPending = index > currentStageIndex;
            
            return (
              <div key={stage.id} className="relative mb-6 last:mb-0 pl-10">
                <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center border-2 
                  ${isComplete 
                    ? 'bg-green-100 border-green-500 text-green-500' 
                    : isCurrent 
                      ? 'bg-blue-100 border-blue-500 text-blue-500' 
                      : 'bg-white border-gray-300 text-gray-300'}`}
                >
                  {isComplete ? (
                    <span className="material-icons text-sm">check</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <div>
                  <h4 className={`text-md font-medium mb-1 
                    ${isComplete 
                      ? 'text-green-700' 
                      : isCurrent 
                        ? 'text-blue-700' 
                        : 'text-neutral-500'}`}>
                    {stage.name}
                  </h4>
                  
                  {stage.description && (
                    <p className="text-sm text-neutral-500 mb-2">{stage.description}</p>
                  )}
                  
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${isComplete 
                        ? 'bg-green-100 text-green-800' 
                        : isCurrent 
                          ? getVerificationStageColor(stage.name) 
                          : 'bg-gray-100 text-gray-600'}`}>
                      {isComplete 
                        ? 'Completed' 
                        : isCurrent 
                          ? 'In Progress' 
                          : 'Pending'}
                    </span>
                    
                    {isCurrent && !readOnly && onUpdate && index < sortedStages.length - 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-3"
                        onClick={() => onUpdate(sortedStages[index + 1].id)}
                      >
                        Advance to Next Stage
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationStepsLoading() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative mb-6 last:mb-0 pl-10">
              <Skeleton className="absolute left-0 top-1 h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
