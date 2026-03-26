import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import appLogo from "../assets/final_logo.png";

export default function AuthView({ message = "Sign in to access this section" }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    
    try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin 
            ? { email, password } 
            : { username, email, password };
        
        const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
        const requestUrl = apiBaseUrl
          ? `${apiBaseUrl.replace(/\/$/, '')}${endpoint}`
          : endpoint;

        const res = await fetch(requestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const raw = await res.text();
        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error('Server returned an invalid response. Check API deployment/env vars.');
        }
        
        if (!res.ok) {
            if (res.status === 502 || res.status === 503) {
              throw new Error('Auth service is temporarily unavailable (server/database config issue). Please try again in a moment.');
            }
            throw new Error(data.error || 'Authentication failed');
        }
        
        login(data.user, data.token);
    } catch (err: any) {
        if (err instanceof TypeError) {
          setAuthError('Network error: cannot reach authentication service.');
        } else {
          setAuthError(err.message || "Authentication failed.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-fade-up px-4 relative">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="fixed top-6 right-6 md:top-8 md:right-8 p-3 bg-white/50 dark:bg-[#111] rounded-full text-warm-grey hover:text-primary dark:text-gray-400 dark:hover:text-white transition-all backdrop-blur-md border border-border-subtle dark:border-gray-800 shadow-sm"
        title="Toggle Theme"
      >
        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="flex flex-col items-center gap-4 mb-4">
        <img 
          src={appLogo} 
          alt="Atelier GRE Logo" 
          className="h-20 md:h-24 w-auto object-contain invert dark:invert-0"
        />
        <h1 className="text-2xl md:text-3xl text-primary dark:text-gray-100 font-display text-center uppercase tracking-widest">
          Atelier GRE
        </h1>
      </div>
      
      <p className="text-sm md:text-base text-warm-grey dark:text-gray-400 text-center max-w-md mt-6 mb-2">
        {message !== "Sign in to access this section" && message !== "Access Restricted. Sign in to your account."
          ? message
          : (isLogin ? "Welcome back! Sign in to continue your preparation." : "Join Atelier GRE to access premium preparation resources.")}
      </p>

      <div className="border border-border-subtle dark:border-gray-700 bg-white/50 dark:bg-[#111] p-8 space-y-6 flex flex-col items-center w-full max-w-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-primary dark:text-gray-300">
          {isLogin ? "Sign In" : "Register Candidate"}
        </p>
        
        <form onSubmit={handleAuth} className="w-full space-y-4">
            {!isLogin && (
              <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded-sm focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
              />
            )}
            
            <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded-sm focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
            />
            
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded-sm focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
            />

            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

            <button 
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary dark:bg-gray-100 text-white dark:text-primary font-medium hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? "Processing..." : (isLogin ? "Authenticate" : "Enroll")} <ChevronRight className="w-4 h-4" />
            </button>
        </form>
        
        <button 
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-xs text-warm-grey dark:text-gray-500 hover:text-accent dark:hover:text-[#CBB599] transition-colors mt-4"
        >
            {isLogin ? "No profile? Register Instead" : "Already enrolled? Sign In"}
        </button>
      </div>
    </div>
  );
}
