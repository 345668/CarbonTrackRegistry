import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProjectForm from "@/components/projects/ProjectForm";

export default function NewProject() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/projects">
            <div className="text-primary hover:text-primary-dark mr-2 cursor-pointer">
              <span className="material-icons text-sm align-text-top">arrow_back</span>
              <span className="ml-1">Back to Projects</span>
            </div>
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mt-4">Register New Carbon Project</h1>
        <p className="mt-1 text-sm text-neutral-700">
          Enter the details of your carbon offset project to register in the system
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
