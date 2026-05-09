"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.96]",
        variant === "primary" &&
          "rounded-2xl bg-primary text-white shadow-primary-glow hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        variant === "secondary" &&
          "rounded-2xl border border-outline-variant/30 bg-white text-on-surface hover:border-primary/30 hover:bg-surface-container",
        variant === "ghost" &&
          "rounded-2xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        variant === "destructive" &&
          "rounded-2xl bg-destructive text-white shadow-destructive-glow hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
        size === "sm" && "h-8 gap-1.5 px-3.5 text-xs",
        size === "md" && "h-11 gap-2 px-5 text-sm",
        size === "lg" && "h-14 gap-2.5 px-7 text-base",
        size === "icon" && "h-11 w-11 rounded-2xl",
        className
      )}
      {...props}
    />
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-on-surface-variant ml-1 font-headline tracking-tight">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-2xl border border-outline-variant/30 bg-white px-4 py-3.5 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40",
          error ? "border-destructive/40 focus:border-destructive" : "focus:border-primary/40",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive ml-1">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-on-surface-variant ml-1 font-headline tracking-tight">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "min-h-[120px] w-full resize-none rounded-2xl border border-outline-variant/30 bg-white px-4 py-3.5 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40",
          error ? "border-destructive/40 focus:border-destructive" : "focus:border-primary/40",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive ml-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, error, options, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-on-surface-variant ml-1 font-headline tracking-tight">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full cursor-pointer rounded-2xl border border-outline-variant/30 bg-white px-4 py-3.5 text-sm text-on-surface shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 appearance-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-destructive ml-1">{error}</p>}
    </div>
  );
}

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-card transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        variant === "default" && "bg-primary-container/40 text-primary border border-primary/10",
        variant === "outline" && "border border-outline-variant/40 bg-white text-on-surface-variant",
        variant === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
        variant === "warning" && "bg-amber-50 text-amber-700 border border-amber-100",
        variant === "danger" && "bg-destructive/10 text-destructive border border-destructive/10",
        className
      )}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-outline-variant border-t-primary",
        className
      )}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container text-on-surface-variant/40 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-bold tracking-tight text-on-surface font-headline">{title}</h3>
      {description && <p className="mb-8 max-w-xs text-sm font-medium text-on-surface-variant">{description}</p>}
      {action}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          "relative z-10 w-full rounded-t-[32px] border border-outline-variant/20 bg-white shadow-2xl transition-all duration-300 sm:max-w-md sm:rounded-[32px] overflow-hidden",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-5">
            <h2 className="text-lg font-bold tracking-tight text-on-surface font-headline">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
