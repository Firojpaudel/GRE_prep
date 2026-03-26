import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());
const assetsRoot = path.join(projectRoot, 'public', 'assets');

const previewableExtensions = new Set([
    '.webm', '.mp4', '.ogg', '.mov',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.txt', '.md', '.html'
]);

const normalizePath = (relativePath) => relativePath.split(path.sep).join('/');

const collectAssetEntries = (dirPath, currentRelativePath = '') => {
    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith('.'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const files = [];

    for (const entry of entries) {
        const absolutePath = path.join(dirPath, entry.name);
        const relativePath = path.join(currentRelativePath, entry.name);

        if (entry.isDirectory()) {
            files.push(...collectAssetEntries(absolutePath, relativePath));
            continue;
        }

        if (!entry.isFile()) continue;
        
        if (entry.name.toLowerCase() === 'desktop.ini' || entry.name.toLowerCase() === '.ds_store') continue;

        const ext = path.extname(entry.name).toLowerCase();
        const stat = fs.statSync(absolutePath);
        const webPath = normalizePath(relativePath);

        files.push({
            name: entry.name,
            relativePath: webPath,
            extension: ext,
            sizeBytes: stat.size,
            previewable: previewableExtensions.has(ext),
            isVideo: ['.webm', '.mp4', '.ogg', '.mov'].includes(ext),
            isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext),
            isPdf: ext === '.pdf',
            directUrl: `https://cdn.jsdelivr.net/gh/Firojpaudel/GRE_prep@main/public/assets/${encodeURI(webPath)}`
        });
    }

    return files;
};

const assets = collectAssetEntries(assetsRoot);
const outData = { root: 'assets', count: assets.length, assets };
fs.writeFileSync(path.join(projectRoot, 'public', 'assets.json'), JSON.stringify(outData));
console.log(`Generated public/assets.json with ${assets.length} items.`);
