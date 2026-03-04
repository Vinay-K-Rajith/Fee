import XLSX from 'xlsx';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and analyze Excel files
const feeCollectionPath = path.join(__dirname, '..', 'FeeCollection.xlsx');
const studentWisePath = path.join(__dirname, '..', 'StudentWisexlsx.xlsx');

console.log('=== Analyzing FeeCollection.xlsx ===');
const feeBuffer = fs.readFileSync(feeCollectionPath);
const feeWorkbook = XLSX.read(feeBuffer);
console.log('Sheet Names:', feeWorkbook.SheetNames);

feeWorkbook.SheetNames.forEach((sheetName) => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = feeWorkbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Total Rows:', data.length);
  if (data.length > 0) {
    console.log('Headers:', data[0]);
    console.log('Sample Data (first 3 rows):');
    data.slice(1, 4).forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`, row);
    });
  }
});

console.log('\n\n=== Analyzing StudentWisexlsx.xlsx ===');
const studentBuffer = fs.readFileSync(studentWisePath);
const studentWorkbook = XLSX.read(studentBuffer);
console.log('Sheet Names:', studentWorkbook.SheetNames);

studentWorkbook.SheetNames.forEach((sheetName) => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = studentWorkbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Total Rows:', data.length);
  if (data.length > 0) {
    console.log('Headers:', data[0]);
    console.log('Sample Data (first 3 rows):');
    data.slice(1, 4).forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`, row);
    });
  }
});
