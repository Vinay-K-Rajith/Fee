/**
 * chartUtils.tsx
 * Shared chart utilities — smart tooltip, formatters, and custom labels.
 * Import from here to keep all chart pages consistent.
 */
import React from 'react';
import { formatCurrency } from '@/hooks/use-api';

// Field name patterns that indicate a percentage value
const PCT_FIELDS = ['Rate', 'rate', '%', 'Percent', 'percent', 'Collection Rate', 'Defaulter Rate'];
// Field name patterns that indicate a plain count (not currency)
const COUNT_FIELDS = ['Count', 'count', 'Defaulters', 'defaulters', 'Students', 'students', 'Transactions', 'transactions', 'Trend', 'trend', 'Dropouts', 'dropouts', 'Buckets', 'Re-Admissions', 'Bounces', 'Late Payment', 'late payment', 'Late Fees', 'Payment', 'Cheque'];

export function formatValue(name: string, value: number): string {
  if (PCT_FIELDS.some(f => name.includes(f))) {
    return `${value.toFixed(1)}%`;
  }
  if (COUNT_FIELDS.some(f => name.includes(f))) {
    return Math.round(value).toLocaleString('en-IN');
  }
  return formatCurrency(value);
}

// ─── Compact Value Formatter for Labels ────────────────────────────────────
// Formats large numbers as L (Lakh), Cr (Crore), k (thousands)
export function formatCompactValue(name: string, value: number): string {
  if (!value || value === 0) return '0';
  
  // For percentages, just show % format
  if (PCT_FIELDS.some(f => name.includes(f))) {
    return `${value.toFixed(1)}%`;
  }
  
  // For counts, don't use compact format
  if (COUNT_FIELDS.some(f => name.includes(f))) {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return Math.round(value).toString();
  }
  
  // For currency amounts, use compact format
  const absValue = Math.abs(value);
  
  if (absValue >= 10000000) { // 1 Crore = 10 Million
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }
  if (absValue >= 100000) { // 1 Lakh = 100k
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (absValue >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(value)}`;
}

// ─── Custom Bar Label (Professional Design) ────────────────────────────────────
// Renders formatted values on top of bars with elegant styling
export function CustomBarLabel(props: any) {
  const { x, y, width, height, value, position = 'top', name = '' } = props;
  
  if (!value || value === 0) return null;
  
  const formatted = formatCompactValue(name, value);
  
  // Calculate position: slightly above the bar
  const yPos = position === 'top' ? y - 6 : y + height + 14;
  
  return (
    <text
      x={x + width / 2}
      y={yPos}
      fill="#1E293B"
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
      fontFamily='"Inter", "Segoe UI", sans-serif'
      letterSpacing={0}
    >
      {formatted}
    </text>
  );
}

// ─── Custom Vertical Bar Label (for horizontal bars) ────────────────────────────
// Renders formatted values at the end of horizontal bars
export function CustomBarLabelVertical(props: any) {
  const { x, y, width, height, value, name = '' } = props;
  
  if (!value || value === 0) return null;
  
  const formatted = formatCompactValue(name, value);
  
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#1E293B"
      textAnchor="start"
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
      fontFamily='"Inter", "Segoe UI", sans-serif'
    >
      {formatted}
    </text>
  );
}

// ─── Custom Area Label ────────────────────────────────────────────────────────
// Renders formatted values for area and line charts
export function CustomAreaLabel(props: any) {
  const { x, y, value, name = '' } = props;
  
  if (!value || value === 0) return null;
  
  const formatted = formatCompactValue(name, value);
  
  return (
    <text
      x={x}
      y={y - 10}
      fill="#1E293B"
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      fontFamily='"Inter", "Segoe UI", sans-serif'
    >
      {formatted}
    </text>
  );
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
