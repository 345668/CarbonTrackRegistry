import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProjectCategory, Methodology } from "@/types";
import { generateProjectId } from "@/lib/utils";

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
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Carbon Project</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Reforestation Initiative" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <div className="flex space-x-2">
                      <Select 
                        onValueChange={(value) => setCountryCode(value)} 
                        defaultValue="USA"
                      >
                        <SelectTrigger className="w-28">
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
                        <Input placeholder="Specific location" {...field} />
                      </FormControl>
                    </div>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project's goals and impact" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodology</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingMethodologies || !form.watch("category")}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedReduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Reduction (tCO₂e)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
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
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a URL for an image that represents your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/projects")}>
          Cancel
        </Button>
        <Button form="project-form" type="submit" disabled={isLoading}>
          {isLoading && (
            <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
          )}
          Register Project
        </Button>
      </CardFooter>
    </Card>
  );
}
