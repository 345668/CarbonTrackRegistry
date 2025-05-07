import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProjectForm from "@/components/projects/ProjectForm";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewProject() {
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <Link href="/projects">
          <Button variant="ghost" className="group flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Button>
        </Link>
        
        <div className="mt-4 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Register New Carbon Project
            </span>
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Register your carbon offset project to begin the certification process. Complete all required information to ensure a smooth verification journey.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="md:col-span-1 p-4 bg-gradient-to-b from-slate-50 to-white border-primary/10 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Registration Steps</h3>
              <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                <div className="relative">
                  <div className="absolute -left-[1.31rem] w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">1</div>
                  <h4 className="text-sm font-medium pl-2">Project Details</h4>
                  <p className="text-xs text-muted-foreground pl-2">Basic information and location</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[1.31rem] w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">2</div>
                  <h4 className="text-sm font-medium text-muted-foreground pl-2">Verification</h4>
                  <p className="text-xs text-muted-foreground pl-2">Project review and approval</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[1.31rem] w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">3</div>
                  <h4 className="text-sm font-medium text-muted-foreground pl-2">Credit Issuance</h4>
                  <p className="text-xs text-muted-foreground pl-2">Carbon credits generation</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Be specific with your location details</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Select the most relevant methodology</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Provide accurate reduction estimates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Include a representative project image</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
        
        <div className="md:col-span-3">
          <ProjectForm />
        </div>
      </div>
    </div>
  );
}
