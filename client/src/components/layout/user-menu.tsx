import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function UserMenu() {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="ml-3 relative" ref={menuRef}>
      <div>
        <button
          type="button"
          className="flex text-sm rounded-full focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            {user.firstName?.charAt(0) || user.username.charAt(0)}
          </span>
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <Link href="/profile">
            <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              Profile
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              Dashboard
            </div>
          </Link>
          {user.role === "admin" && (
            <Link href="/admin">
              <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Admin Panel
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
