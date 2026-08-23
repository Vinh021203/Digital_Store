'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Code } from 'lucide-react';
import { getTechnologyIconUrl, TECHNOLOGY_OPTIONS } from '@/lib/technologyIcons';

interface TechnologyPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TechnologyPicker({ value, onChange }: TechnologyPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = value && !TECHNOLOGY_OPTIONS.includes(value as typeof TECHNOLOGY_OPTIONS[number])
    ? [value, ...TECHNOLOGY_OPTIONS]
    : TECHNOLOGY_OPTIONS;
  const iconUrl = getTechnologyIconUrl(value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none transition focus:ring-2 focus:ring-orange-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {iconUrl ? <img src={iconUrl} alt="" className="h-5 w-5 object-contain" /> : <Code size={17} className="text-slate-400" />}
        </span>
        <span className={`min-w-0 flex-1 truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>{value || 'Chọn công nghệ'}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="listbox">
          {options.map((technology) => {
            const optionIcon = getTechnologyIconUrl(technology);
            const selected = technology === value;
            return (
              <button
                key={technology}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(technology); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${selected ? 'bg-orange-50 font-bold text-orange-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {optionIcon ? <img src={optionIcon} alt="" className="h-5 w-5 object-contain" /> : <Code size={16} className="text-slate-400" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{technology}</span>
                {selected && <Check size={15} className="shrink-0 text-orange-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
