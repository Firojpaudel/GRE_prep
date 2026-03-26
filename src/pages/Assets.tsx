import { useEffect, useMemo, useState } from "react";
import { Flame, Sparkles, Download, ExternalLink, Film, Image as ImageIcon, FileText, Archive } from "lucide-react";

type AssetItem = {
  name: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  previewable: boolean;
  isVideo: boolean;
  isImage: boolean;
  isPdf: boolean;
  directUrl: string;
};

const hotKeywords = ["manhattan", "barrons", "official", "gre", "awa", "issue", "book", "prep"];
const softwareKeywords = ["software", "setup", "installer", "exe", "msi", "dmg", "apk", "zip", "rar", "7z"];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getBadge(item: AssetItem): "NEW" | "HOT" | null {
  const path = item.relativePath.toLowerCase();

  if (item.extension === ".webm" || path.includes("software") || softwareKeywords.some((k) => path.includes(k))) {
    return "NEW";
  }

  if (hotKeywords.some((k) => path.includes(k))) {
    return "HOT";
  }

  return null;
}

function getCategory(path: string) {
  const parts = path.split("/");
  return parts[0] || "Misc";
}

function getIcon(item: AssetItem) {
  if (item.isVideo) return <Film className="w-4 h-4" strokeWidth={1.6} />;
  if (item.isImage) return <ImageIcon className="w-4 h-4" strokeWidth={1.6} />;
  if (item.isPdf) return <FileText className="w-4 h-4" strokeWidth={1.6} />;
  return <Archive className="w-4 h-4" strokeWidth={1.6} />;
}

