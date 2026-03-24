import fs from 'fs';
import { parse } from 'csv-parse/sync';

const SHEET_3K_URL = 'https://docs.google.com/spreadsheets/d/1DmLxSaAT6ulHNMaXgrQvlJQCOD8Qb1vCNj5F8cNPhSs/gviz/tq?tqx=out:csv&gid=1229114905';
const SHEET_7K_URL = 'https://docs.google.com/spreadsheets/d/1GjXZMTJKc5O5LK5nB-i8Xrb5EvJwUhatKY5DkIiYMZw/gviz/tq?tqx=out:csv&gid=1229114905';

async function fetchAndParse(url) {
  try {
    const response = await fetch(url);
    const csvData = await response.text();
    
    // Parse the CSV
    const records = parse(csvData, {
      skip_empty_lines: true,
      relax_column_count: true,
    });

    const parsedRecords = [];
    let idCounter = 1;
    
    // Skip the first few rows of headers
    // Looking for the row where 'Word (Link)' starts to determine column indices
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, records.length); i++) {
        if (records[i][0] && records[i][0].includes('Word')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.error("Could not find headers in " + url);
        return [];
    }

    const headers = records[headerRowIndex].map(h => h.trim());
    
    for (let i = headerRowIndex + 1; i < records.length; i++) {
      const row = records[i];
      if (!row[0] || row[0].trim() === '') continue; // Skip empty words

      // Basic mapping
      const word = row[0].trim();
      const type = row[2] ? row[2].trim() : '';
      const definition = row[3] ? row[3].trim() : '';
      const sentence = row[4] ? row[4].trim() : '';
      const synonyms = row[5] ? row[5].trim() : '';
      
      parsedRecords.push({
        id: idCounter++,
        word,
        type: type || 'custom',
        definition: definition || 'No definition provided',
        sentence: sentence || '',
        synonyms: synonyms || ''
      });
    }

    return parsedRecords;
  } catch (error) {
    console.error('Error fetching/parsing:', url, error);
    return [];
  }
}

async function main() {
  console.log('Fetching 3k words...');
  const vocab3k = await fetchAndParse(SHEET_3K_URL);
  console.log(`Successfully parsed ${vocab3k.length} words for the 3k list.`);

  console.log('Fetching 7k words...');
  const vocab7k = await fetchAndParse(SHEET_7K_URL);
  console.log(`Successfully parsed ${vocab7k.length} words for the 7k list.`);

  // Formatting output
  const content = `// Auto-generated data file from Google Sheets
export const vocab3k = ${JSON.stringify(vocab3k, null, 2)};

export const vocab7k = ${JSON.stringify(vocab7k, null, 2)};
`;

  fs.writeFileSync('./src/data/mockVocab.ts', content);
  console.log('Successfully wrote to src/data/mockVocab.ts');
}

main();
