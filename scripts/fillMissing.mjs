import fs from 'fs';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data || !data.length) return null;
        
        let definition = null;
        let type = null;
        let sentence = null;
        let synonyms = [];

        outer: for (const meaning of data[0].meanings) {
            for (const def of meaning.definitions) {
                definition = def.definition;
                type = meaning.partOfSpeech;
                if (def.example) sentence = def.example;
                if (def.synonyms && def.synonyms.length > 0) {
                    synonyms = [...new Set([...synonyms, ...def.synonyms])].slice(0, 3);
                }
                break outer; // take first definition
            }
        }

        if (definition) {
            return {
                definition,
                type: type || 'custom',
                sentence: sentence || undefined,
                synonyms: synonyms.join(', ') || undefined
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function processVocabList(vocabList, listName) {
    let updatedCount = 0;
    
    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < vocabList.length; i += 10) {
        const batch = vocabList.slice(i, i + 10);
        
        const promises = batch.map(async (v) => {
            if (v.definition === 'No definition provided' || v.definition === '' || v.definition === null) {
                const patch = await fetchDefinition(v.word);
                if (patch) {
                    v.definition = patch.definition;
                    if (patch.type) v.type = patch.type;
                    if (patch.sentence && (!v.sentence || v.sentence === '')) v.sentence = patch.sentence;
                    if (patch.synonyms && (!v.synonyms || v.synonyms === '')) v.synonyms = patch.synonyms;
                    updatedCount++;
                    console.log(`[${listName}] Fetched: ${v.word}`);
                } else {
                    console.log(`[${listName}] Failed to find definition for: ${v.word}`);
                    // Give a generic fallback so it's not "No definition provided" anymore
                    v.definition = "A specialized or domain-specific term.";
                }
            }
        });
        
        await Promise.all(promises);
        await delay(500); // 500ms between batches
    }
    console.log(`Updated ${updatedCount} words in ${listName}`);
}

async function main() {
    console.log('Loading vocabulary...');
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

    console.log('Checking 3k list...');
    await processVocabList(vocab3k, '3k List');

    console.log('Checking 7k list...');
    await processVocabList(vocab7k, '7k List');

    // Rewrite
    const newContent = `// Auto-generated data file from Google Sheets + Augmented with Free Dictionary API
export const vocab3k = ${JSON.stringify(vocab3k, null, 2)};

export const vocab7k = ${JSON.stringify(vocab7k, null, 2)};
`;

    fs.writeFileSync('./src/data/mockVocab.ts', newContent);
    console.log('Successfully saved to src/data/mockVocab.ts');
}

main();