export default function Assets() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selected, setSelected] = useState<AssetItem | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch("/api/assets");
        if (!res.ok) {
          throw new Error("Could not load resources.");
        }
        const data = await res.json();
        setAssets(data.assets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const categories = useMemo(() => {
    const c = new Set<string>();
    assets.forEach((a) => c.add(getCategory(a.relativePath)));
    return ["All", ...Array.from(c).sort((a, b) => a.localeCompare(b))];
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter((item) => {
      const byCategory = activeCategory === "All" || getCategory(item.relativePath) === activeCategory;
      const value = `${item.name} ${item.relativePath}`.toLowerCase();
      const byQuery = value.includes(query.toLowerCase());
      return byCategory && byQuery;
    });
  }, [assets, activeCategory, query]);

  const featured = useMemo(() => filtered.filter((i) => i.isVideo || i.isImage || i.isPdf).slice(0, 16), [filtered]);

  return (
    <div className="space-y-10 animate-fade-up pb-16">
      <header className="space-y-4">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">Premium Archive</p>
        <h1 className="text-4xl md:text-6xl text-primary dark:text-gray-100 font-display">Paid Resources Vault</h1>
        <p className="max-w-3xl text-sm md:text-base text-warm-grey dark:text-gray-300 leading-relaxed">
          Curated paid GRE resources worth studying: books, essay packs, software bundles, and media lessons. Files marked
          <span className="mx-2 inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-300"><Sparkles className="w-3 h-3" />NEW</span>
          or
          <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300"><Flame className="w-3 h-3" />HOT</span>
          are highlighted for quick picks.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="border border-border-subtle dark:border-gray-800 p-4 md:p-5 bg-white/40 dark:bg-white/[0.02]">
          <label className="text-[11px] font-bold tracking-[0.12em] uppercase text-warm-grey dark:text-gray-400">Search Resources</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name or folder"
            className="mt-2 w-full bg-transparent border border-border-subtle dark:border-gray-700 px-3 py-2 text-sm text-primary dark:text-gray-200 placeholder-warm-grey dark:placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="border border-border-subtle dark:border-gray-800 p-4 md:p-5 bg-white/40 dark:bg-white/[0.02]">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-warm-grey dark:text-gray-400">Total Files</div>
          <div className="mt-2 text-3xl font-display text-primary dark:text-white">{assets.length}</div>
          <div className="text-xs text-warm-grey dark:text-gray-400 mt-1">All content listed with download access</div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
              activeCategory === cat
                ? "border-primary dark:border-white text-primary dark:text-white"
                : "border-border-subtle dark:border-gray-700 text-warm-grey dark:text-gray-400 hover:text-primary dark:hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {loading && <p className="text-sm text-warm-grey dark:text-gray-400">Loading resources...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && (
        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
          <div className="border border-border-subtle dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle dark:border-gray-800 text-xs uppercase tracking-[0.12em] text-warm-grey dark:text-gray-400">
              Resource List ({filtered.length})
            </div>
            <div className="max-h-[62vh] overflow-y-auto">
              {filtered.map((item) => {
                const badge = getBadge(item);
                return (
                  <div
                    key={item.relativePath}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 px-4 py-3 border-b border-border-subtle/70 dark:border-gray-800/80 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <button onClick={() => setSelected(item)} className="text-left space-y-1">
                      <div className="flex items-center gap-2 text-primary dark:text-gray-100 text-sm">
                        {getIcon(item)}
                        <span className="break-all">{item.name}</span>
                        {badge === "NEW" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-300"><Sparkles className="w-3 h-3" />NEW</span>
                        )}
                        {badge === "HOT" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300"><Flame className="w-3 h-3" />HOT</span>
                        )}
                      </div>
                      <div className="text-xs text-warm-grey dark:text-gray-500 break-all">{item.relativePath}</div>
                      <div className="text-[11px] text-warm-grey dark:text-gray-400">{formatBytes(item.sizeBytes)}</div>
                    </button>

                    <div className="flex md:flex-col gap-2 md:items-end">
                      <a
                        href={item.directUrl}
                        download
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-1 text-primary dark:text-gray-200 hover:border-primary dark:hover:border-gray-400"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                      <a
                        href={item.directUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-1 text-warm-grey dark:text-gray-300 hover:text-primary dark:hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" /> Open
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-border-subtle dark:border-gray-800 p-4 md:p-5 bg-black/[0.015] dark:bg-white/[0.02]">
            <div className="text-xs uppercase tracking-[0.12em] text-warm-grey dark:text-gray-400 mb-3">Preview Panel</div>
            {!selected && (
              <div className="text-sm text-warm-grey dark:text-gray-400 leading-relaxed">
                Select a file to preview it here. Videos like .webm play directly in-browser.
              </div>
            )}

            {selected && (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-primary dark:text-gray-100 break-all">{selected.name}</div>
                  <div className="text-xs text-warm-grey dark:text-gray-400 break-all">{selected.relativePath}</div>
                </div>

                {selected.isVideo && (
                  <video controls className="w-full max-h-[340px] bg-black rounded">
                    <source src={selected.directUrl} />
                    Your browser does not support video playback.
                  </video>
                )}

                {selected.isImage && (
                  <img src={selected.directUrl} alt={selected.name} className="w-full max-h-[340px] object-contain bg-black/5 dark:bg-white/5" />
                )}

                {selected.isPdf && (
                  <iframe src={selected.directUrl} className="w-full h-[340px] border border-border-subtle dark:border-gray-700" title={selected.name} />
                )}

                {!selected.isVideo && !selected.isImage && !selected.isPdf && (
                  <div className="text-xs text-warm-grey dark:text-gray-400 leading-relaxed">
                    Direct preview unavailable for this file type. Use open or download.
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <a
                    href={selected.directUrl}
                    download
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-1 text-primary dark:text-gray-200"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                  <a
                    href={selected.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-1 text-warm-grey dark:text-gray-300"
                  >
                    <ExternalLink className="w-3 h-3" /> Open
                  </a>
                </div>
              </div>
            )}

            {featured.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border-subtle dark:border-gray-800">
                <div className="text-[11px] uppercase tracking-widest text-warm-grey dark:text-gray-400 mb-2">Featured Previewables</div>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-auto pr-1">
                  {featured.map((item) => (
                    <button
                      key={item.relativePath}
                      onClick={() => setSelected(item)}
                      className="text-left p-2 border border-border-subtle dark:border-gray-700 hover:border-primary dark:hover:border-gray-400"
                    >
                      <div className="text-xs text-primary dark:text-gray-200 break-all line-clamp-2">{item.name}</div>
                      <div className="text-[10px] text-warm-grey dark:text-gray-500 mt-1">{item.extension || "file"}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
