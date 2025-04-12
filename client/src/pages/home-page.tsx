import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const generalSettings = settings?.general || {
    eventDate: "May 15th, 2023",
    eventTime: "9:00 AM - 4:00 PM",
    eventLocation: "TGHBHS Main Campus",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-montserrat font-bold mb-3 sm:mb-4">Discover the World of Science</h1>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8">Join us for an exciting day of scientific discovery, hands-on experiments, and inspiring presentations at the TGHBHS Science Carnival.</p>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <Link href="/register">
                    <div className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 shadow-lg cursor-pointer">
                      Register Now
                    </div>
                  </Link>
                  <div 
                    onClick={() => document.getElementById('event-info')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 cursor-pointer"
                  >
                    Learn More
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <svg className="w-full h-auto" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="600" height="400" rx="8" fill="#3B74C1" />
                  <circle cx="300" cy="200" r="150" fill="#60A5FA" />
                  <path d="M300 50C369.036 50 425 105.964 425 175C425 244.036 369.036 300 300 300C230.964 300 175 244.036 175 175C175 105.964 230.964 50 300 50Z" fill="#93C5FD" />
                  <path d="M350 170C350 197.614 327.614 220 300 220C272.386 220 250 197.614 250 170C250 142.386 272.386 120 300 120C327.614 120 350 142.386 350 170Z" fill="#EFF6FF" />
                  <path d="M320 230L300 320L280 230C286.063 233.124 292.931 235 300 235C307.069 235 313.937 233.124 320 230Z" fill="#EFF6FF" />
                  <path d="M230 140L180 80L240 110C235.029 119.018 231.61 129.152 230 140Z" fill="#EFF6FF" />
                  <path d="M370 140L420 80L360 110C364.971 119.018 368.39 129.152 370 140Z" fill="#EFF6FF" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="py-12 bg-white" id="event-info">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-4">Event Information</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Mark your calendars for the most exciting science event of the year!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="inline-block p-3 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Date & Time</h3>
                <p className="text-gray-600">{generalSettings.eventDate}<br/>{generalSettings.eventTime}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="inline-block p-3 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Location</h3>
                <p className="text-gray-600">{generalSettings.eventLocation}<br/>Science Building & Outdoor Area</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="inline-block p-3 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Admission</h3>
                <p className="text-gray-600">Free for students<br/>$5 for general public</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-4">What to Expect</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore a variety of activities and exhibits designed to inspire scientific curiosity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Interactive Experiments</h3>
                <p className="text-gray-600">Get hands-on with exciting experiments across physics, chemistry, and biology.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Presentations</h3>
                <p className="text-gray-600">Learn from industry professionals and academic experts in various scientific fields.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Science Competitions</h3>
                <p className="text-gray-600">Participate in exciting contests and win prizes for your scientific knowledge and skills.</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/register">
                <div className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md cursor-pointer">
                  Register for the Event
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-4">Our Sponsors</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Thanks to these organizations for supporting science education</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="h-16 w-32 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Sponsor {i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
