export default function About() {
  return (
    <div className="space-y-16 animate-fade-up max-w-3xl">
      <header className="space-y-6">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
          The Manifesto
        </p>
        <h1 className="text-4xl md:text-5xl text-primary dark:text-gray-100 font-display leading-tight">
          Redefining the <br /> GRE Preparatory Experience
        </h1>
      </header>

      <section className="space-y-8 text-primary dark:text-gray-300 text-lg leading-relaxed">
        <p>
          Atelier GRE was born out of a stark realization: the available resources for graduate academic preparation are phenomenally useful, but structurally disjointed.
        </p>
        <p>
          We set out to compile, synthesize, and refine the very best free materials—ranging from the legendary 3,000 and 7,000 word repositories, to ETS practice frameworks, and tactical methods popularized by educators like GregMat. 
        </p>
        <div className="border-l-2 border-border-subtle dark:border-gray-700 pl-6 py-2 my-8 italic text-warm-grey dark:text-gray-400">
          "The pursuit of higher education should not be walled off by poor interfaces, fragmented spreadsheets, and visual clutter."
        </div>
        <p>
          By embracing an editorial philosophy centered on extreme minimalism, high legibility, and architectural typography, Atelier GRE offers a focused, distraction-free environment. 
          The noise is gone. What remains is a pure, unadulterated relationship between you and the material.
        </p>
      </section>
      
      <section className="pt-8 border-t border-border-subtle dark:border-gray-800">
        <h2 className="text-2xl font-display text-primary dark:text-gray-100 mb-6">Attributions & Open Source</h2>
        <ul className="space-y-4 text-warm-grey dark:text-gray-400 text-sm">
          <li>→ Vocabulary lists aggregated from public GregMat & ETS compilation sheets.</li>
          <li>→ Dictionary definitions augmented via FreeDictionary, Datamuse, and Merriam-Webster APIs.</li>
          <li>→ Typography designed using Google Fonts (Playfair Display, DM Sans).</li>
        </ul>
      </section>
    </div>
  );
}
