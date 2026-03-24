import fs from 'fs';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSynonyms(word) {
    try {
        const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Get up to 3 synonyms
            const syns = data.slice(0, 3).map(w => w.word);
            return syns.join(', ');
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('Loading vocabulary for synonym enrichment...');
    const content = fs.readFileSync('./src/data/mockVocab.ts', 'utf8');
    
    const str3k = content.substring(
        content.indexOf('export const vocab3k = ') + 23, 
        content.indexOf('\nexport const vocab7k =')
    ).trim().replace(/;$/, '');
    
    const str7k = content.substring(
        content.indexOf('export const vocab7k = ') + 23
    ).trim().replace(/;$/, '');

    const vocab3k = JSON.parse(str3k);
    const vocab7k = JSON.parse(str7k);

    let fixedCount = 0;

    async function fixList(list, name) {
        console.log(`Checking ${name}...`);
        for (let i = 0; i < list.length; i++) {
            if (!list[i].synonyms || list[i].synonyms.trim() === '' || list[i].synonyms === '—') {
                const syns = await fetchSynonyms(list[i].word);
                if (syns) {
                    list[i].synonyms = syns;
                    fixedCount++;
                    if (fixedCount % 50 === 0) console.log(`[${name}] Added synonyms for ${fixedCount} words (Latest: ${list[i].word} -> ${syns})`);
                }
                // Datamuse allows up to 100k req/day
                await delay(30); 
            }
        }
    }

    await fixList(vocab3k, '3k List');
    await fixList(vocab7k, '7k List');

    console.log(`Added synonyms for ${fixedCount} words.`);

    const newContent = `// Auto-generated data file from Google Sheets + Augmented with Dictionary APIs
export const vocab3k = ${JSON.stringify(vocab3k, null, 2)};

export const vocab7k = ${JSON.stringify(vocab7k, null, 2)};
`;

    fs.writeFileSync('./src/data/mockVocab.ts', newContent);
    console.log('Saved synonyms to src/data/mockVocab.ts');
}

main();
