import XLSX from 'xlsx';
import * as fs from 'node:fs';

// Analyze all data files
const files = [
  'StudentCollection23.xlsx',
  'StudentCollection24.xlsx',
  'StudentCollection25.xlsx',
  'StudentWisexlsx.xlsx'
];

files.forEach((filename) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYZING: ${filename}`);
  console.log('='.repeat(80));
  
  const buffer = fs.readFileSync(filename);
  const workbook = XLSX.read(buffer);
  
  console.log(`\nSheet Names: ${workbook.SheetNames.join(', ')}\n`);
  
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n--- Sheet: "${sheetName}" ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
    
    console.log(`Total Rows: ${data.length}`);
    
    if (data.length > 0) {
      const headers = data[0];
      console.log(`\nColumn Count: ${headers.length}`);
      console.log(`\nHeaders:`);
      headers.forEach((h: any, i: number) => {
        console.log(`  ${i + 1}. ${h}`);
      });
      
      // Show first 5 data rows
      console.log(`\nSample Data (first 5 rows):`);
      data.slice(1, 6).forEach((row: any[], idx: number) => {
        console.log(`\nRow ${idx + 1}:`);
        row.forEach((cell: any, colIdx: number) => {
          if (cell !== '' && cell !== null && cell !== undefined) {
            console.log(`  ${headers[colIdx]}: ${cell}`);
          }
        });
      });
      
      // Analyze data types and unique values for key columns
      console.log(`\nData Analysis:`);
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const keys = Object.keys(firstRow);
        
        keys.forEach((key) => {
          const values = jsonData.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '');
          const uniqueValues = [...new Set(values)];
          
          console.log(`\n  Column: "${key}"`);
          console.log(`    - Non-empty values: ${values.length}`);
          console.log(`    - Unique values: ${uniqueValues.length}`);
          
          if (uniqueValues.length < 20 && uniqueValues.length > 0) {
            console.log(`    - Sample values: ${uniqueValues.slice(0, 10).join(', ')}`);
          }
          
          // Check if numeric
          const numericValues = values.filter(v => !isNaN(Number(v)));
          if (numericValues.length > 0) {
            const nums = numericValues.map(v => Number(v));
            console.log(`    - Type: Numeric`);
            console.log(`    - Range: ${Math.min(...nums)} to ${Math.max(...nums)}`);
            console.log(`    - Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(2)}`);
          }
        });
      }
    }
  });
});

console.log(`\n${'='.repeat(80)}`);
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
