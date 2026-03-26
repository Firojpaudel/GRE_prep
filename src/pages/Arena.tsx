import { useState, useEffect, useCallback } from "react";
import { vocab3k, vocab7k } from "../data/mockVocab";
import { Trophy, Flame, Check, X, BookOpen, Globe, BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthView from "../components/AuthView";

interface Question {
  word: string;
  options: string[];
  correctAnswer: string;
}

export default function Arena() {
  const { user, token, logout, updateUserStats } = useAuth();

  const [score, setScore] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [testMode, setTestMode] = useState<"all" | "learned">("all");
  const [history, setHistory] = useState<{word: string; guess: string; correct: string; isCorrect: boolean}[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const learnedCount = user?.user_data?.learnedWords?.length || 0;

  // Set default mode on init
  useEffect(() => {
     if (learnedCount >= 4 && testMode !== "learned" && !currentQuestion) {
         setTestMode("learned");
     }
  }, [learnedCount, testMode, currentQuestion]);

  // Generate a random question
  const generateQuestion = useCallback((mode = testMode) => {
    let wordList = [...vocab3k, ...vocab7k];
    
    if (mode === "learned") {
      const learnedIds = new Set<number>(user?.user_data?.learnedWords || []);
      const learnedWords = wordList.filter(v => learnedIds.has(v.id));
      if (learnedWords.length >= 4) {
        wordList = learnedWords;
      } else {
        setTestMode("all");
      }
    }

    if (wordList.length < 4) return;

    const correctIdx = Math.floor(Math.random() * wordList.length);
    const correctWord = wordList[correctIdx];

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
  }, [testMode, user?.user_data?.learnedWords]);

  useEffect(() => {
    if (user) {
        generateQuestion();
    }
  }, [generateQuestion, user]);

  const handleAnswer = async (opt: string) => {
    if (selectedOption) return;
    setSelectedOption(opt);

    const isCorrect = opt === currentQuestion?.correctAnswer;
    
    setHistory(prev => [...prev, {
       word: currentQuestion!.word,
       guess: opt,
       correct: currentQuestion!.correctAnswer,
       isCorrect
    }]);

    let newScore = score;
    let newStreak = streak;

    if (isCorrect) {
      newScore = score + 10 * (streak + 1);
      newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
    } else {
      newStreak = 0;
      setStreak(0);
    }

    if (user && token && isCorrect) {
        if (newScore > (user.high_score || 0) || newStreak > (user.longest_streak || 0)) {
            const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
            const endpoint = '/api/game/score';
            const requestUrl = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}${endpoint}` : endpoint;
            
            fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score: newScore, streak: newStreak })
            })
            .then(r => r.json())
            .then(data => {
                if (data.user) {
                    updateUserStats(data.user);
                }
            })
            .catch(() => {});
        }
    }

    // Delay before fading out lets you read the card result
    setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        generateQuestion();
        setIsAnimating(false);
      }, 300);
    }, 2500);
  };

  if (!user) {
    return <AuthView message="Join the Arena to test your limits" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in pb-16">
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-border-subtle dark:border-gray-800 bg-white dark:bg-[#111] p-6 shadow-2xl">
            <h3 className="text-lg font-display text-primary dark:text-gray-100">Learn More Words First</h3>
            <p className="mt-2 text-sm text-warm-grey dark:text-gray-400 leading-relaxed">
              You need at least 4 learned words in Vocab before you can use Learned mode in Arena.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-primary dark:border-white text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white dark:bg-[#111] border border-border-subtle dark:border-gray-800 p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl rounded-sm">
            <button onClick={() => setShowAnalytics(false)} className="absolute top-6 right-6 text-warm-grey hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-display text-primary dark:text-gray-100 mb-6 flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-accent dark:text-[#CBB599]" /> Session Performance
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-secondary dark:bg-white/[0.02] p-4 rounded-sm border border-border-subtle dark:border-gray-800">
                <p className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1">Attempted</p>
                <p className="text-2xl font-display text-primary dark:text-gray-100">{history.length}</p>
              </div>
              <div className="bg-secondary dark:bg-white/[0.02] p-4 rounded-sm border border-border-subtle dark:border-gray-800">
                <p className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1">Accuracy</p>
                <p className="text-2xl font-display text-primary dark:text-gray-100">{history.length ? Math.round((history.filter(h => h.isCorrect).length / history.length) * 100) : 0}%</p>
              </div>
              <div className="bg-secondary dark:bg-white/[0.02] p-4 rounded-sm border border-border-subtle dark:border-gray-800">
                <p className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1">Current Score</p>
                <p className="text-2xl font-display text-primary dark:text-gray-100">{score}</p>
              </div>
              <div className="bg-secondary dark:bg-white/[0.02] p-4 rounded-sm border border-border-subtle dark:border-gray-800">
                <p className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500 mb-1">Max Streak</p>
                <p className="text-2xl font-display text-primary dark:text-gray-100">{Math.max(streak, user?.longest_streak || 0)}</p>
              </div>
            </div>

            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary dark:text-gray-200 mb-4 border-b border-border-subtle dark:border-gray-800 pb-2">Recent Encounters</h3>
            {history.length === 0 ? (
              <p className="text-sm text-warm-grey dark:text-gray-500 italic py-4 text-center">No challenges faced yet. Step into the arena.</p>
            ) : (
              <div className="space-y-3">
                {[...history].reverse().map((h, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary dark:bg-white/[0.015] border border-border-subtle/50 dark:border-gray-800 gap-3 group hover:border-primary dark:hover:border-white transition-colors">
                    <div className="flex items-center gap-3">
                      {h.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />}
                      <span className="font-display text-xl text-primary dark:text-gray-100">{h.word}</span>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm">
                      <span className="text-warm-grey dark:text-gray-400">Guessed: <span className={h.isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 line-through"}>{h.guess.substring(0, 30)}{h.guess.length > 30 ? "..." : ""}</span></span>
                      {!h.isCorrect && <span className="text-green-600 dark:text-green-400 mt-1 font-medium">Correct: {h.correct.substring(0, 35)}{h.correct.length > 35 ? "..." : ""}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 bg-white dark:bg-[#111] border border-border-subtle dark:border-gray-800 rounded-sm shadow-sm transition-colors duration-500">
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
          <span>{user.username || "Candidate"}</span>
          <button onClick={logout} className="hover:text-primary dark:hover:text-gray-200 underline underline-offset-4 decoration-border-subtle">
            Log out
          </button>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setTestMode("all");
            generateQuestion("all");
          }}
          className={`flex items-center gap-2 px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-colors ${
            testMode === "all"
              ? "border-primary dark:border-white text-primary dark:text-white bg-black/5 dark:bg-white/10"
              : "border-border-subtle dark:border-gray-700 text-warm-grey dark:text-gray-500 hover:border-primary dark:hover:border-gray-400"
          }`}
        >
          <Globe className="w-4 h-4" /> Global Pool
        </button>
        
        <button
          onClick={() => {
            if (learnedCount >= 4) {
              setTestMode("learned");
              generateQuestion("learned");
            } else {
              setShowErrorModal(true);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-colors ${
            testMode === "learned"
              ? "border-primary dark:border-white text-primary dark:text-white bg-black/5 dark:bg-white/10"
              : "border-border-subtle dark:border-gray-700 text-warm-grey dark:text-gray-500 hover:border-primary dark:hover:border-gray-400"
          } ${learnedCount < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={learnedCount < 4 ? "Learn at least 4 words first" : "Test only on learned words"}
        >
          <BookOpen className="w-4 h-4" /> Learned ({learnedCount})
        </button>
        </div>

        {/* Analytics Toggle */}
        <button
           onClick={() => setShowAnalytics(true)}
           className="flex items-center justify-center gap-2 px-6 py-3 border border-border-subtle dark:border-gray-800 text-warm-grey dark:text-gray-400 hover:text-primary dark:hover:text-gray-100 hover:border-primary dark:hover:border-white transition-colors bg-white dark:bg-[#111] text-[11px] font-bold uppercase tracking-widest group"
        >
          <BarChart2 className="w-4 h-4 group-hover:text-accent transition-colors" /> Session Analytics
        </button>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex flex-col items-center justify-center p-12 bg-secondary dark:bg-[#1A1A1A] border border-border-subtle dark:border-gray-800 rounded-sm relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-accent dark:via-[#CBB599] to-transparent opacity-20"></div>
            
            <span className="text-xs font-bold tracking-widest text-accent dark:text-[#CBB599] uppercase mb-6">Define</span>
            <h2 className="text-5xl font-display text-primary dark:text-gray-100 font-medium tracking-tight mb-10 text-center">
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
