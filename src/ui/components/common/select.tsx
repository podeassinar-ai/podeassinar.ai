'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onBlur?: () => void;
  className?: string;
  id?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Selecione',
  value,
  onChange,
  onBlur,
  className = '',
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onBlur={onBlur}
          className={`
            input-field h-[48px] text-left flex items-center justify-between cursor-pointer w-full
            ${error ? 'border-error ring-1 ring-error/20' : ''}
            ${!selectedOption ? 'text-text-muted' : 'text-text-primary'}
          `}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-border/60 rounded-xl shadow-xl overflow-hidden animate-fade-in origin-top">
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-4 py-3 text-sm font-mono transition-colors
                    ${option.value === value ? 'bg-primary/5 text-primary font-bold' : 'text-text-primary hover:bg-gray-50'}
                  `}
                >
                  {option.label}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted text-center font-mono">
                  Nenhuma opção
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}
