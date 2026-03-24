export default function Strategy() {
  const strategies = [
    {
      title: "The Math Strategy: Choose Your Path",
      description: "Quantitative Reasoning conceptually tests middle-school mathematics but masks it with high-level logic masking. Instead of diving into raw algebra, ask yourself: 'Can I plug in numbers? Can I work backward from the answers?'. Never do raw math if a logical shortcut exists.",
      tags: ["Quant", "Logic"]
    },
    {
      title: "Text Completion: The Math Strategy",
      description: "Treat blanks like algebraic variables. Instead of guessing what sounds good, look for the 'support' and the 'pivot'. The support tells you what the blank means; the pivot (but, although, therefore) tells you if the blank is a synonym or an antonym. Predict the word before you ever look at the choices.",
      tags: ["Verbal", "Tactical"]
    },
    {
      title: "Reading Comprehension: Structural Reading",
      description: "Do not read the passage to learn about 18th-century art history or black holes. Read to understand the author's opinions and structure. Identify the main idea, the competing viewpoints, and the tone. You should be able to map the passage—Paragraph 1 introduces a theory, Paragraph 2 refutes it.",
      tags: ["Verbal", "RC"]
    },
    {
      title: "Time Management: The 1-Minute Rule",
      description: "All questions are worth the exact same amount of points. Spending 4 minutes on a brutal combinatorics question just to get it wrong is a double penalty—you lose the time and the points. If you cannot see the path to the solution in 60 seconds, flag it, guess, and move on.",
      tags: ["Global", "Pacing"]
    }
  ];

  return (
    <div className="space-y-16 animate-fade-up">
      <header className="space-y-6 max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
          Tactical Doctrine
        </p>
        <h1 className="text-4xl md:text-5xl text-primary dark:text-gray-100 font-display leading-tight">
          Strategic Principles for Mastery
        </h1>
        <p className="text-lg text-primary dark:text-gray-300 leading-relaxed pt-2">
          Rote memorization is insufficient. The GRE is fundamentally a test of reasoning and pattern recognition. Master the core strategies utilized by the top 1% of scorers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mt-16">
        {strategies.map((strat, idx) => (
          <article 
            key={idx} 
            className="group block border-t-2 border-border-subtle dark:border-gray-800 pt-6 hover:border-primary dark:hover:border-gray-300 transition-colors duration-500"
          >
            <div className="flex gap-3 mb-4">
              {strat.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-widest text-warm-grey dark:text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-2xl font-display text-primary dark:text-gray-100 mb-4 group-hover:text-accent dark:group-hover:text-[#CBB599] transition-colors duration-300">
              {strat.title}
            </h3>
            <p className="text-base text-primary dark:text-gray-300 leading-relaxed opacity-90">
              {strat.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
