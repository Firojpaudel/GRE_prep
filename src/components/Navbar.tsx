import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
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
    { name: "VOCABULARY", path: "/vocab" },
    { name: "ARENA", path: "/arena" },
    { name: "STRATEGY", path: "/strategy" },
    { name: "PLANNERS", path: "/planners" },
    { name: "ABOUT", path: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-sand/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-border-subtle dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex h-20 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-display font-medium uppercase tracking-widest text-primary dark:text-gray-100">
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
                  className={`text-xs font-bold tracking-[0.15em] hover-underline transition-colors duration-500 ease-out pb-1 ${
                    isActive
                      ? "text-primary dark:text-white border-b border-primary dark:border-white"
                      : "text-warm-grey dark:text-gray-400 hover:text-primary dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          {/* Action Items */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="text-[10px] font-bold tracking-[0.2em] uppercase border border-border-subtle dark:border-gray-700 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-primary dark:text-gray-300"
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <div className="md:hidden flex items-center">
              <span className="text-xs font-bold tracking-widest uppercase text-primary dark:text-white">Menu</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
