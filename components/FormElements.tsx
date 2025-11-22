import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDownIcon } from './Icons';
import { ModeConfig } from '../types';

// --- Helper to get dynamic colors based on mode & theme ---
const getModeClasses = (mode: ModeConfig) => {
  // Base styles for pro feel
  const base = {
    inputBg: "bg-white dark:bg-slate-900/40",
    inputBorder: "border-slate-200 dark:border-slate-800",
    inputHover: "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:bg-white dark:hover:bg-slate-900/60",
    label: "text-slate-500 dark:text-slate-400",
    inputText: "text-slate-700 dark:text-slate-200",
  };

  if (mode.id === 'peds') return {
    ...base,
    focus: 'focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:shadow-lg focus-within:shadow-emerald-500/5 focus-within:scale-[1.01]',
    labelFocus: 'group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400',
    textHighlight: 'text-emerald-600 dark:text-emerald-400',
    sectionBorder: 'border-emerald-100 dark:border-emerald-500/20',
    sectionGlow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)]',
    accentBg: 'bg-emerald-500',
    accentSoft: 'bg-emerald-50 dark:bg-emerald-900/20',
    checkboxChecked: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    optionSelected: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  };
  if (mode.id === 'obgyn') return {
    ...base,
    focus: 'focus-within:border-pink-500/50 focus-within:ring-4 focus-within:ring-pink-500/10 focus-within:shadow-lg focus-within:shadow-pink-500/5 focus-within:scale-[1.01]',
    labelFocus: 'group-focus-within:text-pink-600 dark:group-focus-within:text-pink-400',
    textHighlight: 'text-pink-600 dark:text-pink-400',
    sectionBorder: 'border-pink-100 dark:border-pink-500/20',
    sectionGlow: 'shadow-[0_0_40px_-10px_rgba(236,72,153,0.1)]',
    accentBg: 'bg-pink-500',
    accentSoft: 'bg-pink-50 dark:bg-pink-900/20',
    checkboxChecked: 'peer-checked:border-pink-500 peer-checked:bg-pink-500 peer-checked:text-white peer-checked:shadow-[0_4px_12px_-2px_rgba(236,72,153,0.5)]',
    iconBg: 'bg-pink-50 dark:bg-pink-500/10',
    iconText: 'text-pink-600 dark:text-pink-400',
    optionSelected: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
  };
  // Adult - Indigo/Slate (Default)
  return {
    ...base,
    focus: 'focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:shadow-lg focus-within:shadow-indigo-500/5 focus-within:scale-[1.01]',
    labelFocus: 'group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400',
    textHighlight: 'text-indigo-600 dark:text-indigo-400',
    sectionBorder: 'border-indigo-100 dark:border-indigo-500/20',
    sectionGlow: 'shadow-[0_0_40px_-10px_rgba(99,102,241,0.1)]',
    accentBg: 'bg-indigo-500',
    accentSoft: 'bg-indigo-50 dark:bg-indigo-900/20',
    checkboxChecked: 'peer-checked:border-indigo-500 peer-checked:bg-indigo-500 peer-checked:text-white peer-checked:shadow-[0_4px_12px_-2px_rgba(99,102,241,0.5)]',
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    optionSelected: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
  };
};

interface SectionProps {
  id?: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  modeConfig: ModeConfig;
}

export const Section: React.FC<SectionProps> = ({ id, title, icon, children, isOpen, onToggle, modeConfig }) => {
  const styles = getModeClasses(modeConfig);

  return (
    <div 
      id={id}
      className={`group relative mb-6 rounded-[2rem] backdrop-blur-xl transition-all duration-700 ease-out spotlight-card
        ${isOpen 
            ? `${styles.sectionGlow} shadow-2xl` 
            : 'opacity-80 hover:opacity-100'
        }
    `}>
      <button
        type="button"
        onClick={onToggle}
        className="relative z-10 flex w-full items-center justify-between px-8 py-6 text-left outline-none"
      >
        <div className="flex items-center gap-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ease-out
            ${isOpen 
                ? `${styles.iconBg} ${styles.iconText} scale-105 rotate-3 shadow-inner` 
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
            }`}>
             {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
          </div>
          <span className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
            {title}
          </span>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all duration-500 ease-out
            ${isOpen 
                ? 'rotate-180 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700' 
                : 'text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
            }`}>
           <ChevronDownIcon className="h-5 w-5 stroke-[2.5]" />
        </div>
      </button>
      
      <div className={`relative z-10 grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="px-8 pb-10">
                <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                <div className="flex flex-col gap-8">
                  {children}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const SubHeader: React.FC<{ title: string; className?: string }> = ({ title, className = '' }) => (
    <h3 className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 mt-8 ${className}`}>
        <span className="h-px w-8 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
        {title}
    </h3>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  modeConfig: ModeConfig;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({ label, modeConfig, suffix, className = '', ...props }) => {
  const styles = getModeClasses(modeConfig);
  return (
    <div className={`group relative rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-center ${styles.inputBg} ${styles.inputBorder} ${styles.inputHover} ${styles.focus}`}>
       <div className="flex flex-col px-4 py-3">
         <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${styles.label} ${styles.labelFocus} select-none mb-1`}>
            {label}
         </label>
         <div className="relative flex items-center">
            <input
                className={`w-full bg-transparent text-[17px] font-medium ${styles.inputText} placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none leading-relaxed ${className}`}
                {...props}
            />
            {suffix && (
                <span className="pointer-events-none ml-2 text-base font-semibold text-slate-400 dark:text-slate-600 select-none">
                    {suffix}
                </span>
            )}
         </div>
       </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  modeConfig: ModeConfig;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, modeConfig, className = '', value, ...props }) => {
  const styles = getModeClasses(modeConfig);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const element = textareaRef.current;
    if (element) {
      element.style.height = 'auto'; 
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  return (
     <div 
        className={`group relative rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-text origin-center ${styles.inputBg} ${styles.inputBorder} ${styles.inputHover} ${styles.focus}`} 
        onClick={() => textareaRef.current?.focus()}
     >
       <div className="flex flex-col px-4 py-3">
         <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${styles.label} ${styles.labelFocus} select-none mb-1`}>
            {label}
         </label>
         <textarea
            ref={textareaRef}
            rows={1} 
            className={`w-full resize-none overflow-hidden bg-transparent text-[17px] font-medium ${styles.inputText} placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none leading-relaxed block ${className}`}
            value={value}
            onChange={(e) => {
                adjustHeight();
                props.onChange?.(e);
            }}
            {...props}
         />
       </div>
    </div>
  );
};

