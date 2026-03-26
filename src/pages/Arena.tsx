import { useState, useEffect } from "react";
import { vocab3k } from "../data/mockVocab";
import { Trophy, Flame, ChevronRight, Check, X } from "lucide-react";

interface Question {
  word: string;
  options: string[];
  correctAnswer: string;
}

export default function Arena() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("gre_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Generate a random question
  const generateQuestion = () => {
    const wordList = vocab3k;
    if (wordList.length < 4) return;

    // Pick a correct word
    const correctIdx = Math.floor(Math.random() * wordList.length);
    const correctWord = wordList[correctIdx];

    // Pick 3 random wrong definitions
    const wrongDefs = new Set<string>();
    while (wrongDefs.size < 3) {
      const wrongIdx = Math.floor(Math.random() * wordList.length);
      if (wrongIdx !== correctIdx) {
        wrongDefs.add(wordList[wrongIdx].definition);
      }
    }

    const options = [correctWord.definition, ...Array.from(wrongDefs)].sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({
      word: correctWord.word,
      options,
      correctAnswer: correctWord.definition
    });
    setSelectedOption(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
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
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Authentication failed');
        }
        
        setUser(data.user);
        localStorage.setItem("gre_user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
    } catch (err: any) {
        setAuthError(err.message || "Authentication failed.");
    }
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem("gre_user");
      localStorage.removeItem("token");
      setScore(0);
      setStreak(0);
  };

  const handleAnswer = (opt: string) => {
    if (selectedOption) return;
    setSelectedOption(opt);

    if (opt === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 10 * (streak + 1));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Set animation state and queue next question
    setIsAnimating(true);
    setTimeout(() => {
      setTimeout(() => {
        generateQuestion();
        setIsAnimating(false);
      }, 300);
    }, 1500);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-up">
        <Trophy className="w-16 h-16 text-accent dark:text-[#CBB599] mb-4" strokeWidth={1} />
        <h1 className="text-4xl text-primary dark:text-gray-100 font-display">The Assessment Arena</h1>
        <p className="text-center text-warm-grey dark:text-gray-400 max-w-md leading-relaxed">
          Test your vocabulary retention against dynamic algorithmic questions. Gain streaks, track accuracy, and lock your scores securely into your candidate profile.
        </p>
        
        <div className="mt-8 border border-border-subtle dark:border-gray-700 bg-white dark:bg-[#111] p-8 space-y-6 flex flex-col items-center w-full max-w-sm">
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
                    className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
                />
              )}
              
              <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
              />
              
              <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-700 text-primary dark:text-gray-100 rounded focus:outline-none focus:border-accent dark:focus:border-[#CBB599]"
              />

              {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

              <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-primary dark:bg-gray-100 text-white dark:text-primary font-medium hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                  {isLogin ? "Authenticate" : "Enroll"} <ChevronRight className="w-4 h-4" />
              </button>
          </form>
          
          <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-warm-grey dark:text-gray-500 hover:text-accent dark:hover:text-[#CBB599] transition-colors mt-4"
          >
              {isLogin ? "No profile? Register Instead" : "Already enrolled? Sign In"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
      {/* Header Stats */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-[#111] border border-border-subtle dark:border-gray-800 rounded-sm shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary dark:text-gray-200">
            <Trophy className="w-5 h-5 text-accent dark:text-[#CBB599]" />
            <span className="font-display font-medium text-lg">{score}</span>
            <span className="text-sm text-warm-grey dark:text-gray-500 uppercase tracking-widest ml-1">Score</span>
          </div>
          <div className="w-px h-8 bg-border-subtle dark:bg-gray-800"></div>
          <div className="flex items-center gap-2 text-primary dark:text-gray-200">
            <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-red-500 dark:text-red-400' : 'text-warm-grey dark:text-gray-500'}`} />
            <span className="font-display font-medium text-lg">{streak}</span>
            <span className="text-sm text-warm-grey dark:text-gray-500 uppercase tracking-widest ml-1">Streak</span>
            {streak >= 3 && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded ml-2 animate-pulse">ON FIRE</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-warm-grey dark:text-gray-400">
          <span>{user.username || user.name || "Candidate"}</span>
          <button onClick={handleLogout} className="hover:text-primary dark:hover:text-gray-200 underline underline-offset-4 decoration-border-subtle">
            Log out
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex flex-col items-center justify-center p-12 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-800 rounded-sm relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-accent dark:via-[#CBB599] to-transparent opacity-20"></div>
            
            <span className="text-xs font-bold tracking-widest text-accent dark:text-[#CBB599] uppercase mb-6">Define</span>
            <h2 className="text-5xl font-display text-primary dark:text-gray-100 font-medium tracking-tight mb-10">
              {currentQuestion.word}
            </h2>
            
            <div className="w-full max-w-xl space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQuestion.correctAnswer;
                
                let btnStyle = "bg-white dark:bg-[#222] border-border-subtle dark:border-gray-700 hover:border-black dark:hover:border-gray-400 text-primary dark:text-gray-300";
                let icon = null;

                if (selectedOption) {
                  if (isCorrect) {
                    btnStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 text-green-800 dark:text-green-400";
                    icon = <Check className="w-5 h-5 text-green-500 dark:text-green-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                  } else if (isSelected && !isCorrect) {
                     btnStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 text-red-800 dark:text-red-400";
                     icon = <X className="w-5 h-5 text-red-500 dark:text-red-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                  } else {
                     btnStyle = "opacity-50 grayscale dark:bg-[#111] dark:border-gray-800 dark:text-gray-600";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedOption}
                    className={`relative w-full text-left p-5 border rounded-sm transition-all duration-200 leading-relaxed group ${btnStyle}`}
                  >
                    <span className="inline-block mr-4 text-warm-grey dark:text-gray-600 font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                    {icon}
                  </button>
                );
              })}
            </div>
            
            {/* Feedback Message */}
            <div className="h-8 mt-6 flex items-center justify-center">
               {selectedOption && (
                 <p className={`text-sm font-medium animate-fade-in ${selectedOption === currentQuestion.correctAnswer ? 'text-green-600 dark:text-green-400 font-display text-lg' : 'text-red-600 dark:text-red-400'} tracking-wide`}>
                    {selectedOption === currentQuestion.correctAnswer 
                      ? "Accurate." 
                      : "Incorrect."}
                 </p>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
