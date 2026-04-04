import XLSX from 'xlsx';
import * as fs from 'fs';

const path2025 = 'StudentCollection25.xlsx';
const buffer2025 = fs.readFileSync(path2025);
const workbook2025 = XLSX.read(buffer2025);
const sheet2025 = workbook2025.Sheets['2025-26'];
const rawData2025 = XLSX.utils.sheet_to_json(sheet2025, { defval: 0 });

const getStatusKey = (data: any[]) => {
  if (!data || data.length === 0) return '__EMPTY_25';
  const headerMap = data[0];
  const key = Object.keys(headerMap).find(k => 
    String(headerMap[k]).trim().toLowerCase() === 'current status'
  );
  return key || '__EMPTY_25';
};

const statusKey25 = getStatusKey(rawData2025);
console.log("Status Key 25:", statusKey25);
console.log("Header Map Val:", rawData2025[0][statusKey25]);

const rows = rawData2025.slice(1);
const sampled = rows.filter(r => r[statusKey25] === 'TC' || r[statusKey25] === 'Dropout').slice(0, 3);
console.log("Count with actual status matching 'TC' or 'Dropout':", rows.filter(r => r[statusKey25] === 'TC' || r[statusKey25] === 'Dropout').length);

const c = rows.map((row: any) => {
    let currentStatusRaw = row[statusKey25];
    let currentStatus = (!currentStatusRaw || String(currentStatusRaw).trim() === '' || currentStatusRaw === 0 || currentStatusRaw === '0') ? 'Active' : String(currentStatusRaw).trim();
    return {
        admNo: row['__EMPTY_1'],
        currentStatus,
        defaulterTotal: row['__EMPTY_24'] || 0,
        totalStructuredAmount: row['__EMPTY_6'] || 0,
        totalPaid: row['__EMPTY_20'] || 0,
        totalConcession: row['__EMPTY_22'] || 0
    };
});

console.log("Mapped Dropouts/TC:", c.filter(x => x.currentStatus === 'TC' || x.currentStatus === 'Dropout').length);

// Let's compute loss exactly identical to LossAnalysis logic
const studentsMap = new Map();
c.forEach(r => {
    const s = studentsMap.get(r.admNo) || { admNo: r.admNo, currentStatus: 'Active' };
    if (r.currentStatus !== 'Active') s.currentStatus = r.currentStatus;
    studentsMap.set(r.admNo, s);
});

console.log("Unique Students with TC/Dropout:", Array.from(studentsMap.values()).filter(x => x.currentStatus === 'TC' || x.currentStatus === 'Dropout').length);

let lossByDropout = 0;
let lossByTC = 0;

Array.from(studentsMap.values()).forEach(student => {
    const status = student.currentStatus;
    if (status === 'TC' || status === 'Dropout') {
        const str = c.filter(x => x.admNo === student.admNo);
        str.forEach(r => {
           let unpaid = r.defaulterTotal;
           if (unpaid <= 0) unpaid = Math.max(0, r.totalStructuredAmount - r.totalConcession - r.totalPaid);

           if (unpaid > 0) {
              if (status === 'TC') lossByTC += unpaid;
              else lossByDropout += unpaid;
           }
        });
    }
});

console.log("Loss By TC:", lossByTC);
console.log("Loss By Dropout:", lossByDropout);

