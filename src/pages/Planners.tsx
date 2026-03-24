import { Calendar, Target, Flag } from "lucide-react";

export default function Planners() {
  const plans = [
    {
      duration: "30 Days",
      title: "The Sprint",
      focus: "High-Intensity Triage",
      icon: Target,
      description: "Designed for immediate deadlines. Sacrifices foundational theory for highly targeted pattern recognition and intensive mock exam review.",
      milestones: [
        "Days 1-7: Official POWERPREP Diagnostic & 500 High-Frequency Words.",
        "Days 8-14: Math Conventions & Target Test Prep Quant Free Trial.",
        "Days 15-21: AWA Issue Pool & Pacing Constraints.",
        "Days 22-30: 3 Full Mock Exams. Pure Error Analysis."
      ]
    },
    {
      duration: "60 Days",
      title: "The Standard",
      focus: "Comprehensive Methodology",
      icon: Calendar,
      description: "The optimal timeline for working professionals. Balances deep conceptual learning with vocabulary acquisition and pacing tactics.",
      milestones: [
        "Weeks 1-2: Math Review PDF & 1000 Words.",
        "Weeks 3-4: Untimed GregMat Strategies & Reading Comprehension.",
        "Weeks 5-6: Timed mixed sets & analytical essays.",
        "Weeks 7-8: Alternate day Mock Exams. Final Lexicon review."
      ]
    },
    {
      duration: "90 Days",
      title: "The Absolute",
      focus: "Complete Mastery",
      icon: Flag,
      description: "For those targeting 330+ scores. Allows for complete mastery of the 7k advanced vocabulary and deeply ingrained structural reading.",
      milestones: [
        "Month 1: Pure Foundations. Khan Academy Quant, 3k Vocab.",
        "Month 2: Structural Reading. Daily 'Arts & Letters' parsing. 7k Vocab transition.",
        "Month 3: Endurance Conditioning. 5+ Mock exams. Rapid execution."
      ]
    }
  ];

  return (
    <div className="space-y-24 animate-fade-up">
      <header className="space-y-6 max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
          Chronology
        </p>
        <h1 className="text-4xl md:text-5xl text-primary dark:text-gray-100 font-display leading-tight">
          Systematic Progression
        </h1>
        <p className="text-lg text-primary dark:text-gray-300 leading-relaxed pt-2">
          Haphazard studying yields haphazard results. Select a structured timeline based on your constraints and execute it flawlessly.
        </p>
      </header>

      <div className="space-y-16">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className="flex flex-col lg:flex-row gap-8 lg:gap-16 border-t-2 border-border-subtle dark:border-gray-800 pt-8 group"
          >
            {/* Minimal Left Column */}
            <div className="lg:w-1/4 space-y-4">
              <span className="text-sm font-bold tracking-widest text-accent dark:text-[#CBB599] flex items-center gap-3">
                <plan.icon className="w-4 h-4" /> {plan.duration}
              </span>
              <h2 className="text-3xl font-display text-primary dark:text-gray-100">{plan.title}</h2>
              <span className="inline-block text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-1">
                {plan.focus}
              </span>
            </div>

            {/* Right Content */}
            <div className="lg:w-3/4 space-y-8">
              <p className="text-lg text-primary dark:text-gray-300 leading-relaxed max-w-2xl">
                {plan.description}
              </p>
              
              <div className="space-y-4 border-l pl-6 border-border-subtle dark:border-gray-700">
                {plan.milestones.map((ms, i) => (
                  <div key={i} className="flex gap-4 items-baseline">
                    <span className="text-[10px] text-warm-grey dark:text-gray-500 font-bold">0{i+1}</span>
                    <p className="text-base text-primary dark:text-gray-200">{ms}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