interface SelectProps {
  label: string;
  options: string[];
  modeConfig: ModeConfig;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, options, modeConfig, placeholder = "Select...", value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string>("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const styles = getModeClasses(modeConfig);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedValue = value !== undefined ? value : internalSelected;

  const handleSelect = (val: string) => {
    if (onChange) {
        onChange(val);
    } else {
        setInternalSelected(val);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width
        });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
        if (containerRef.current && containerRef.current.contains(event.target as Node)) {
            return;
        }
        const target = event.target as HTMLElement;
        if (target.closest('[data-portal-menu="true"]')) return;
        setIsOpen(false);
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [isOpen]);

  return (
    <div 
        ref={containerRef}
        className={`group relative rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-center ${styles.inputBg} ${styles.inputBorder} ${styles.inputHover} ${styles.focus} ${isOpen ? 'ring-4 ring-slate-200 dark:ring-slate-800' : ''}`}
    >
      <div className="flex flex-col px-4 py-3 h-full justify-center relative">
        <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${styles.label} ${styles.labelFocus} select-none mb-1`}>
            {label}
        </label>
        
        <button 
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            className="flex w-full items-center justify-between text-left focus:outline-none"
        >
            <span className={`text-[17px] font-medium truncate ${selectedValue ? styles.inputText : 'text-slate-300 dark:text-slate-600'}`}>
                {selectedValue || placeholder}
            </span>
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 stroke-[2.5]" />
            </div>
        </button>

        {isOpen && ReactDOM.createPortal(
            <div 
                data-portal-menu="true"
                style={{ 
                    top: `${coords.top}px`, 
                    left: `${coords.left}px`, 
                    width: `${coords.width}px` 
                }}
                className="fixed z-[9999] animate-pop origin-top"
            >
                <div className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-black/5`}>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full px-4 py-2.5 text-left text-[15px] font-medium transition-colors ${selectedValue === option ? styles.optionSelected : `text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>,
            document.body
        )}
      </div>
    </div>
  );
};

interface CheckboxChipProps {
    item: string;
    styles: any;
}

const CheckboxChip: React.FC<CheckboxChipProps> = ({ item, styles }) => {
    const [isBouncing, setIsBouncing] = useState(false);

    const handleChange = () => {
        // Toggle animation state to trigger reflow if needed or just set it
        setIsBouncing(false);
        // Small delay to ensure class is removed then re-added
        setTimeout(() => setIsBouncing(true), 20);
    };

    return (
        <label className="relative group cursor-pointer tap-highlight-transparent select-none">
            <input type="checkbox" className="peer sr-only" onChange={handleChange} />
            <div 
                onAnimationEnd={() => setIsBouncing(false)}
                className={`
                    h-full flex items-center justify-center text-center px-5 py-4 rounded-2xl border 
                    transform-gpu
                    
                    transition-colors duration-300 ease-out
                    bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50
                    text-slate-600 dark:text-slate-400 font-bold text-sm tracking-wide
                    shadow-sm
                    
                    group-hover:border-slate-300 dark:group-hover:border-slate-600 group-hover:shadow-md
                    
                    transition-transform duration-100
                    group-active:scale-95
                    
                    ${styles.checkboxChecked}
                    ${isBouncing ? 'animate-elastic' : ''}
                    peer-checked:ring-0
                `}
            >
                <span className="z-10 relative">{item}</span>
            </div>
        </label>
    );
}

interface CheckboxGroupProps {
  label: string;
  items: string[];
  modeConfig: ModeConfig;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, items, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    
    return (
        <div className="rounded-[2rem] bg-white/50 dark:bg-slate-900/30 p-8 border border-slate-200 dark:border-slate-800/50">
            <label className="mb-6 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                    <CheckboxChip key={item} item={item} styles={styles} />
                ))}
            </div>
        </div>
    )
}

export const ContextBadge: React.FC<{ label: string; modeConfig: ModeConfig }> = ({ label, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    return (
        <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${styles.accentSoft} ${styles.textHighlight} mb-5 border ${styles.sectionBorder}`}>
            {label}
        </div>
    );
}

export const ModuleContext: React.FC<{ children: React.ReactNode; modeConfig: ModeConfig }> = ({ children, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    return (
        <div className={`animate-fade-in relative overflow-hidden rounded-[2rem] border ${styles.sectionBorder} bg-white/40 dark:bg-slate-900/20 p-8`}>
            <div className={`absolute left-0 top-0 h-full w-1 ${styles.accentBg} opacity-40`} />
            <div className="pl-2">
                 {children}
            </div>
        </div>
    );
}