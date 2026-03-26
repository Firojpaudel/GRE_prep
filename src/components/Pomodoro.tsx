import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Pomodoro() {
  const { user, updateUserData, logDailyActivity } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Play sound? Add notification?
      alert(`Time's up! ${mode === 'study' ? 'Take a break.' : 'Back to work.'}`);
      
      // Update stats
      if (mode === 'study') {
        const currentMins = user?.user_data?.pomodoroMinutes || 0;
        updateUserData({ pomodoroMinutes: currentMins + 25 });
        logDailyActivity({ minutes: 25 });
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
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary dark:bg-gray-100 text-white dark:text-primary p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <Timer className="w-6 h-6" />
      </button>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-white dark:bg-[#111] border border-border-subtle dark:border-gray-800 shadow-2xl p-5 z-50 animate-fade-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold tracking-widest uppercase text-primary dark:text-gray-300">Focus Timer</h3>
        <button onClick={() => setIsOpen(false)} className="text-warm-grey hover:text-black dark:hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={setStudyMode}
          className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 border ${mode === 'study' ? 'border-primary bg-black/5 dark:border-white dark:text-white dark:bg-white/10' : 'border-border-subtle dark:border-gray-800 text-warm-grey'}`}
        >
          Study (25)
        </button>
        <button 
          onClick={setBreakMode}
          className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 border ${mode === 'break' ? 'border-primary bg-black/5 dark:border-white dark:text-white dark:bg-white/10' : 'border-border-subtle dark:border-gray-800 text-warm-grey'}`}
        >
          Break (5)
        </button>
      </div>

      <div className="text-center font-display text-5xl text-primary dark:text-gray-100 mb-6 font-medium tracking-tight">
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={toggleTimer}
          className="flex items-center justify-center p-3 border border-border-subtle dark:border-gray-700 hover:border-primary dark:hover:border-white text-primary dark:text-gray-200"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="flex items-center justify-center p-3 border border-border-subtle dark:border-gray-700 hover:border-primary dark:hover:border-white text-primary dark:text-gray-200"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      
      {user && (
        <div className="mt-6 pt-4 border-t border-border-subtle dark:border-gray-800 text-center">
            <span className="text-[10px] uppercase tracking-widest text-warm-grey">Total Focus: {user.user_data?.pomodoroMinutes || 0}m</span>
        </div>
      )}
    </div>
  );
}
