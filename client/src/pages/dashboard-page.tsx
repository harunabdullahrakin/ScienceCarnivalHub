import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Calendar, Download, FileEdit } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/registrations"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const generalSettings = settings?.general || {
    eventDate: "May 15th, 2023",
    eventTime: "9:00 AM - 4:00 PM",
    eventLocation: "TGHBHS Main Campus",
  };

  // Fake schedule data for UI presentation, in a real app this would come from the backend
  const scheduleItems = [
    {
      time: "9:30 AM",
      title: "Opening Ceremony",
      location: "Main Auditorium",
      duration: "45 min",
      type: "primary"
    },
    {
      time: "11:00 AM",
      title: "Interactive Physics Lab",
      location: "Science Wing, Room 101",
      duration: "1 hour",
      type: "secondary"
    },
    {
      time: "1:30 PM",
      title: "Science Competition",
      location: "Gymnasium",
      duration: "2 hours",
      type: "accent"
    }
  ];

  if (!user) {
    return null; // ProtectedRoute should handle this case
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-montserrat text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName || user.username}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Registration Card */}
            {registrationsLoading ? (
              <Card>
                <CardContent className="p-8 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading registration details...</span>
                </CardContent>
              </Card>
            ) : registrations && registrations.length > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Your Registration</CardTitle>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {registrations[0].status.charAt(0).toUpperCase() + registrations[0].status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Event Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{generalSettings.eventDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ticket Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{registrations[0].participantType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registered Activities</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {registrations[0].activities?.join(", ") || "None selected"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registration ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">#{registrations[0].registrationId}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FileEdit className="mr-2 h-4 w-4" />
                      Update Registration
                    </Button>
                    <Button size="sm" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Download Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mb-4 text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No registrations found</h3>
                  <p className="text-gray-500 mb-6">You haven't registered for the Science Carnival yet.</p>
                  <Button asChild>
                    <Link href="/register">Register Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="text-primary-600 font-semibold">{item.time.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">{item.time.split(' ')[1]}</div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className={`bg-${item.type === 'primary' ? 'primary' : item.type === 'secondary' ? 'green' : 'amber'}-50 border-l-4 border-${item.type === 'primary' ? 'primary' : item.type === 'secondary' ? 'green' : 'amber'}-500 p-3 rounded-r-md`}>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.location} - {item.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-800 text-sm font-medium">View full schedule &rarr;</a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {user.firstName?.charAt(0) || user.username.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button variant="outline" className="w-full justify-center">
                    Edit Profile
                  </Button>
                  {user.role === "admin" && (
                    <Button variant="outline" className="w-full justify-center" asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Useful Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3">
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-primary-600 text-sm sm:text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Event Schedule</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Campus Map</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Speaker Bios</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>FAQ</span>
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
