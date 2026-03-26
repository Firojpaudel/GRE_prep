import { ArrowRight, BookOpen, Flame, Trophy, CalendarDays, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AuthView from "../components/AuthView";

const resources = [
  {
    category: "1. Official ETS Foundation",
    description: "The only definitive source of truth for the exam.",
    items: [
      { title: "POWERPREP Online (2 Free Mocks)", url: "https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html", type: "Diagnostic" },
      { title: "ETS Math Review (100-page PDF)", url: "https://www.ets.org/pdfs/gre/gre-math-review.pdf", type: "Theory" },
      { title: "ETS Mathematical Conventions", url: "https://www.ets.org/pdfs/gre/gre-math-conventions.pdf", type: "Theory" },
      { title: "Official AWA Issue Topic Pool (PDF)", url: "https://www.ets.org/pdfs/gre/issue-pool.pdf", type: "Prompts" }
    ]
  },
  {
    category: "2. Full-Length Diagnostics",
    description: "Free official-quality mock exams from leading test prep companies.",
    items: [
      { title: "Manhattan Prep Free Diagnostic", url: "https://www.manhattanprep.com/gre/free-gre-practice-test/", type: "Exam" },
      { title: "Kaplan Free Practice Test", url: "https://www.kaptest.com/gre/free/gre-practice-test-options", type: "Exam" },
      { title: "Princeton Review Free Mock", url: "https://www.princetonreview.com/grad/gre-practice-test", type: "Exam" },
      { title: "Magoosh Free Practice Test (Updated)", url: "https://magoosh.com/gre/gre-practice-test/", type: "Exam" }
    ]
  },
  {
    category: "3. Logic & Quantitative",
    description: "Drill math concepts logically, not purely algebraically.",
    items: [
      { title: "Khan Academy Math Sandbox", url: "https://www.khanacademy.org/math", type: "Concepts" },
      { title: "Target Test Prep (Free Trial)", url: "https://gre.targettestprep.com/", type: "Platform" },
      { title: "Prepscholar Math Cheat Sheet", url: "https://www.prepscholar.com/gre/blog/gre-math-cheat-sheet/", type: "Guide" },
      { title: "GregMat YouTube Archive", url: "https://www.youtube.com/@gregmat8036", type: "Lectures" }
    ]
  },
  {
    category: "4. Verbal Conditioning",
    description: "Elevated reading materials and essential vocab builders.",
    items: [
      { title: "Internal 3k & 7k Vocab Archive", url: "/vocab", type: "Internal" },
      { title: "Vocab Assessment Arena (Beta)", url: "/arena", type: "Internal" },
      { title: "Arts & Letters Daily", url: "https://aldaily.com/", type: "Passages" },
      { title: "Project Gutenberg (Classic Lit)", url: "https://www.gutenberg.org/", type: "Reading" },
      { title: "FreeRice Contextual Vocab", url: "https://freerice.com/", type: "Game" }
    ]
  }
];


const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};



