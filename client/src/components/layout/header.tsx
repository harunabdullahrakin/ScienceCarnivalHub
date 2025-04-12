import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MobileMenu from "./mobile-menu";
import UserMenu from "./user-menu";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-background border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex flex-1">
            <div className="flex-shrink-0 flex items-center">
              <div className="cursor-pointer">
                <Link href="/">
                  <div className="flex items-center">
                    <span className="font-montserrat font-bold text-lg sm:text-2xl text-primary-600">TGHBHS</span>
                    <span className="font-montserrat ml-1 sm:ml-2 font-medium text-sm sm:text-lg text-dark-500 hidden xs:block">Science Carnival</span>
                  </div>
                </Link>
              </div>
            </div>
            <nav className="hidden sm:ml-4 md:ml-6 sm:flex sm:space-x-4 md:space-x-8">
              <Link href="/">
                <div className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive("/") ? "border-primary-500 text-primary-600 font-semibold" : "border-transparent hover:border-primary-300 text-gray-700"} text-xs sm:text-sm font-medium cursor-pointer`}>
                  Home
                </div>
              </Link>
              <Link href="/events">
                <div className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive("/events") ? "border-primary-500 text-primary-600 font-semibold" : "border-transparent hover:border-primary-300 text-gray-700"} text-sm font-medium cursor-pointer`}>
                  Events
                </div>
              </Link>
              <Link href="/wiki">
                <div className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive("/wiki") ? "border-primary-500 text-primary-600 font-semibold" : "border-transparent hover:border-primary-300 text-gray-700"} text-sm font-medium cursor-pointer`}>
                  Wiki
                </div>
              </Link>
              <Link href="/register">
                <div className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive("/register") ? "border-primary-500 text-primary-600 font-semibold" : "border-transparent hover:border-primary-300 text-gray-700"} text-sm font-medium cursor-pointer`}>
                  Register
                </div>
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <ThemeToggle />
            {!user ? (
              <Link href="/auth">
                <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer">
                  Sign in
                </div>
              </Link>
            ) : (
              <UserMenu />
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </header>
  );
}
