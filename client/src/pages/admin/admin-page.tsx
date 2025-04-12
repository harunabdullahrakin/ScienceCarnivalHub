import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import UsersTab from "./users-tab";
import RegistrationsTab from "./registrations-tab";
import ContentTab from "./content-tab";
import SettingsTab from "./settings-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Check if user is admin, if not redirect to home
  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-montserrat text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage users, settings, and content</p>
        </div>

        <Card className="overflow-hidden">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="flex border-b border-gray-200 bg-transparent rounded-none w-full">
              <TabsTrigger 
                value="users" 
                className="flex-1 py-4 px-6 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="registrations" 
                className="flex-1 py-4 px-6 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
              >
                Registrations
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex-1 py-4 px-6 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
              >
                Content
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 py-4 px-6 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="p-6">
              <UsersTab />
            </TabsContent>
            
            <TabsContent value="registrations" className="p-6">
              <RegistrationsTab />
            </TabsContent>
            
            <TabsContent value="content" className="p-6">
              <ContentTab />
            </TabsContent>
            
            <TabsContent value="settings" className="p-6">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
