import { InputHTMLAttributes, forwardRef, ChangeEvent } from 'react';
import { applyMask } from '@/utils/masks';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  mask?: 'currency' | 'number';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, mask, onChange, ...props }, ref) => {
    const inputId = id || props.name;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        e.target.value = applyMask(e.target.value, mask);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={`input-field ${error ? 'border-error ring-1 ring-error/20' : ''} ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="input-hint">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';