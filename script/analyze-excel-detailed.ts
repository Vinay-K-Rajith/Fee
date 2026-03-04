import XLSX from 'xlsx';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and analyze Excel files
const feeCollectionPath = path.join(__dirname, '..', 'FeeCollection.xlsx');
const studentWisePath = path.join(__dirname, '..', 'StudentWisexlsx.xlsx');

console.log('=== Detailed Analysis of FeeCollection.xlsx ===');
const feeBuffer = fs.readFileSync(feeCollectionPath);
const feeWorkbook = XLSX.read(feeBuffer);

const feeSheet = feeWorkbook.Sheets['Sheet1'];
const feeData = XLSX.utils.sheet_to_json(feeSheet, { header: 1 }) as any[][];

// Get merged header (first two rows)
const headerRow1 = feeData[0] || [];
const headerRow2 = feeData[1] || [];

console.log('=== Full Header Analysis ===');
console.log('Row 0 (Main Headers):', JSON.stringify(headerRow1));
console.log('\nRow 1 (Sub Headers):', JSON.stringify(headerRow2));

// Analyze actual data
const dataRows = feeData.slice(2);
console.log('\n=== Data Statistics ===');
console.log('Total Data Rows:', dataRows.length);

// Get unique classes
const classes = new Set<string>();
const occupations = new Set<string>();
const salarySlabs = new Set<string>();
const locations = new Set<string>();
const concessions = new Set<string>();
const installments = new Set<string>();

dataRows.forEach((row) => {
  if (row[3]) classes.add(row[3]); // Class column
  if (row[13]) occupations.add(row[13]); // Occupation
  if (row[14]) salarySlabs.add(row[14]); // Salary Slab
  if (row[15]) locations.add(row[15]); // Location
  if (row[16]) concessions.add(row[16]); // Concession
  if (row[4]) installments.add(row[4]); // Installment
});

console.log('\n=== Unique Values ===');
console.log('Classes:', Array.from(classes));
console.log('Occupations:', Array.from(occupations));
console.log('Salary Slabs:', Array.from(salarySlabs));
console.log('Locations:', Array.from(locations));
console.log('Concession Types:', Array.from(concessions));
console.log('Installments:', Array.from(installments));

// Show more sample rows with all columns
console.log('\n=== Sample Rows (Full Data) ===');
for (let i = 2; i < Math.min(7, feeData.length); i++) {
  console.log(`\nRow ${i}:`, JSON.stringify(feeData[i]));
}

// Check for TC/DropOut students
const tcDropouts = dataRows.filter((row) => row[20] > 0); // Paid(TC/DropOut)
console.log('\n=== TC/DropOut Analysis ===');
console.log('Total TC/Dropout Records:', tcDropouts.length);
if (tcDropouts.length > 0) {
  console.log('Sample TC/Dropout:', tcDropouts.slice(0, 3));
}

// Check for defaulters (Balance > 0)
const defaulters = dataRows.filter((row) => row[23] > 0); // Balance column
console.log('\n=== Defaulter Analysis ===');
console.log('Total Defaulters:', defaulters.length);

// Analyze StudentWise data
console.log('\n\n=== Detailed Analysis of StudentWisexlsx.xlsx ===');
const studentBuffer = fs.readFileSync(studentWisePath);
const studentWorkbook = XLSX.read(studentBuffer);

const studentSheet = studentWorkbook.Sheets['Sheet1'];
const studentData = XLSX.utils.sheet_to_json(studentSheet, { header: 1 }) as any[][];

console.log('=== Student Data Headers ===');
console.log('Headers:', studentData[0]);

const studentRows = studentData.slice(1);
console.log('Total Students:', studentRows.length);

// Check for defaulters in student data
const studentDefaulters = studentRows.filter((row) => row[8] > 0); // Balance Amount
console.log('Students with Balance:', studentDefaulters.length);

// Concession analysis
const studentsWithConcession = studentRows.filter((row) => row[6] > 0); // Con Amount
console.log('Students with Concession:', studentsWithConcession.length);

// Calculate totals
let totalDue = 0, totalConcession = 0, totalPaid = 0, totalBalance = 0;
studentRows.forEach((row) => {
  totalDue += Number(row[5]) || 0;
  totalConcession += Number(row[6]) || 0;
  totalPaid += Number(row[7]) || 0;
  totalBalance += Number(row[8]) || 0;
});

console.log('\n=== Financial Summary ===');
console.log('Total Due:', totalDue);
console.log('Total Concession:', totalConcession);
console.log('Total Paid:', totalPaid);
console.log('Total Balance:', totalBalance);
console.log('Collection Rate:', ((totalPaid / (totalDue - totalConcession)) * 100).toFixed(2) + '%');
