import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { User as SelectUser } from "@shared/schema";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");

  // Define type for profile data
  interface ProfileData {
    user: Omit<SelectUser, 'password'>;
    registrations: any[];
  }

  // Get user profile data (includes registrations)
  const { data: profileData, isLoading: isLoadingProfile } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  // Form for updating profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const payload: any = {};
      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.email) payload.email = data.email;
      if (data.username) payload.username = data.username;
      
      // Handle password update
      if (data.newPassword && data.currentPassword) {
        payload.password = data.newPassword;
        payload.currentPassword = data.currentPassword;
      }
      
      const res = await apiRequest("PUT", "/api/profile", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Invalidate the user and profile data to refresh them
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      
      // Reset form password fields
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Redirect if not logged in
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="bg-primary dark:bg-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold">Your Profile</h1>
          <p className="mt-2 text-xl">Manage your account information and registrations</p>
        </div>
      </div>
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(isLoading || isLoadingProfile) ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-sm p-6 sticky top-20">
                <div className="mb-6 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold mb-4">
                    {user?.firstName?.charAt(0) || user?.username.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  {user?.role === "admin" && (
                    <Badge className="mt-2" variant="outline">Admin</Badge>
                  )}
                </div>
                
                <nav className="space-y-1">
                  <Button 
                    variant={activeTab === "info" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("info")}
                  >
                    Personal Information
                  </Button>
                  <Button 
                    variant={activeTab === "security" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("security")}
                  >
                    Security
                  </Button>
                  <Button 
                    variant={activeTab === "registrations" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("registrations")}
                  >
                    My Registrations
                  </Button>
                </nav>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              {activeTab === "info" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Update your password and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your current password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter new password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  At least 8 characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm new password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "registrations" && (
                <Card>
                  <CardHeader>
                    <CardTitle>My Registrations</CardTitle>
                    <CardDescription>
                      View and manage your event registrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileData && profileData.registrations && profileData.registrations.length > 0 ? (
                      <div className="space-y-4">
                        {profileData.registrations.map((registration: any) => (
                          <Card key={registration.id} className="overflow-hidden">
                            <CardHeader className="p-4 bg-secondary/10">
                              <div className="flex flex-wrap justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {registration.firstName} {registration.lastName}
                                  </CardTitle>
                                  <CardDescription>
                                    ID: {registration.registrationId}
                                  </CardDescription>
                                </div>
                                <Badge>
                                  {registration.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Participant Type</p>
                                  <p className="text-sm">{registration.participantType}</p>
                                </div>
                                {registration.grade && (
                                  <div>
                                    <p className="text-sm font-medium">Grade</p>
                                    <p className="text-sm">{registration.grade}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">Email</p>
                                  <p className="text-sm">{registration.email}</p>
                                </div>
                                {registration.phoneNumber && (
                                  <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm">{registration.phoneNumber}</p>
                                  </div>
                                )}
                              </div>
                              
                              {registration.activities && registration.activities.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">Activities</p>
                                  <div className="flex flex-wrap gap-2">
                                    {registration.activities.map((activity: string, index: number) => (
                                      <Badge key={index} variant="secondary">{activity}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {registration.specialRequests && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium">Special Requests</p>
                                  <p className="text-sm mt-1">{registration.specialRequests}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">You haven't registered for any events yet.</p>
                        <Link href="/events">
                          <Button variant="outline">View Events</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}