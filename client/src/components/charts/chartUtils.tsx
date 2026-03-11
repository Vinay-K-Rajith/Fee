/**
 * chartUtils.tsx
 * Shared chart utilities — smart tooltip, formatters.
 * Import from here to keep all chart pages consistent.
 */
import React from 'react';
import { formatCurrency } from '@/hooks/use-api';

// Field name patterns that indicate a percentage value
const PCT_FIELDS = ['Rate', 'rate', '%', 'Percent', 'percent', 'Collection Rate', 'Defaulter Rate'];
// Field name patterns that indicate a plain count
const COUNT_FIELDS = ['Count', 'count', 'Defaulters', 'defaulters', 'Students', 'students', 'Transactions', 'transactions', 'Trend', 'trend', 'Dropouts', 'dropouts', 'Buckets', 'Re-Admissions', 'Bounces'];

function formatValue(name: string, value: number): string {
  if (PCT_FIELDS.some(f => name.includes(f))) {
    return `${value.toFixed(1)}%`;
  }
  if (COUNT_FIELDS.some(f => name.includes(f))) {
    return Math.round(value).toLocaleString('en-IN');
  }
  return formatCurrency(value);
}

// ─── Light Tooltip ────────────────────────────────────────────────────────────
// White background, slate text — easy to read against any chart background.
export function SmartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        padding: '10px 14px',
        minWidth: 190,
        fontFamily: '"Inter", "Segoe UI", sans-serif',
      }}
    >
      <p
        style={{
          color: '#64748B',
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div
          key={i}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}
        >
          <span style={{ color: '#64748B', fontSize: 12 }}>{p.name}</span>
          <span style={{ color: p.color || '#1E293B', fontSize: 12, fontWeight: 600 }}>
            {typeof p.value === 'number' ? formatValue(p.name, p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
