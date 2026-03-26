import { useAuth } from "../context/AuthContext";
import { LogOut, User, Settings as SettingsIcon, Mail, Trophy, CalendarDays } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-fade-in pb-16">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-warm-grey dark:text-gray-400">
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Preferences</span>
        </div>
        <h1 className="text-4xl md:text-5xl text-primary dark:text-gray-100 font-display">
          Account Settings
        </h1>
      </header>

      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-gray-200 border-b border-border-subtle dark:border-gray-800 pb-3">
          Profile Information
        </h2>
        
        <div className="bg-white/50 dark:bg-[#111] border border-border-subtle dark:border-gray-800 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1 block">Username</label>
              <div className="flex items-center gap-3 text-primary dark:text-gray-200">
                <User className="w-4 h-4" />
                <span className="font-medium">{user.username}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1 block">Email</label>
              <div className="flex items-center gap-3 text-primary dark:text-gray-200">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{user.email || "student@atelier.edu"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-gray-200 border-b border-border-subtle dark:border-gray-800 pb-3">
          Session Data
        </h2>
        
        <div className="bg-white/50 dark:bg-[#111] border border-border-subtle dark:border-gray-800 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1 block">Highest Score</label>
              <div className="flex items-center gap-3 text-primary dark:text-gray-200">
                <Trophy className="w-4 h-4" />
                <span className="font-display text-xl">{user.high_score || 0}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1 block">Longest Streak</label>
              <div className="flex items-center gap-3 text-primary dark:text-gray-200">
                <CalendarDays className="w-4 h-4" />
                <span className="font-display text-xl">{user.longest_streak || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer rounded-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </section>
    </div>
  );
}
