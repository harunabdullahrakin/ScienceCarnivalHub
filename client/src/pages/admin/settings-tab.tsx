import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

export default function SettingsTab() {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    siteTitle: "",
    siteDescription: "",
    contactEmail: "",
    registrationStatus: "open",
    eventDate: "",
    eventTime: "",
    eventLocation: ""
  });

  const [emailSettings, setEmailSettings] = useState({
    emailFrom: "",
    emailName: "",
    sendConfirmation: true,
    sendReminder: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981"
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Update state when settings load
  useEffect(() => {
    if (settings) {
      // General settings
      if (settings.general) {
        setGeneralSettings({
          siteTitle: settings.general.siteTitle || "",
          siteDescription: settings.general.siteDescription || "",
          contactEmail: settings.general.contactEmail || "",
          registrationStatus: settings.general.registrationStatus || "open",
          eventDate: settings.general.eventDate || "",
          eventTime: settings.general.eventTime || "",
          eventLocation: settings.general.eventLocation || ""
        });
      }
      
      // Email settings
      if (settings.email) {
        setEmailSettings({
          emailFrom: settings.email.emailFrom || "",
          emailName: settings.email.emailName || "",
          sendConfirmation: settings.email.sendConfirmation === "true",
          sendReminder: settings.email.sendReminder === "true"
        });
      }
      
      // Appearance settings
      if (settings.appearance) {
        setAppearanceSettings({
          primaryColor: settings.appearance.primaryColor || "#3B82F6",
          secondaryColor: settings.appearance.secondaryColor || "#10B981"
        });
      }
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ group, settings }: { group: string; settings: Record<string, string> }) => {
      const res = await apiRequest("POST", "/api/settings", { group, settings });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating settings",
        description: error.message || "There was a problem updating the settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveGeneralSettings = () => {
    updateSettingsMutation.mutate({
      group: "general",
      settings: {
        siteTitle: generalSettings.siteTitle,
        siteDescription: generalSettings.siteDescription,
        contactEmail: generalSettings.contactEmail,
        registrationStatus: generalSettings.registrationStatus,
        eventDate: generalSettings.eventDate,
        eventTime: generalSettings.eventTime,
        eventLocation: generalSettings.eventLocation
      }
    });
  };

  const handleSaveEmailSettings = () => {
    updateSettingsMutation.mutate({
      group: "email",
      settings: {
        emailFrom: emailSettings.emailFrom,
        emailName: emailSettings.emailName,
        sendConfirmation: emailSettings.sendConfirmation.toString(),
        sendReminder: emailSettings.sendReminder.toString()
      }
    });
  };

  const handleSaveAppearanceSettings = () => {
    updateSettingsMutation.mutate({
      group: "appearance",
      settings: {
        primaryColor: appearanceSettings.primaryColor,
        secondaryColor: appearanceSettings.secondaryColor
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-title">Site Title</Label>
                  <Input 
                    id="site-title" 
                    value={generalSettings.siteTitle} 
                    onChange={(e) => setGeneralSettings({...generalSettings, siteTitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea 
                    id="site-description" 
                    rows={2} 
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                  />
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Label htmlFor="event-date">Event Date</Label>
                  <Input 
                    id="event-date" 
                    value={generalSettings.eventDate}
                    onChange={(e) => setGeneralSettings({...generalSettings, eventDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-time">Event Time</Label>
                  <Input 
                    id="event-time" 
                    value={generalSettings.eventTime}
                    onChange={(e) => setGeneralSettings({...generalSettings, eventTime: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-location">Event Location</Label>
                  <Input 
                    id="event-location" 
                    value={generalSettings.eventLocation}
                    onChange={(e) => setGeneralSettings({...generalSettings, eventLocation: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Registration Status</Label>
                  <RadioGroup 
                    value={generalSettings.registrationStatus}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, registrationStatus: value})}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="open" id="reg-open" />
                      <Label htmlFor="reg-open">Open</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="closed" id="reg-closed" />
                      <Label htmlFor="reg-closed">Closed</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveGeneralSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-from">From Email</Label>
                  <Input 
                    id="email-from" 
                    type="email" 
                    value={emailSettings.emailFrom}
                    onChange={(e) => setEmailSettings({...emailSettings, emailFrom: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-name">From Name</Label>
                  <Input 
                    id="email-name" 
                    value={emailSettings.emailName}
                    onChange={(e) => setEmailSettings({...emailSettings, emailName: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="send-confirmation"
                    checked={emailSettings.sendConfirmation}
                    onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendConfirmation: checked})}
                  />
                  <Label htmlFor="send-confirmation">Send registration confirmation emails</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="send-reminder"
                    checked={emailSettings.sendReminder}
                    onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendReminder: checked})}
                  />
                  <Label htmlFor="send-reminder">Send event reminder emails</Label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveEmailSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      id="primary-color" 
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                      className="h-10 w-10 rounded"
                    />
                    <Input 
                      value={appearanceSettings.primaryColor} 
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                      className="ml-2 flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      id="secondary-color" 
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, secondaryColor: e.target.value})}
                      className="h-10 w-10 rounded"
                    />
                    <Input 
                      value={appearanceSettings.secondaryColor} 
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, secondaryColor: e.target.value})}
                      className="ml-2 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Logo</Label>
                  <Input type="file" id="logo-upload" disabled />
                  <p className="text-sm text-gray-500">Logo upload is not available in this version.</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveAppearanceSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
