'use client';

import React from 'react';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedTriggerId = React.useId();
  const listboxId = React.useId();
  const labelId = React.useId();
  const triggerId = id || generatedTriggerId;

  const selectedOption = options.find((opt) => opt.value === value);
  const activeIndex = highlightedIndex >= 0 ? highlightedIndex : Math.max(0, options.findIndex((opt) => opt.value === value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
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
    setHighlightedIndex(-1);
    triggerRef.current?.focus();
  };

  const openList = (startIndex?: number) => {
    setIsOpen(true);
    setHighlightedIndex(startIndex ?? Math.max(0, options.findIndex((opt) => opt.value === value)));
  };

  const closeList = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex].value);
        } else {
          openList();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openList(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1 + options.length) % options.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openList(Math.max(0, options.length - 1));
        } else {
          setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeList();
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label id={labelId} htmlFor={triggerId} className="input-label">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          onClick={() => (isOpen ? closeList() : openList())}
          onBlur={onBlur}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
          aria-label={label ? undefined : selectedOption ? selectedOption.label : placeholder}
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
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-activedescendant={options[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined}
            className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-border/60 rounded-xl shadow-xl overflow-hidden animate-fade-in origin-top"
          >
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {options.map((option, index) => (
                <button
                  id={`${listboxId}-option-${index}`}
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                  className={`
                    w-full text-left px-4 py-3 text-sm font-mono transition-colors
                    ${index === activeIndex ? 'bg-gray-50' : ''}
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
