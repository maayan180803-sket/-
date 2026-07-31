import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
  );
}

const baseInputClasses =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, required, className = '', ...props }: TextFieldProps) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <input required={required} className={`${baseInputClasses} ${className}`} {...props} />
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function SelectField({ label, required, children, className = '', ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <select required={required} className={`${baseInputClasses} ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextareaField({ label, className = '', ...props }: TextareaFieldProps) {
  return (
    <label className="block">
      <Label label={label} />
      <textarea className={`${baseInputClasses} ${className}`} rows={2} {...props} />
    </label>
  );
}
