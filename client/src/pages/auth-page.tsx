import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Radical Zero logo from assets
import RadicalZeroLogo from "@assets/Radical-Zero (1).png";

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
    // Extract confirmPassword and ensure organization is a string or undefined (not null)
    const { confirmPassword, organization, ...userData } = values;
    registerMutation.mutate({
      ...userData,
      role: "user", // Set default role
      organization: organization || undefined // Convert null to undefined
    });
  }

  return (
    <div className="flex min-h-screen bg-[#00082d] text-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Carbon tag icons */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-10" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div className="absolute top-3/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-10" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div className="absolute top-1/3 right-1/6 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-10" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 left-1/6 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white opacity-10" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div className="absolute top-2/3 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-10" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full z-10">
        {/* Left Column - Auth Forms */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm text-white border-none">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <CardTitle className="text-2xl text-center mb-2">Carbon Registry Platform</CardTitle>
                <CardDescription className="text-center mb-4 text-gray-300">Login or create an account to manage carbon projects</CardDescription>
                <TabsList className="grid w-full grid-cols-2 bg-[#1a2053]">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#5b67f8]">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-[#5b67f8]">Register</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-[#5b67f8] hover:bg-[#4954d3] text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} className="bg-white/20 border-0 text-white placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      {/* Role is handled in onRegisterSubmit */}
                      <FormField
                        control={registerForm.control}
                        name="organization"
                        render={({ field: { value, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Organization (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your organization" 
                                value={value || ''} 
                                {...fieldProps} 
                                className="bg-white/20 border-0 text-white placeholder:text-gray-400"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-[#5b67f8] hover:bg-[#4954d3] text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </CardContent>

              <CardFooter className="flex justify-center text-sm text-gray-300">
                {activeTab === "login" ? (
                  <p>
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 text-[#5b67f8]" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <Button variant="link" className="p-0 text-[#5b67f8]" onClick={() => setActiveTab("login")}>
                      Login
                    </Button>
                  </p>
                )}
              </CardFooter>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Hero Section */}
        <div className="flex flex-1 p-8 text-white flex-col justify-center relative overflow-hidden">
          {/* Center logo and content */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="mb-8 bg-white p-4 rounded-lg shadow-[0_0_40px_rgba(79,70,229,0.6)]">
              <img src={RadicalZeroLogo} alt="Radical Zero Logo" className="h-24" />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-center">
              Radical Zero Carbon Registry Platform
            </h1>
            
            <p className="text-xl mb-8 text-center">
              A comprehensive solution for registering, verifying, and tracking carbon offset projects
              and credits. Help combat climate change by supporting sustainable initiatives and
              monitoring their impact.
            </p>
            
            <div className="space-y-4 w-full max-w-md">
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-[#5b67f8] text-white p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm">Register and monitor carbon offset projects</p>
              </div>
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-[#5b67f8] text-white p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm">Track verification stages and project statuses</p>
              </div>
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-[#5b67f8] text-white p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm">Manage and transfer carbon credits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}