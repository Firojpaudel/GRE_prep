import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
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
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex h-20 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-display font-medium uppercase tracking-widest text-primary dark:text-gray-100">
              Atelier GRE
            </Link>
          </div>
          
          {/* Navigation Links */}
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
          
          {/* Action Items */}
          <div className="flex items-center gap-4 border-l border-border-subtle dark:border-gray-800 pl-6 ml-4">
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
        </div>
      </div>
    </nav>
  );
}
