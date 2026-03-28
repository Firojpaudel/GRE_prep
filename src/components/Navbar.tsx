import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, LogOut, Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/final_logo.png";

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "RESOURCES", path: "/" },
    { name: "PAID ASSETS", path: "/assets" },
    { name: "VOCAB", path: "/vocab" },
    { name: "ARENA", path: "/arena" },
    { name: "STRATEGY", path: "/strategy" },
    { name: "PLANNERS", path: "/planners" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-sand/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-border-subtle dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center z-50">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={appLogo} 
                alt="Atelier GRE Logo" 
                className="h-8 md:h-10 w-auto object-contain invert dark:invert-0"
              />
              <span className="text-lg md:text-2xl font-display font-medium uppercase tracking-widest text-primary dark:text-gray-100">
                Atelier GRE
              </span>
            </Link>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex flex-1 justify-center space-x-12">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && link.path !== "#";
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11px] font-bold tracking-[0.15em] transition-colors duration-500 ease-out pb-1 ${
                    isActive
                      ? "text-primary dark:text-white border-b border-primary dark:border-white"
                      : "text-warm-grey dark:text-gray-500 hover:text-primary dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          {/* Action Items - Desktop */}
          <div className="hidden md:flex items-center gap-4 border-l border-border-subtle dark:border-gray-800 pl-6 ml-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 text-warm-grey hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link 
              to="/settings" 
              className="p-2 text-warm-grey hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
            <button 
              onClick={logout}
              className="p-2 text-warm-grey hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2 z-50">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 text-warm-grey hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-warm-grey hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100 border-t border-border-subtle dark:border-gray-800" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-sand/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path && link.path !== "#";
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-2 py-2 text-xs font-bold tracking-[0.15em] transition-colors ${
                  isActive
                    ? "text-primary dark:text-white bg-primary/5 dark:bg-white/5 rounded-md"
                    : "text-warm-grey dark:text-gray-500 hover:text-primary dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-2 border-t border-border-subtle dark:border-gray-800 flex flex-col gap-1">
            <Link 
              to="/settings" 
              className="flex items-center gap-3 px-2 py-3 text-xs font-bold tracking-[0.15em] uppercase text-warm-grey dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
            >
              <SettingsIcon className="w-4 h-4" /> Settings
            </Link>
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-2 py-3 text-xs font-bold tracking-[0.15em] uppercase text-warm-grey hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
