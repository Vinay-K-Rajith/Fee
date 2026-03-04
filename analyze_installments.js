import XLSX from 'xlsx';
import * as fs from 'fs';

const feeBuffer = fs.readFileSync('FeeCollection.xlsx');
const feeWorkbook = XLSX.read(feeBuffer);
const feeSheet = feeWorkbook.Sheets['Sheet1'];
const feeRawData = XLSX.utils.sheet_to_json(feeSheet, { header: 1 });

function getInstallmentCount(name) {
    if (!name) return 0;
    const match = name.match(/Installment (\d+)/g);
    if (match) {
        let max = 1;
        match.forEach(m => {
            const num = parseInt(m.replace('Installment ', ''));
            if (num > max) max = num;
        });
        return max;
    }
    if (name.includes('One Time')) return 1;
    return 1;
}

const map = new Map();
feeRawData.slice(2).forEach(row => {
    const installmentName = row[4] || '';
    const val = getInstallmentCount(installmentName);
    map.set(installmentName, val);
});

fs.writeFileSync('analyze.json', JSON.stringify(Array.from(map.entries()), null, 2), 'utf-8');
