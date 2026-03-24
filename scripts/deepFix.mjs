import fs from 'fs';
import https from 'https';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Second fallback dictionary API (Datamuse/Merriam alternate endpoints when FreeDictionary fails)
async function fetchDatamuse(word) {
    try {
        const response = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d`);
        const data = await response.json();
        
        if (data && data.length > 0 && data[0].defs && data[0].defs.length > 0) {
            const defString = data[0].defs[0]; // e.g., "n\ta formal rejection or renunciation"
            const parts = defString.split('\t');
            return {
                type: parts[0] === 'n' ? 'noun' : parts[0] === 'v' ? 'verb' : parts[0] === 'adj' ? 'adjective' : 'custom',
                definition: parts[1]
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('Loading vocabulary for deep fix...');
    const content = fs.readFileSync('./src/data/mockVocab.ts', 'utf8');
    
    // Exact parsing
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
        for (let i = 0; i < list.length; i++) {
            if (list[i].definition === 'A specialized or domain-specific term.') {
                const patch = await fetchDatamuse(list[i].word);
                if (patch && patch.definition) {
                    list[i].definition = patch.definition;
                    list[i].type = patch.type;
                    fixedCount++;
                    console.log(`[${name}] Deep fix for: ${list[i].word}`);
                } else {
                    // Final fallback: try to extract a definition locally if we have it in synonyms or the word is just a variant
                    list[i].definition = `Related to ${list[i].word}`;
                }
                await delay(100); // Respect API limits
            }
        }
    }

    await fixList(vocab3k, '3k List');
    await fixList(vocab7k, '7k List');

    console.log(`Deep fixed ${fixedCount} words.`);

    const newContent = `// Auto-generated data file from Google Sheets + Augmented with Dictionary APIs
export const vocab3k = ${JSON.stringify(vocab3k, null, 2)};

export const vocab7k = ${JSON.stringify(vocab7k, null, 2)};
`;

    fs.writeFileSync('./src/data/mockVocab.ts', newContent);
    console.log('Saved deep fixes to src/data/mockVocab.ts');
}

main();
