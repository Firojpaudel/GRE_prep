import { useState, useMemo } from "react";
import { vocab3k, vocab7k } from "../data/mockVocab";
import { CheckCircle2, Circle, EyeOff, Eye } from "lucide-react";

export default function Vocab() {
  const [activeTab, setActiveTab] = useState<"3k" | "7k">("3k");
  const [searchTerm, setSearchTerm] = useState("");
  const [hideLearned, setHideLearned] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("gre_learned_words");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleLearned = (id: number) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("gre_learned_words", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const currentList = activeTab === "3k" ? vocab3k : vocab7k;

  const filteredVocab = useMemo(() => {
    return currentList.filter((v) => {
      const matchesSearch = v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            v.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const isVisible = !(hideLearned && learnedIds.has(v.id));
      return matchesSearch && isVisible;
    });
  }, [currentList, searchTerm, hideLearned, learnedIds]);

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="flex justify-between items-start">
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
            The Index
          </p>
          <h1 className="text-4xl md:text-6xl text-primary dark:text-gray-100 font-display">
            Vocabulary Archive
          </h1>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border-subtle dark:border-gray-800 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("3k")}
              className={`text-xs font-bold tracking-[0.1em] uppercase pb-2 transition-all duration-300 ease-out ${
                activeTab === "3k" 
                  ? "text-primary dark:text-white border-b-2 border-primary dark:border-white" 
                  : "text-warm-grey dark:text-gray-500 hover:text-primary dark:hover:text-gray-300"
              }`}
            >
              3k Foundation
            </button>
            <button
              onClick={() => setActiveTab("7k")}
              className={`text-xs font-bold tracking-[0.1em] uppercase pb-2 transition-all duration-300 ease-out ${
                activeTab === "7k" 
                  ? "text-primary dark:text-white border-b-2 border-primary dark:border-white" 
                  : "text-warm-grey dark:text-gray-500 hover:text-primary dark:hover:text-gray-300"
              }`}
            >
              7k Advanced
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500">
            <span>Progress: {learnedIds.size} Learned</span>
            <button 
              onClick={() => setHideLearned(!hideLearned)}
              className="flex items-center gap-1.5 hover:text-primary dark:hover:text-gray-300 transition-colors"
            >
              {hideLearned ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {hideLearned ? "Show Learned" : "Hide Learned"}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search lexicons..."
            className="w-full bg-transparent border-b border-border-subtle dark:border-gray-700 pb-2 text-base text-primary dark:text-gray-200 placeholder-warm-grey dark:placeholder-gray-600 focus:outline-none focus:border-primary dark:focus:border-gray-400 transition-colors rounded-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto pb-20">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-border-subtle dark:border-gray-800">
              <th className="py-4 pr-6 text-xs font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 w-[20%]">Term</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 w-[45%]">Definition</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 w-[25%]">Associations</th>
              <th className="py-4 pl-6 text-xs font-bold uppercase tracking-widest text-warm-grey dark:text-gray-500 text-right">Class</th>
            </tr>
          </thead>
          <tbody>
            {filteredVocab.map((word) => {
              const isLearned = learnedIds.has(word.id);
              return (
              <tr 
                key={word.id} 
                className={`border-b border-border-subtle/50 dark:border-gray-800/80 even:bg-black/[0.015] dark:even:bg-white/[0.02] transition-colors duration-200 group animate-fade-up ${isLearned ? 'opacity-50 hover:opacity-100' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'}`}
              >
                <td className="py-5 pr-6 align-top">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleLearned(word.id)}
                      className="mt-1 text-warm-grey dark:text-gray-500 hover:text-green-600 dark:hover:text-green-500 transition-colors"
                      title={isLearned ? "Mark as unlearned" : "Mark as learned"}
                    >
                      {isLearned ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <span className={`font-display font-semibold text-2xl transition-colors duration-300 ${isLearned ? 'text-green-700 dark:text-green-500 line-through decoration-green-500/30' : 'text-primary dark:text-gray-200 group-hover:text-accent dark:group-hover:text-[#CBB599]'}`}>
                      {word.word}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-6 align-top space-y-2">
                  <div className="text-base text-primary dark:text-gray-300 leading-relaxed font-medium">
                    {word.definition}
                  </div>
                  {word.sentence && (
                    <div className="text-sm text-warm-grey dark:text-gray-500 italic leading-relaxed pt-1 border-l-2 border-border-subtle dark:border-gray-700 pl-3 mt-2">
                      {word.sentence}
                    </div>
                  )}
                </td>
                <td className="py-5 px-6 align-top">
                  <div className="text-sm text-warm-grey dark:text-gray-400 leading-relaxed">{word.synonyms || "—"}</div>
                </td>
                <td className="py-5 pl-6 align-top text-right">
                  <span className="text-[11px] uppercase tracking-widest text-warm-grey dark:text-gray-400 bg-border-subtle/30 dark:bg-gray-800 px-2 py-1 rounded-sm">
                    {word.type || "—"}
                  </span>
                </td>
              </tr>
            );
          })}
            {filteredVocab.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center text-warm-grey dark:text-gray-500 text-base italic">
                  No terminology found matching your inquiry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
