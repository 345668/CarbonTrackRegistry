import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProjectCategory, Methodology } from "@/types";
import { generateProjectId } from "@/lib/utils";
import { CalendarIcon, Globe, TreePine, FlaskConical, Leaf, Calendar, Info } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  methodology: z.string().min(1, "Please select a methodology"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  estimatedReduction: z.coerce.number().min(1, "Estimated reduction must be at least 1"),
  imageUrl: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectForm() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState("USA");
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: methodologies, isLoading: isLoadingMethodologies } = useQuery<Methodology[]>({
    queryKey: ["/api/methodologies"],
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      methodology: "",
      location: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0],
      estimatedReduction: 0,
      imageUrl: "",
    },
  });

  const [_, navigate] = useLocation();

  const createProject = useMutation({
    mutationFn: async (data: ProjectFormValues & { projectId: string }) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      navigate("/projects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    const year = new Date().getFullYear().toString();
    const projectId = generateProjectId(countryCode, year);
    
    createProject.mutate({
      ...data,
      projectId,
      developer: "admin", // Assuming admin user
      status: "draft",
    });
  };

  const isLoading = isLoadingCategories || isLoadingMethodologies || createProject.isPending;

  return (
    <Card className="max-w-3xl mx-auto shadow-md border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center">
          <TreePine className="h-5 w-5 mr-2 text-primary" />
          Project Details
        </CardTitle>
        <CardDescription>
          Enter all required information to register your carbon project
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic information section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-0.5">
                  1
                </Badge>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Project Name</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Reforestation Initiative" 
                          {...field} 
                          className="border-input/60 focus-visible:ring-primary/30" 
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a descriptive name for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Location</span>
                        <Globe className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <div className="flex space-x-2">
                        <Select 
                          onValueChange={(value) => setCountryCode(value)} 
                          defaultValue="USA"
                        >
                          <SelectTrigger className="w-28 border-input/60 focus-visible:ring-primary/30">
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="KEN">Kenya</SelectItem>
                            <SelectItem value="BRA">Brazil</SelectItem>
                            <SelectItem value="IND">India</SelectItem>
                            <SelectItem value="MEX">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input 
                            placeholder="Specific location" 
                            {...field} 
                            className="border-input/60 focus-visible:ring-primary/30" 
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Specify where your project will be implemented
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <span>Description</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the project's goals, activities, expected results, and overall impact on carbon emissions reduction." 
                        rows={4}
                        {...field} 
                        className="border-input/60 focus-visible:ring-primary/30 resize-none" 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comprehensive description of your project's goals and climate impact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Methodology section */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-0.5">
                  2
                </Badge>
                <h3 className="text-lg font-semibold">Methodology</h3>
              </div>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Project Category</span>
                        <TreePine className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger className="border-input/60 focus-visible:ring-primary/30">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the category that best fits your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="methodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Methodology</span>
                        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingMethodologies || !form.watch("category")}
                      >
                        <FormControl>
                          <SelectTrigger className="border-input/60 focus-visible:ring-primary/30">
                            <SelectValue placeholder="Select a methodology" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {methodologies
                            ?.filter(m => form.watch("category") ? m.category === form.watch("category") : true)
                            .map((methodology) => (
                              <SelectItem key={methodology.id} value={methodology.name}>
                                {methodology.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the appropriate methodology for measuring carbon reductions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Timeline and metrics section */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-0.5">
                  3
                </Badge>
                <h3 className="text-lg font-semibold">Timeline & Metrics</h3>
              </div>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Start Date</span>
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-input/60 focus-visible:ring-primary/30" 
                        />
                      </FormControl>
                      <FormDescription>
                        When will this project begin
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>End Date</span>
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-input/60 focus-visible:ring-primary/30" 
                        />
                      </FormControl>
                      <FormDescription>
                        Expected project completion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedReduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <span>Estimated Reduction</span>
                        <Leaf className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            className="border-input/60 focus-visible:ring-primary/30 pr-12" 
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-sm">
                            tCO₂e
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Projected carbon reduction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <span>Image URL (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="border-input/60 focus-visible:ring-primary/30" 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a URL for a representative image of your project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => navigate("/projects")} className="border-input/60">
          Cancel
        </Button>
        <Button 
          form="project-form" 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Register Project</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
