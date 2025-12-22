import { useState } from 'react';
import { format, subDays, isAfter } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const presets = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
];

export default function DateFilter({ value, onChange, placeholder = 'Select date', className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const handlePresetClick = (preset) => {
    const range = preset.getValue();
    onChange?.(range);
    setSelectedPreset(preset.label);
    setShowRange(false);
  };

  const handleSelectRange = () => {
    setShowRange(true);
    setSelectedPreset(null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange?.(null);
    setSelectedPreset(null);
    setShowRange(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!value?.from) {
      setShowRange(false);
      setSelectedPreset(null);
    }
  };

  const formatDateDisplay = () => {
    if (!value?.from) return placeholder;

    const fromDate = new Date(value.from);
    const toDate = value.to ? new Date(value.to) : fromDate;

    if (format(fromDate, 'yyyy-MM-dd') === format(toDate, 'yyyy-MM-dd')) {
      return format(fromDate, 'MMM d, yyyy');
    }

    if (selectedPreset) return selectedPreset;

    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) handleClose(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start gap-2 font-normal h-9',
            !value?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{formatDateDisplay()}</span>
          {value?.from && (
            <span
              role="button"
              className="ml-auto p-0.5 rounded hover:bg-slate-200 transition-colors"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
            >
              <X className="h-3 w-3 opacity-50 hover:opacity-100" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {showRange ? (
          // Range Selection Mode - Options at top, dual calendars below
          <div>
            <div className="p-2 border-b border-slate-100 flex gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
              <button className="px-2.5 py-1 text-xs rounded-md bg-slate-900 text-white">
                Range
              </button>
            </div>
            <div className="flex">
              <div className="border-r border-slate-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">From</p>
                  <p className="text-sm font-medium text-slate-900">
                    {value?.from ? format(new Date(value.from), 'MMM d, yyyy') : 'Select date'}
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={value?.from}
                  onSelect={(date) => onChange?.({ from: date, to: value?.to })}
                  disabled={(date) => isAfter(date, new Date()) || (value?.to && isAfter(date, new Date(value.to)))}
                  initialFocus
                />
              </div>
              <div>
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">To</p>
                  <p className="text-sm font-medium text-slate-900">
                    {value?.to ? format(new Date(value.to), 'MMM d, yyyy') : 'Select date'}
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={value?.to}
                  onSelect={(date) => {
                    onChange?.({ from: value?.from, to: date });
                    if (value?.from && date) setIsOpen(false);
                  }}
                  disabled={(date) => isAfter(date, new Date()) || (value?.from && isAfter(new Date(value.from), date))}
                />
              </div>
            </div>
          </div>
        ) : (
          // Initial Mode - Calendar on left, Options on right
          <div className="flex">
            {/* Calendar (left) */}
            <div className="border-r border-slate-100">
              <Calendar
                mode="range"
                selected={value}
                onSelect={(range) => {
                  onChange?.(range);
                  setSelectedPreset(null);
                  if (range?.from && range?.to) setIsOpen(false);
                }}
                numberOfMonths={1}
                disabled={(date) => isAfter(date, new Date())}
                initialFocus
              />
            </div>
            {/* Options (right) */}
            <div className="p-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium px-2 mb-1.5">Quick Select</p>
              <div className="space-y-0.5">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors",
                      selectedPreset === preset.label
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1.5" />
                <button
                  onClick={handleSelectRange}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Select Range
                </button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
