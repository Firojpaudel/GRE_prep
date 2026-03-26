import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Pomodoro() {
  const { user, updateUserData, logDailyActivity } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [, setElapsedStudySeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'study') {
          setElapsedStudySeconds((prev) => {
            const next = prev + 1;
            if (next >= 60) {
               // Update stats minute by minute
               updateUserData((prevData) => ({
                 pomodoroMinutes: (prevData.pomodoroMinutes || 0) + 1
               }));
               logDailyActivity({ minutes: 1 });
               return 0;
            }
            return next;
          });
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Play sound? Add notification?
      alert(`Time's up! ${mode === 'study' ? 'Take a break.' : 'Back to work.'}`);
      
      // Update stats
      if (mode === 'study') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('study');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, user, updateUserData, logDailyActivity]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const setStudyMode = () => {
    setIsRunning(false);
    setMode('study');
    setTimeLeft(25 * 60);
  };

  const setBreakMode = () => {
    setIsRunning(false);
    setMode('break');
    setTimeLeft(5 * 60);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        {isRunning && (
          <div className="absolute -inset-2 bg-accent/20 rounded-full blur-md animate-pulse-soft pointer-events-none"></div>
        )}
        <button 
          onClick={() => setIsOpen(true)}
          className={`relative bg-primary dark:bg-gray-100 text-white dark:text-primary p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${isRunning ? 'scale-100 hover:scale-105' : 'hover:scale-110 hover:-translate-y-1 hover:shadow-2xl'}`}
        >
          <Timer className={`w-6 h-6 ${isRunning ? 'text-accent dark:text-[#A67C52] animate-float' : ''}`} />
          {isRunning && (
              <span className="absolute 0 right-0 top-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
          )}
        </button>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 w-[320px] bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border border-border-subtle dark:border-gray-800 shadow-2xl p-6 z-50 animate-scale-up rounded-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${isRunning ? 'text-accent animate-pulse' : 'text-warm-grey'}`} />
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary dark:text-gray-300">Focus Session</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-warm-grey hover:text-red-500 transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-black/5 dark:bg-white/5 p-1 rounded-sm">
        <button 
          onClick={setStudyMode}
          className={`flex-1 text-[10px] font-bold uppercase tracking-[0.15em] py-2 transition-all ${mode === 'study' ? 'bg-white dark:bg-[#222] shadow-sm text-primary dark:text-white' : 'text-warm-grey hover:text-primary dark:hover:text-gray-300'}`}
        >
          Study 25m
        </button>
        <button 
          onClick={setBreakMode}
          className={`flex-1 text-[10px] font-bold uppercase tracking-[0.15em] py-2 transition-all ${mode === 'break' ? 'bg-white dark:bg-[#222] shadow-sm text-primary dark:text-white' : 'text-warm-grey hover:text-primary dark:hover:text-gray-300'}`}
        >
          Break 5m
        </button>
      </div>

      <div className="text-center font-display text-7xl text-primary dark:text-gray-100 mb-8 font-medium tracking-tighter tabular-nums drop-shadow-sm">
        {mins.toString().padStart(2, '0')}<span className="text-warm-grey/50 dark:text-gray-700 animate-pulse">:</span>{secs.toString().padStart(2, '0')}
      </div>

      <div className="flex justify-center gap-3">
        <button 
          onClick={toggleTimer}
          className="flex-1 flex items-center justify-center gap-2 p-3.5 border border-border-subtle dark:border-gray-700 hover:border-primary dark:hover:border-white text-primary dark:text-gray-200 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
        >
          {isRunning ? (
            <><Pause className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest font-bold">Pause</span></>
          ) : (
            <><Play className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest font-bold">Start</span></>
          )}
        </button>
        <button 
          onClick={resetTimer}
          className="flex-none flex items-center justify-center p-3.5 border border-border-subtle dark:border-gray-700 hover:border-primary dark:hover:border-white text-warm-grey hover:text-primary dark:hover:text-gray-200 transition-all hover:scale-110 duration-500"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      {user && (
        <div className="mt-6 pt-4 border-t border-border-subtle dark:border-gray-800 flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest text-warm-grey">Total Focus</span>
            <span className="text-xs font-bold font-display text-accent dark:text-[#CBB599]">{user.user_data?.pomodoroMinutes || 0}m <Flame className="w-3 h-3 inline-block -mt-0.5" /></span>
        </div>
      )}
    </div>
  );
}
