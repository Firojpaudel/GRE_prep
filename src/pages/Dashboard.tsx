import { ArrowRight, BookOpen, Clock, Activity } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function Dashboard() {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-fade-up">
        <div className="lg:col-span-8 space-y-6">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
            Curated Curriculum
          </p>
          <h1 className="text-5xl md:text-7xl leading-[1.1] text-primary dark:text-gray-100">
            Mastery requires<br />
            <span className="italic text-accent dark:text-[#CBB599]">precision</span> and <span className="italic text-accent dark:text-[#CBB599]">restraint</span>.
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pb-3">
          <p className="text-sm text-primary dark:text-gray-300 leading-relaxed max-w-sm">
            An exhaustive compilation of the most powerful legally-free resources available. 
            We organize premium mocked exams, official frameworks, and advanced reading materials so you can maintain absolute focus.
          </p>
        </div>
      </section>

      {/* Daily Metrics / Routine */}
      <section className="animate-fade-up delay-150">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-sm font-bold tracking-[0.1em] uppercase text-warm-grey dark:text-gray-500 flex items-center gap-3">
            <Activity className="w-4 h-4" /> Recommended Daily Protocol
          </h2>
          <Link to="/planners" className="text-xs font-bold text-accent dark:text-[#CBB599] hover-underline">
            VIEW FULL PLANNERS →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: "Lexicon Acquisition", desc: "Review 30 new words. Test yourself in the Assessment Arena. Time: 45 min." },
            { icon: Activity, title: "Quantitative Drills", desc: "Complete 20 mixed quant problems under strict timing. Avoid mental fatigue. Time: 35 min." },
            { icon: Clock, title: "Active Reading", desc: "Analyze two dense articles from Arts & Letters Daily for structure, not content. Time: 40 min." }
          ].map((card, i) => (
            <div key={i} className="bg-black/[0.015] dark:bg-white/[0.02] border border-border-subtle dark:border-gray-800 p-6 hover:border-primary dark:hover:border-gray-500 transition-colors duration-300">
              <card.icon className="w-5 h-5 text-accent dark:text-[#CBB599] mb-4" strokeWidth={1.5} />
              <h3 className="text-base text-primary dark:text-gray-200 font-display font-medium mb-2">{card.title}</h3>
              <p className="text-xs text-warm-grey dark:text-gray-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-t border-border-subtle dark:border-gray-800" />

      {/* Structured Resource List */}
      <section className="animate-fade-up delay-200">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <h2 className="text-3xl text-primary dark:text-gray-100">The Archives</h2>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-warm-grey dark:text-gray-400 block mt-4 md:mt-0">
            Open-Source & Free Tier Materials
          </span>
        </div>

        <div className="space-y-0">
          {resources.map((section, idx) => (
            <div key={idx} className="border-t border-border-subtle dark:border-gray-800 py-12 flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3 space-y-2 pr-8">
                <h3 className="text-xl text-primary dark:text-gray-200">{section.category}</h3>
                <p className="text-xs text-warm-grey dark:text-gray-400 max-w-[250px] leading-relaxed">
                  {section.description}
                </p>
              </div>
              
              <div className="lg:w-2/3 flex flex-col">
                {section.items.map((item, itemIdx) => (
                  item.type === "Internal" ? (
                    <Link
                      key={itemIdx}
                      to={item.url}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-border-subtle/50 dark:border-gray-800/50 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-700 px-4 -mx-4"
                    >
                      <span className="text-base text-primary dark:text-gray-300 group-hover:text-accent dark:group-hover:text-[#CBB599] transition-colors duration-500">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-6 mt-2 sm:mt-0">
                        <span className="text-[10px] uppercase tracking-widest text-accent dark:text-[#CBB599]">
                          {item.type}
                        </span>
                        <ArrowRight className="w-4 h-4 text-accent dark:text-[#CBB599] transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1} />
                      </div>
                    </Link>
                  ) : (
                    <a
                      key={itemIdx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-border-subtle/50 dark:border-gray-800/50 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-700 px-4 -mx-4"
                    >
                      <span className="text-base text-primary dark:text-gray-300 group-hover:text-accent dark:group-hover:text-[#CBB599] transition-colors duration-500">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-6 mt-2 sm:mt-0">
                        <span className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-500">
                          {item.type}
                        </span>
                        <ArrowRight className="w-4 h-4 text-warm-grey dark:text-gray-500 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1} />
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
