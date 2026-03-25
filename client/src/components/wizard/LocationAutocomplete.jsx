import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

/**
 * Location autocomplete input backed by Nominatim (via backend proxy).
 * Props:
 *   value, onChange(newValue), placeholder, className, inputClassName
 */
export function LocationAutocomplete({ value, onChange, placeholder = 'Search for a city…', className, inputClassName }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Keep internal query in sync when value prop changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.geoAutocomplete(q);
      setResults(data.results || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // keep parent in sync as user types
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (result) => {
    setQuery(result.name);
    onChange(result.name);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
        <Input
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn('pl-9', loading && 'pr-9', inputClassName)}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-56 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent input blur before click
                handleSelect(r);
              }}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-medium">{r.name}</span>
                {r.label !== r.name && (
                  <span className="text-muted-foreground ml-1 truncate">{r.label}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
