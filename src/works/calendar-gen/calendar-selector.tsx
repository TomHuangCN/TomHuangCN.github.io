import React from 'react';
import type { Calendar } from './calendar-gen';

interface CalendarSelectorProps {
  calendars: Calendar[];
  onSelect: (cal: Calendar) => void;
  onDelete: (id: string) => void;
}

export default function CalendarSelector({ calendars, onSelect, onDelete }: CalendarSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {calendars.map((cal, _idx: number) => (
        <div key={cal.id} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', width: 60, height: 80, cursor: 'pointer' }}>
          <img src={cal.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => onSelect(cal)} />
          <button style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onDelete(cal.id); }}>×</button>
        </div>
      ))}
    </div>
  );
} 