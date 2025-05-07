import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Check, Leaf, ShieldCheck, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Create the login schema
const loginSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// Create the registration schema
const registerSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      organization: "",
    },
  });

  // Handle login form submission
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  // Handle register form submission
  function onRegisterSubmit(values: RegisterFormValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Auth Forms */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-white">
        <Card className="w-full max-w-md border-0 shadow-none card-elevated">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center mb-2 gradient-text">Carbon Registry Platform</CardTitle>
            <CardDescription className="text-center mb-4">
              Login or create an account to manage carbon projects
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="tabs-auth">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-base font-medium">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-base font-medium">Register</TabsTrigger>
            </TabsList>

            <CardContent className="px-0">
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="input-focus-ring" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="input-focus-ring" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full mt-6 text-base font-medium btn-primary-gradient"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 font-medium text-primary" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                className="input-focus-ring" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                className="input-focus-ring" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="input-focus-ring" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                className="input-focus-ring" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                className="input-focus-ring" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Organization (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your organization" 
                              className="input-focus-ring" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full mt-6 text-base font-medium btn-primary-gradient"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>
                    Already have an account?{" "}
                    <Button variant="link" className="p-0 font-medium text-primary" onClick={() => setActiveTab("login")}>
                      Login
                    </Button>
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden md:flex md:flex-1 bg-primary p-8 text-white flex-col justify-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            UNDP Carbon Registry Platform
          </h1>
          <p className="text-xl mb-8">
            A comprehensive solution for registering, verifying, and tracking carbon offset projects
            and credits. Help combat climate change by supporting sustainable initiatives and
            monitoring their impact.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-white text-primary p-1.5 rounded-full mt-0.5 flex items-center justify-center">
                <Leaf className="h-4 w-4" />
              </div>
              <p className="text-base">Register and monitor carbon offset projects</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white text-primary p-1.5 rounded-full mt-0.5 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-base">Track verification stages and project statuses</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white text-primary p-1.5 rounded-full mt-0.5 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <p className="text-base">Manage and transfer carbon credits</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white text-primary p-1.5 rounded-full mt-0.5 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-base">Support sustainable development goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}