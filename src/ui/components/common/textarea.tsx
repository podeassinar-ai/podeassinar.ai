import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`input-field min-h-[120px] resize-y ${error ? 'border-error ring-1 ring-error/20' : ''} ${className}`}
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

Textarea.displayName = 'Textarea';