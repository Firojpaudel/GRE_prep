import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Sparkles,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  FileText,
  Archive,
} from "lucide-react";

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

const hotKeywords = [
  "manhattan",
  "barrons",
  "official",
  "gre",
  "awa",
  "issue",
  "book",
  "prep",
];
const softwareKeywords = [
  "software",
  "setup",
  "installer",
  "exe",
  "msi",
  "dmg",
  "apk",
  "zip",
  "rar",
  "7z",
];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getBadge(item: AssetItem): "NEW" | "HOT" | null {
  const path = item.relativePath.toLowerCase();

  if (
    item.extension === ".webm" ||
    path.includes("software") ||
    softwareKeywords.some((k) => path.includes(k))
  ) {
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
        const res = await fetch("/assets.json");

        // Handle non-JSON responses (like Vite falling back to index.html when API is down)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            "API is not available. Please ensure the backend server is running.",
          );
        }

        if (!res.ok) {
          throw new Error("Could not load resources.");
        }

        const data = await res.json();
        const assetList = data.assets || [];
        setAssets(assetList);
        // Auto-select first previewable
        const firstPreviewable = assetList.find(
          (a: AssetItem) => a.previewable,
        );
        if (firstPreviewable) {
          setSelected(firstPreviewable);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resources",
        );
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
      const byCategory =
        activeCategory === "All" ||
        getCategory(item.relativePath) === activeCategory;
      const value = `${item.name} ${item.relativePath}`.toLowerCase();
      const byQuery = value.includes(query.toLowerCase());
      return byCategory && byQuery;
    });
  }, [assets, activeCategory, query]);

  const featured = useMemo(
    () =>
      filtered.filter((i) => i.isVideo || i.isImage || i.isPdf).slice(0, 16),
    [filtered],
  );

  return (
    <div className="space-y-10 animate-fade-up pb-16">
      <header className="space-y-4">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-grey dark:text-gray-400">
          Premium Archive
        </p>
        <h1 className="text-4xl md:text-6xl text-primary dark:text-gray-100 font-display">
          Paid Resources Vault
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 mb-4">
          <p className="max-w-3xl text-sm md:text-base text-warm-grey dark:text-gray-300 leading-relaxed">
            Curated paid GRE resources worth studying: books, essay packs,
            software bundles, and media lessons. Files marked
            <span className="mx-2 inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-300">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
            or
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300">
              <Flame className="w-3 h-3" />
              HOT
            </span>
            &nbsp; are highlighted for quick picks.
          </p>
          <a
            href="https://drive.google.com/drive/folders/1T72zlkE86g0movi0rQh-3WmNilYXDYKH?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 whitespace-nowrap border border-border-subtle dark:border-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-gray-200 hover:border-primary dark:hover:border-gray-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Drive
          </a>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="border border-border-subtle dark:border-gray-800 p-4 md:p-5 bg-white/40 dark:bg-white/[0.02]">
          <label className="text-[11px] font-bold tracking-[0.12em] uppercase text-warm-grey dark:text-gray-400">
            Search Resources
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name or folder"
            className="mt-2 w-full bg-transparent border border-border-subtle dark:border-gray-700 px-3 py-2 text-sm text-primary dark:text-gray-200 placeholder-warm-grey dark:placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="border border-border-subtle dark:border-gray-800 p-4 md:p-5 bg-white/40 dark:bg-white/[0.02]">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-warm-grey dark:text-gray-400">
            Total Files
          </div>
          <div className="mt-2 text-3xl font-display text-primary dark:text-white">
            {assets.length}
          </div>
          <div className="text-xs text-warm-grey dark:text-gray-400 mt-1">
            All content listed with download access
          </div>
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

      {loading && (
        <p className="text-sm text-warm-grey dark:text-gray-400">
          Loading resources...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && (
        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
          <div className="border border-border-subtle dark:border-gray-800 overflow-hidden flex flex-col h-full max-h-[66vh]">
            <div className="px-4 py-3 border-b border-border-subtle dark:border-gray-800 text-xs uppercase tracking-[0.12em] text-warm-grey dark:text-gray-400 shrink-0">
              Resource List ({filtered.length})
            </div>
            <div className="overflow-y-auto scrollbar-smooth flex-1 pb-2">
              {filtered.map((item) => {
                const badge = getBadge(item);
                return (
                  <div
                    key={item.relativePath}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 px-4 py-3 border-b border-border-subtle/70 dark:border-gray-800/80 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <button
                      onClick={() => setSelected(item)}
                      className="text-left space-y-1"
                    >
                      <div className="flex items-center gap-2 text-primary dark:text-gray-100 text-sm">
                        {getIcon(item)}
                        <span className="break-all">{item.name}</span>
                        {badge === "NEW" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-300">
                            <Sparkles className="w-3 h-3" />
                            NEW
                          </span>
                        )}
                        {badge === "HOT" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300">
                            <Flame className="w-3 h-3" />
                            HOT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-warm-grey dark:text-gray-500 break-all">
                        {item.relativePath}
                      </div>
                      <div className="text-[11px] text-warm-grey dark:text-gray-400">
                        {formatBytes(item.sizeBytes)}
                      </div>
                    </button>

                    <div className="flex md:flex-col gap-2 md:items-end justify-center shrink-0">
                      <a
                        href={item.directUrl}
                        download
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-3 py-1.5 text-primary dark:text-gray-200 hover:border-primary dark:hover:border-gray-400 whitespace-nowrap"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                      <a
                        href={item.directUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-3 py-1.5 text-warm-grey dark:text-gray-300 hover:text-primary dark:hover:text-white whitespace-nowrap"
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
            <div className="text-xs uppercase tracking-[0.12em] text-warm-grey dark:text-gray-400 mb-3">
              Preview Panel
            </div>
            {!selected && (
              <div className="text-sm text-warm-grey dark:text-gray-400 leading-relaxed">
                Select a file to preview it here. Videos like .webm play
                directly in-browser.
              </div>
            )}

            {selected && (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-primary dark:text-gray-100 break-all font-medium">
                    {selected.name}
                  </div>
                  <div className="text-xs text-warm-grey dark:text-gray-500 break-all mt-1">
                    {selected.relativePath}
                  </div>
                  <div className="text-xs text-warm-grey dark:text-gray-500 mt-1">
                    {formatBytes(selected.sizeBytes)}
                  </div>
                </div>

                <div className="bg-black/5 dark:bg-white/5 border border-border-subtle dark:border-gray-700 rounded overflow-hidden">
                  {selected.isVideo && (
                    <div className="w-full bg-black/80">
                      <video
                        controls
                        preload="metadata"
                        className="w-full max-h-[320px] bg-black"
                      >
                        <source
                          src={selected.directUrl}
                          type={`video/${selected.extension.slice(1)}`}
                        />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {selected.isImage && (
                    <div className="w-full flex items-center justify-center bg-black/5 dark:bg-black/40 min-h-[200px]">
                      <img
                        src={selected.directUrl}
                        alt={selected.name}
                        className="max-w-full max-h-[320px] object-contain p-2"
                      />
                    </div>
                  )}

                  {selected.isPdf && (
                    <div className="w-full bg-black/40">
                      <iframe
                        src={`${selected.directUrl}#page=1`}
                        className="w-full h-[320px]"
                        title={selected.name}
                      />
                    </div>
                  )}

                  {!selected.isVideo &&
                    !selected.isImage &&
                    !selected.isPdf && (
                      <div className="p-4 text-xs text-warm-grey dark:text-gray-400 leading-relaxed text-center min-h-[200px] flex items-center justify-center">
                        <div>
                          <div className="mb-2">{getIcon(selected)}</div>
                          <p>
                            Preview not available
                            <br />
                            for {selected.extension}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={selected.directUrl}
                    download
                    className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-2 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                  <a
                    href={selected.isPdf ? `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(selected.directUrl)}` : selected.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] uppercase tracking-widest border border-border-subtle dark:border-gray-700 px-2 py-2 text-warm-grey dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> {selected.isPdf ? "Stream PDF" : "Open"}
                  </a>
                </div>
              </div>
            )}

            {featured.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border-subtle dark:border-gray-800">
                <div className="text-[11px] uppercase tracking-widest text-warm-grey dark:text-gray-400 mb-3">
                  Quick Access
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto scrollbar-smooth">
                  {featured.map((item) => {
                    const isSelected =
                      selected?.relativePath === item.relativePath;
                    return (
                      <button
                        key={item.relativePath}
                        onClick={() => setSelected(item)}
                        className={`text-left p-2.5 border transition-all duration-200 ${
                          isSelected
                            ? "border-accent dark:border-[#CBB599] bg-accent/5 dark:bg-[#CBB599]/10"
                            : "border-border-subtle dark:border-gray-700 hover:border-warm-grey dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          {getIcon(item)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-primary dark:text-gray-200 break-words line-clamp-2 font-medium">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-warm-grey dark:text-gray-500 mt-1">
                              {item.extension.slice(1).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
