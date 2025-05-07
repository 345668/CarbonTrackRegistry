import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Methodology } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface MethodologyCardProps {
  methodology: Methodology;
}

export default function MethodologyCard({ methodology }: MethodologyCardProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex-grow">
        <div className="p-4 border-b">
          <Badge className={`${getCategoryColor(methodology.category)} mb-2`}>
            {methodology.category}
          </Badge>
          <h3 className="font-medium text-neutral-900">{methodology.name}</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-neutral-700 line-clamp-3">
            {methodology.description || "No description available"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{methodology.name}</DialogTitle>
              <DialogDescription>
                <Badge className={getCategoryColor(methodology.category)}>
                  {methodology.category}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">Description</h3>
                  <p className="mt-1 text-sm text-neutral-900">
                    {methodology.description || "No description available"}
                  </p>
                </div>
                
                {methodology.documentUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Documentation</h3>
                    <a 
                      href={methodology.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-primary hover:text-primary-dark flex items-center"
                    >
                      <span className="material-icons text-sm mr-1">description</span>
                      View Methodology Document
                    </a>
                  </div>
                )}
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Applicable Project Types</h3>
                  <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                    {methodology.category === "Forestry" && (
                      <>
                        <li>Reforestation projects</li>
                        <li>Forest conservation</li>
                        <li>Avoided deforestation</li>
                      </>
                    )}
                    {methodology.category === "Renewable Energy" && (
                      <>
                        <li>Solar power plants</li>
                        <li>Wind energy farms</li>
                        <li>Hydroelectric projects</li>
                      </>
                    )}
                    {methodology.category === "Agriculture" && (
                      <>
                        <li>Sustainable farming practices</li>
                        <li>Soil carbon sequestration</li>
                        <li>Livestock management</li>
                      </>
                    )}
                    {methodology.category === "Waste Management" && (
                      <>
                        <li>Landfill methane capture</li>
                        <li>Waste to energy</li>
                        <li>Composting projects</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
