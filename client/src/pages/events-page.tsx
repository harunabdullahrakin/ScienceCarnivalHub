import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock events data (in real application, this would come from the database)
const events = [
  {
    id: 1,
    title: "Science Fair Competition",
    description: "Annual competition showcasing student projects across various scientific disciplines.",
    date: "2025-04-25",
    time: "10:00 AM - 4:00 PM",
    location: "Main Hall",
    category: "competition",
    capacity: 100,
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 2,
    title: "Chemistry Workshop: Reactions in Action",
    description: "Hands-on workshop demonstrating exciting chemical reactions with explanations.",
    date: "2025-04-26",
    time: "1:00 PM - 3:00 PM",
    location: "Lab Room B",
    category: "workshop",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    title: "Guest Lecture: Advances in Quantum Physics",
    description: "Distinguished professor discusses recent breakthroughs in quantum physics research.",
    date: "2025-04-27",
    time: "11:00 AM - 12:30 PM",
    location: "Auditorium",
    category: "lecture",
    capacity: 200,
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 4,
    title: "Biology Exhibition: The Human Body",
    description: "Interactive display showcasing the wonders of human anatomy and physiology.",
    date: "2025-04-25",
    time: "9:00 AM - 5:00 PM",
    location: "Exhibition Hall",
    category: "exhibition",
    capacity: 150,
    image: "https://images.unsplash.com/photo-1530210124550-912dc1381fdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 5,
    title: "Robotics Demonstration",
    description: "Students showcase their robotics projects with live demonstrations.",
    date: "2025-04-26",
    time: "2:00 PM - 4:00 PM",
    location: "Tech Lab",
    category: "demonstration",
    capacity: 50,
    image: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 6,
    title: "Environmental Science Field Trip",
    description: "Guided tour of local ecosystem with hands-on data collection activities.",
    date: "2025-04-27",
    time: "9:00 AM - 2:00 PM",
    location: "Meet at School Entrance",
    category: "field-trip",
    capacity: 40,
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  }
];

export default function EventsPage() {
  const [category, setCategory] = useState<string>("all");
  
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });
  
  const filteredEvents = category === "all" 
    ? events 
    : events.filter(event => event.category === category);
  
  const uniqueCategories = Array.from(new Set(events.map(event => event.category)));
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="bg-primary dark:bg-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-4xl font-montserrat font-bold">Science Carnival Events</h1>
          <p className="mt-2 text-lg md:text-xl">Explore our exciting lineup of events and activities</p>
        </div>
      </div>
      
      <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-12">
        <Tabs defaultValue="all" className="w-full mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Upcoming Events</h2>
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-9">
                <TabsTrigger value="all" onClick={() => setCategory("all")}>All</TabsTrigger>
                {uniqueCategories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat} 
                    onClick={() => setCategory(cat)}
                    className="capitalize whitespace-nowrap"
                  >
                    {cat.replace('-', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          
          <TabsContent value={category} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col h-full border-2 hover:border-primary/50 transition-all duration-300">
                  <div className="sm:h-36 h-44 overflow-hidden relative">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    <Badge 
                      variant="secondary" 
                      className="capitalize whitespace-nowrap absolute top-2 right-2 shadow-md bg-background/90 backdrop-blur-sm"
                    >
                      {event.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-lg sm:text-xl break-words leading-tight">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-sm">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-primary/70" />
                        <span className="truncate">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4 flex-shrink-0 text-primary/70" />
                        <span className="truncate">{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-2 h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span className="truncate">Capacity: {event.capacity} participants</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 mt-auto">
                    <Button className="w-full shadow-sm">Register for Event</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8" />
        
        <div className="bg-card rounded-lg p-4 sm:p-5 md:p-6 shadow-sm border">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 font-montserrat">Event Information</h2>
          <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            <p className="text-sm sm:text-base">
              The TGHBHS Science Carnival features a variety of events designed to engage, educate, and inspire students
              across all scientific disciplines. All events are free for registered participants.
            </p>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-background/50 p-3 sm:p-4 rounded-lg border">
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">Registration Process</h3>
                <p className="mb-2 text-sm sm:text-base">
                  <strong>1.</strong> To participate in specific events, register using the button on each event card.
                </p>
                <p className="mb-2">
                  <strong>2.</strong> Some events have limited capacity and registration is on a first-come, first-served basis.
                </p>
                <p>
                  <strong>3.</strong> After registration, you'll receive a confirmation email with details about the event.
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-primary mb-2">Event Categories</h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span><strong>Workshops:</strong> Hands-on activities led by instructors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span><strong>Lectures:</strong> Presentations by guest speakers and experts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span><strong>Competitions:</strong> Contests with prizes for winners</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span><strong>Exhibitions:</strong> Walk-through displays and demonstrations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span><strong>Field Trips:</strong> Guided excursions to relevant sites</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Important Notes</h3>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">•</span>
                  <span>All events take place on the TGHBHS campus. Maps will be provided to registered participants.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">•</span>
                  <span>Please arrive 15 minutes before the scheduled start time for all events.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">•</span>
                  <span>For further questions, contact the Science Department at science@tghbhs.edu</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}