export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <AuthView message="Sign in to view your dashboard" />;
  }

  const studyDays = new Set(user.user_data?.studyDays || []);
  const learnedWordsCount = user.user_data?.learnedWords?.length || 0;
  const pomodoroMins = user.user_data?.pomodoroMinutes || 0;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(new Date().toISOString().split('T')[0]);

  // Streak logic
  let currentStreak = 0;
  let d = new Date();
  while (true) {
      const ds = d.toISOString().split('T')[0];
      if (studyDays.has(ds)) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
      } else {
          // If we missed today, let's check if we at least hit yesterday to maintain ongoing streak concept broadly.
          // For strict strict, if today is not hit, streak could be 0, but usually we allow 'today' to be missing until end of day
          if (currentStreak === 0 && d.toDateString() === new Date().toDateString()) {
              d.setDate(d.getDate() - 1);
              const yes = d.toISOString().split('T')[0];
              if (studyDays.has(yes)) {
                  currentStreak++;
                  d.setDate(d.getDate() - 1);
                  continue;
              }
          }
          break;
      }
  }

  return (
    <div className="space-y-16 animate-fade-in pb-16">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl text-primary dark:text-gray-100 font-display">
          Welcome back, {user.username}
        </h1>
        <p className="max-w-2xl text-warm-grey dark:text-gray-400 leading-relaxed font-mono text-sm">
          Track your preparation consistency, vocab acquisition, and practice test metrics.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
              <div className="flex items-center gap-2 text-warm-grey dark:text-gray-500 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Study Streak</span>
              </div>
              <div className="text-3xl font-display text-primary dark:text-gray-100">{currentStreak} Days</div>
              <div className="mt-2 text-[10px] uppercase text-warm-grey dark:text-gray-500">Longest: {user.longest_streak || currentStreak}</div>
          </div>
          
          <div className="p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
              <div className="flex items-center gap-2 text-warm-grey dark:text-gray-500 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Arena High Score</span>
              </div>
              <div className="text-3xl font-display text-primary dark:text-gray-100">{user.high_score || 0}</div>
              <div className="mt-2 text-[10px] uppercase text-warm-grey dark:text-gray-500">Record in assessments</div>
          </div>

          <div className="p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
              <div className="flex items-center gap-2 text-warm-grey dark:text-gray-500 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Learned Words</span>
              </div>
              <div className="text-3xl font-display text-primary dark:text-gray-100">{learnedWordsCount}</div>
              <div className="mt-2 text-[10px] uppercase text-warm-grey dark:text-gray-500">Vault Vocabulary</div>
          </div>

          <div className="p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
              <div className="flex items-center gap-2 text-warm-grey dark:text-gray-500 mb-2">
                  <Timer className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Focus Time</span>
              </div>
              <div className="text-3xl font-display text-primary dark:text-gray-100">{pomodoroMins}m</div>
              <div className="mt-2 text-[10px] uppercase text-warm-grey dark:text-gray-500">Pomodoro Timer</div>
          </div>
      </div>

      
      {/* Real Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-primary dark:text-gray-100">
                  <CalendarDays className="w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Activity Calendar</h2>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <ChevronLeft className="w-5 h-5 dark:text-gray-400" />
                </button>
                <span className="text-sm font-bold uppercase tracking-widest dark:text-gray-200">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <ChevronRight className="w-5 h-5 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 border border-transparent"></div>
              ))}
              {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasActivity = studyDays.has(dateStr);
                const isSelected = selectedDateStr === dateStr;
                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-12 border ${isSelected ? 'border-primary dark:border-gray-400 bg-black/5 dark:bg-white/10' : 'border-border-subtle dark:border-gray-800/50'} ${hasActivity ? 'text-primary dark:text-gray-100 font-bold' : 'text-warm-grey dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'} flex flex-col items-center justify-center rounded-sm transition-colors relative`}
                  >
                    <span>{day}</span>
                    {hasActivity && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary dark:bg-gray-400"></div>}
                  </button>
                );
              })}
            </div>
        </div>

        <div className="p-6 border border-border-subtle dark:border-gray-800 bg-white/50 dark:bg-[#111] flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-gray-100 mb-6 flex items-center gap-2">
             <CalendarDays className="w-4 h-4" /> Log: {selectedDateStr}
          </h2>
          {(!user.user_data?.studyLog || !user.user_data.studyLog[selectedDateStr || '']) ? (
            <div className="text-sm text-warm-grey dark:text-gray-500 flex-1 flex items-center justify-center border border-dashed border-border-subtle dark:border-gray-800 rounded-sm">
              No activity recorded.
            </div>
          ) : (
             <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between border-b border-border-subtle dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3 text-warm-grey dark:text-gray-400">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-600 dark:text-green-400"><Timer className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">Pomodoro</span>
                  </div>
                  <span className="font-display text-xl text-primary dark:text-gray-100">
                    {user.user_data.studyLog[selectedDateStr!].minutes || 0}m
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border-subtle dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3 text-warm-grey dark:text-gray-400">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"><BookOpen className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">Words Learned</span>
                  </div>
                  <span className="font-display text-xl text-primary dark:text-gray-100">
                    {user.user_data.studyLog[selectedDateStr!].words || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border-subtle dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3 text-warm-grey dark:text-gray-400">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-orange-600 dark:text-orange-400"><Trophy className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">Arena Plays</span>
                  </div>
                  <span className="font-display text-xl text-primary dark:text-gray-100">
                    {user.user_data.studyLog[selectedDateStr!].arenaPlays || 0}
                  </span>
                </div>
             </div>
          )}
        </div>
      </div>


      {/* Resources Links - similar to old layout */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-primary dark:text-gray-100 border-b border-border-subtle dark:border-gray-800 pb-4">External Resources Library</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8">
          {resources.map((section, idx) => (
            <div key={idx} className="space-y-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-gray-200">
                  {section.category}
                </h2>
                <p className="text-sm text-warm-grey dark:text-gray-500 mt-1">
                  {section.description}
                </p>
              </div>
              <ul className="space-y-0">
                {section.items.map((item, i) => {
                  const isInternal = item.url.startsWith("/");
                  return (
                    <li key={i} className="border-b border-border-subtle/50 dark:border-gray-800/80 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                      {isInternal ? (
                        <Link to={item.url} className="w-full flex items-center justify-between py-3 group">
                          <span className="text-sm text-primary dark:text-gray-300 font-medium group-hover:text-accent dark:group-hover:text-white transition-colors">{item.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500">{item.type}</span>
                            <ArrowRight className="w-4 h-4 text-border-subtle dark:text-gray-700 group-hover:text-accent dark:group-hover:text-white transition-colors" />
                          </div>
                        </Link>
                      ) : (
                        <a href={item.url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between py-3 group">
                          <span className="text-sm text-primary dark:text-gray-300 font-medium group-hover:text-accent dark:group-hover:text-white transition-colors">{item.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500">{item.type}</span>
                            <ArrowRight className="w-4 h-4 text-border-subtle dark:text-gray-700 group-hover:text-accent dark:group-hover:text-white transition-colors" />
                          </div>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
