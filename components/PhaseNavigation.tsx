import React from 'react';
import { ModeConfig } from '../types';

interface SectionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface PhaseNavigationProps {
  sections: SectionItem[];
  activeSectionId: string;
  onSelect: (id: string) => void;
  modeConfig: ModeConfig;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const PhaseNavigation: React.FC<PhaseNavigationProps> = ({
  sections,
  activeSectionId,
  onSelect,
  modeConfig,
}) => {
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4 [perspective:1000px]">
      
      {/* The Rail Container */}
      <div className={`
        group relative flex flex-col gap-2 p-2.5 rounded-[2rem]
        bg-white/70 dark:bg-slate-950/70 
        backdrop-blur-2xl border border-white/40 dark:border-slate-800/60
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
        w-[4.5rem] hover:w-[17rem]
        hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-900/80
      `}>
        
        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5">
          {sections.map((item, index) => {
            const isActive = activeSectionId === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`
                  relative flex items-center h-11 rounded-xl transition-all duration-500
                  overflow-hidden
                  ${isActive 
                    ? `text-white shadow-md ring-1 ring-white/10` 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                 {/* Active Background with Gradient */}
                 <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : ''} ${modeConfig.accentBg} bg-gradient-to-r from-transparent to-white/10`} />

                {/* Icon Container */}
                <div className="relative z-10 min-w-[3.25rem] h-full flex items-center justify-center">
                    <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                        {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { 
                        className: `w-4 h-4 ${isActive ? 'text-white' : ''}` 
                        })}
                    </div>
                </div>

                {/* Label (Staggered Reveal) */}
                <div 
                    className={`flex-1 whitespace-nowrap pr-4 transition-all duration-500 ease-out
                    ${isActive ? 'translate-x-0 opacity-100' : 'opacity-0 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100'}
                    `}
                    style={{ transitionDelay: `${index * 30}ms` }}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
                    {item.title}
                  </span>
                </div>
                
                {/* Active Indicator Dot */}
                {isActive && (
                   <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};