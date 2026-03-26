import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const studyDays = useMemo(() => new Set(user?.user_data?.studyDays || []), [user]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const { firstDay, daysInMonth, year, month } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    return { firstDay: fd, daysInMonth: dim, year: y, month: m };
  }, [currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Streak logic using the raw dates
  const currentStreak = useMemo(() => {
    let streak = 0;
    let d = new Date();
    while (true) {
        const ds = d.toISOString().split('T')[0];
        if (studyDays.has(ds)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            if (streak === 0 && d.toDateString() === new Date().toDateString()) {
                d.setDate(d.getDate() - 1);
                const yes = d.toISOString().split('T')[0];
                if (studyDays.has(yes)) {
                    streak++;
                    d.setDate(d.getDate() - 1);
                    continue;
                }
            }
            break;
        }
    }
    return streak;
  }, [studyDays]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Interactive Calendar */}
      <div className="flex-1 p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-primary dark:text-gray-100">
            <CalendarDays className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Training Log</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={prevMonth} className="text-warm-grey hover:text-primary dark:hover:text-white transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="text-sm font-display min-w-[120px] text-center text-primary dark:text-gray-200">
                {monthNames[month]} {year}
             </span>
             <button onClick={nextMonth} className="text-warm-grey hover:text-primary dark:hover:text-white transition-colors" disabled={new Date(year, month + 1, 1) > new Date()}>
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-transparent" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateNum = i + 1;
            // Need to carefully build local strict dates to match ISO string formatting from backend without timezone shift
            const d = new Date(year, month, dateNum);
            // Adjust for local timezone offset just for exact ISO extraction
            const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            
            const isStudied = studyDays.has(localIso);
            const isToday = new Date().toDateString() === d.toDateString();

            return (
              <div 
                key={dateNum} 
                title={isStudied ? `Studied on ${localIso}` : localIso}
                className={`relative aspect-square flex items-center justify-center text-sm font-medium border transition-all duration-300 ${
                  isStudied 
                    ? 'border-transparent bg-primary dark:bg-gray-100 text-white dark:text-primary scale-100 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10' 
                    : isToday
                      ? 'border-primary dark:border-white text-primary dark:text-white bg-transparent'
                      : 'border-border-subtle/30 dark:border-gray-800/30 bg-transparent text-warm-grey dark:text-gray-600'
                } ${!isStudied && !isToday && 'hover:border-primary/30 dark:hover:border-white/30'}`}
              >
                {dateNum}
                {isStudied && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Summary */}
      <div className="md:w-64 p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111] flex flex-col justify-center items-center text-center">
         <Flame className={`w-12 h-12 mb-4 ${currentStreak > 0 ? "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "text-warm-grey dark:text-gray-600"}`} strokeWidth={1.5} />
         <div className="text-sm font-bold uppercase tracking-widest text-warm-grey dark:text-gray-400 mb-1">
           Current Streak
         </div>
         <div className="text-5xl font-display text-primary dark:text-gray-100 mb-4">
           {currentStreak}
         </div>
         <p className="text-xs text-warm-grey dark:text-gray-500 leading-relaxed max-w-[200px]">
           {currentStreak > 0 
              ? "You're on fire! Keep studying every day to build your momentum." 
              : "No active streak right now. Complete a study action today to spark the flame!"}
         </p>
      </div>
    </div>
  );
}
