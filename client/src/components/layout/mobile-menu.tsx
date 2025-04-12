import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "./theme-toggle";

type MobileMenuProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="sm:hidden">
      <div className="pt-2 pb-3 space-y-1">
        <Link href="/">
          <div
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              isActive("/")
                ? "border-primary-500 text-primary-700 bg-primary-50"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
            onClick={handleLinkClick}
          >
            Home
          </div>
        </Link>
        <Link href="/events">
          <div
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              isActive("/events")
                ? "border-primary-500 text-primary-700 bg-primary-50"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
            onClick={handleLinkClick}
          >
            Events
          </div>
        </Link>
        <Link href="/wiki">
          <div
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              isActive("/wiki")
                ? "border-primary-500 text-primary-700 bg-primary-50"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
            onClick={handleLinkClick}
          >
            Wiki
          </div>
        </Link>
        <Link href="/register">
          <div
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              isActive("/register")
                ? "border-primary-500 text-primary-700 bg-primary-50"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
            onClick={handleLinkClick}
          >
            Register
          </div>
        </Link>
      </div>
      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="px-3 py-2 flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-500">Theme</span>
          <ThemeToggle />
        </div>
        {!user ? (
          <Link href="/auth">
            <div
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              onClick={handleLinkClick}
            >
              Sign in
            </div>
          </Link>
        ) : (
          <>
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {user.firstName?.charAt(0) || user.username.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/dashboard">
                <div
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                  onClick={handleLinkClick}
                >
                  Dashboard
                </div>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <div
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                    onClick={handleLinkClick}
                  >
                    Admin Panel
                  </div>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
