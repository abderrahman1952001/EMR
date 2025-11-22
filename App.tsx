import React, { useState, useEffect, useRef } from 'react';
import { ClinicalMode, ModeConfig } from './types';
import { Section, Input, Select, TextArea, CheckboxGroup, ContextBadge, ModuleContext, SubHeader } from './components/FormElements';
import { UserIcon, ActivityIcon, HistoryIcon, ClipboardIcon, StethoscopeIcon, CheckCircleIcon, SparklesIcon, ListCheckIcon, WifiIcon, ShieldCheckIcon, CloudIcon, SunIcon, MoonIcon } from './components/Icons';
import { PhaseNavigation } from './components/PhaseNavigation';
import { Toast } from './components/Toast';

// --- Configuration ---
const MODES: Record<ClinicalMode, ModeConfig> = {
  adult: {
    id: 'adult',
    label: 'Adult',
    color: 'indigo',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-500',
    ringColor: 'ring-indigo-500/50'
  },
  obgyn: {
    id: 'obgyn',
    label: 'OB / Gyn',
    color: 'pink',
    accentBg: 'bg-pink-500',
    accentText: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-500',
    ringColor: 'ring-pink-500/50'
  },
  peds: {
    id: 'peds',
    label: 'Pediatrics',
    color: 'emerald',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-500',
    ringColor: 'ring-emerald-500/50'
  }
};

const VITALS_CONFIG = [
    { id: 'hr', label: 'HR', unit: 'bpm', max: 300, min: 20 },
    { id: 'rr', label: 'RR', unit: '/min', max: 80, min: 5 },
    { id: 'temp', label: 'Temp', unit: '°C', max: 45, min: 30, decimals: 1 },
    { id: 'spo2', label: 'SpO₂', unit: '%', max: 100, min: 50 },
];

const SECTIONS = [
  { id: 'identity', title: 'Patient Context', icon: <UserIcon /> },
  { id: 'concern', title: 'Chief Concern', icon: <ActivityIcon /> },
  { id: 'hpi', title: 'History (HPI)', icon: <HistoryIcon /> },
  { id: 'ros', title: 'Review of Systems', icon: <ListCheckIcon /> },
  { id: 'background', title: 'Background', icon: <ClipboardIcon /> },
  { id: 'exam', title: 'Examination', icon: <StethoscopeIcon /> },
  { id: 'plan', title: 'Assessment & Plan', icon: <CheckCircleIcon /> },
];

const NumberInput = ({ placeholder, max, min, decimals = 0, className = "" }: { placeholder?: string, max?: number, min?: number, decimals?: number, className?: string }) => {
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        let val = target.value;
        if (val === '') return;
        if (val.length > 10) target.value = val.slice(0, 10);
    };

    return (
        <input 
            type="number"
            inputMode="decimal"
            step={decimals > 0 ? "0.1" : "1"}
            placeholder={placeholder}
            onInput={handleInput}
            className={`w-full bg-transparent text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-200 dark:placeholder-slate-800/50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
        />
    )
}

const App: React.FC = () => {
  const [mode, setMode] = useState<ClinicalMode>('adult');
  const [isDark, setIsDark] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    concern: true,
    identity: true, 
  });
  const [activeSectionId, setActiveSectionId] = useState('identity');
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<string | null>(null);

  const [age, setAge] = useState<string>('');
  
  const isManualScrolling = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const currentConfig = MODES[mode];

  // Optimized Mouse Move (Fixes "Heavy Mouse")
  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!height || !weight) {
        setBmi(null);
        return;
    }
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (isNaN(h) || isNaN(w) || h === 0) {
        setBmi(null);
        return;
    }

    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);
    
    if (bmiValue > 0 && bmiValue < 100) {
        setBmi(bmiValue.toFixed(1));
    } else {
        setBmi(null);
    }
  }, [height, weight]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '' || /^\d+$/.test(val)) {
          setAge(val);
      }
  };

  const handleAgeBlur = () => {
      if (!age) return;
      const num = parseInt(age, 10);
      const currentYear = new Date().getFullYear();
      if (num > 1900 && num <= currentYear) {
          const calculatedAge = currentYear - num;
          setAge(calculatedAge.toString());
      }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const scrollPosition = window.scrollY;
      const triggerPoint = scrollPosition + 300; 

      let current = activeSectionId;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          const adjustedTop = offsetTop - 140;
          if (triggerPoint >= adjustedTop && triggerPoint < adjustedTop + offsetHeight + 100) {
            current = section.id;
          }
        }
      }
      
      if (current !== activeSectionId) {
          setActiveSectionId(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSectionId]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    if (activeSectionId === id) return;
    isManualScrolling.current = true;
    setActiveSectionId(id);
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -110; 
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 800);
      } else {
          isManualScrolling.current = false;
      }
    }, 50);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
    }, 800);
  };

  return (
    <div ref={mainRef} className="relative min-h-screen transition-colors duration-500 ease-out bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 font-sans spotlight-group">
      
      <Toast show={showToast} message="Record Saved Successfully" onClose={() => setShowToast(false)} />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-[0.07] mix-blend-overlay"></div>
        <div 
          className={`absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-[100%] blur-[120px] opacity-20 dark:opacity-10 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
         <div 
          className={`absolute top-[40%] left-[10%] w-[600px] h-[600px] rounded-[100%] blur-[100px] opacity-10 dark:opacity-5 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/50 transition-all duration-500">
        <div className="mx-auto w-full max-w-7xl px-4 h-16 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm border border-slate-200/60 dark:border-white/10`}>
                <svg className={`h-5 w-5 transition-colors duration-500 ${currentConfig.accentText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    NEXUS
                    </h1>
                    <span className="hidden sm:block h-px w-3 bg-slate-300 dark:bg-slate-700"></span>
                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinical OS</span>
                </div>
              </div>
            </div>

            {/* Pro Segmented Control */}
            <div className="flex-1 flex justify-center max-w-md">
                <div className="relative flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-inner overflow-hidden backdrop-blur-md">
                {/* Sliding Pill with better shadow/glow */}
                <div 
                    className={`absolute top-1.5 bottom-1.5 rounded-xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${currentConfig.accentBg}`}
                    style={{ 
                        left: `${(Object.keys(MODES).indexOf(mode) * (100 / 3)) + 0.5}%`, 
                        width: `${100 / 3 - 1}%` 
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 rounded-xl"></div>
                </div>
                
                {(Object.keys(MODES) as ClinicalMode[]).map((m) => {
                    const isActive = mode === m;
                    return (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative z-10 flex-1 w-20 sm:w-28 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                            isActive ? 'text-white text-shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        {MODES[m].label}
                    </button>
                    );
                })}
                </div>
            </div>

            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-400">
                    <div className="group relative flex items-center justify-center hover:text-emerald-500 transition-colors cursor-help">
                        <WifiIcon className="w-4 h-4" />
                        <div className="absolute top-full right-0 mt-4 px-2 py-1 text-[9px] font-bold bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">ONLINE</div>
                    </div>
                    <div className="group relative flex items-center justify-center hover:text-sky-500 transition-colors cursor-help">
                        <CloudIcon className="w-4 h-4" />
                        <div className="absolute top-full right-0 mt-4 px-2 py-1 text-[9px] font-bold bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">SYNCED</div>
                    </div>
                    <div className="group relative flex items-center justify-center hover:text-indigo-500 transition-colors cursor-help">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <div className="absolute top-full right-0 mt-4 px-2 py-1 text-[9px] font-bold bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">SECURE</div>
                    </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-900 shadow-sm"></div>
            </div>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
            
            <PhaseNavigation 
              sections={SECTIONS}
              activeSectionId={activeSectionId}
              onSelect={scrollToSection}
              modeConfig={currentConfig}
              isDark={isDark}
              onToggleTheme={() => setIsDark(!isDark)}
            />

            <main className="flex-1 w-full min-w-0 xl:pl-28 py-10 pb-48 transition-[padding] duration-500">
                
                <div className="space-y-10">
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
                        <Section 
                            id="identity"
                            title="Patient Context" 
                            icon={<UserIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['identity']}
                            onToggle={() => toggleSection('identity')}
                        >
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 sm:col-span-7">
                                <TextArea label="Patient Name" placeholder="Last Name, First Name" modeConfig={currentConfig} rows={1} />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <Input 
                                  label="Age / DOB" 
                                  placeholder="--" 
                                  modeConfig={currentConfig} 
                                  inputMode="numeric"
                                  value={age}
                                  onChange={handleAgeChange}
                                  onBlur={handleAgeBlur}
                                  suffix={age ? 'yo' : ''}
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <Select label="Gender" options={['Female', 'Male', 'Other']} modeConfig={currentConfig} />
                            </div>
                        </div>
                        {mode === 'peds' && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 sm:col-span-6">
                                    <Input label="Caregiver Name" placeholder="Name & Relationship" modeConfig={currentConfig} />
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <Input label="Legal Responsibility" placeholder="If relevant" modeConfig={currentConfig} />
                                </div>
                            </div>
                        )}
                        
                         <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                            <Input 
                                label="Height (cm)" 
                                type="number" 
                                placeholder="--" 
                                modeConfig={currentConfig} 
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                            <Input 
                                label="Weight (kg)" 
                                type="number" 
                                placeholder="--" 
                                modeConfig={currentConfig} 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <div className="col-span-2 flex flex-col justify-center pb-2 px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">BMI</span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-black tracking-tight ${bmi ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}`}>
                                        {bmi || '--.-'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">kg/m²</span>
                                </div>
                            </div>
                         </div>
                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        <Section 
                            id="concern"
                            title="Chief Concern" 
                            icon={<ActivityIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['concern']}
                            onToggle={() => toggleSection('concern')}
                        >
                        <div className="relative mb-4">
                            <TextArea 
                                label="Main Problem" 
                                placeholder={mode === 'peds' ? "What made you bring them in today?" : "What brought you here today?"}
                                className="text-2xl font-semibold tracking-tight" 
                                modeConfig={currentConfig} 
                                autoFocus
                                rows={1}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <TextArea label="Other Issues" placeholder="Secondary concerns..." modeConfig={currentConfig} />
                            <TextArea label="Duration" placeholder="Rough duration..." modeConfig={currentConfig} />
                        </div>
                        
                        <SubHeader title="Patient Perspective (ICE)" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <TextArea label="Ideas & Concerns" placeholder="What do they think it is? What are they worried about (e.g. Cancer, Infertility)?" modeConfig={currentConfig} />
                             <TextArea label="Expectations" placeholder="What are they hoping for (Meds, Reassurance, Tests)?" modeConfig={currentConfig} />
                        </div>
                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
                        <Section 
                            id="hpi"
                            title="History of Present Illness" 
                            icon={<HistoryIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['hpi']}
                            onToggle={() => toggleSection('hpi')}
                        >
                             <SubHeader title="Narrative Story" />
                             <TextArea 
                                label="Detailed Story" 
                                placeholder="Chronological account..." 
                                modeConfig={currentConfig} 
                                rows={3}
                             />

                             <SubHeader title="Symptom Details (8-Blocks)" />
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <Input label="Onset" placeholder="Date / Time / Sudden vs Gradual" modeConfig={currentConfig} />
                                <Select label="Course" options={['Improving', 'Stable', 'Worsening', 'Fluctuating']} modeConfig={currentConfig} />
                                <Select label="Pattern" options={['Constant', 'Intermittent', 'Episodic']} modeConfig={currentConfig} />
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                 <TextArea label="Context" placeholder={mode === 'peds' ? "Activity, Feeding, Sleep, School..." : "At rest, with exertion, after food..."} modeConfig={currentConfig} />
                                 <TextArea label="Location & Radiation" placeholder="Where is it? Does it spread?" modeConfig={currentConfig} />
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                 <div className="grid grid-cols-2 gap-4">
                                    <Select label="Severity" options={['Mild', 'Moderate', 'Severe', '1/10', '5/10', '10/10']} modeConfig={currentConfig} />
                                    <Input label="Character" placeholder="Sharp, Dull, Burning..." modeConfig={currentConfig} />
                                 </div>
                                 <TextArea label="Modifying Factors" placeholder="Better with? Worse with?" modeConfig={currentConfig} />
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                 <TextArea label="Associated Symptoms" placeholder="Pertinent positives..." modeConfig={currentConfig} />
                                 <TextArea label="Impact on Function" placeholder={mode === 'peds' ? "Feeding, Sleep, Play, School" : "Work, Sleep, Daily Activities"} modeConfig={currentConfig} />
                             </div>
                             
                             <div className="mt-4">
                                <TextArea label="Previous Episodes" placeholder="Has this happened before? Treatments tried?" modeConfig={currentConfig} />
                             </div>
                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
                        <Section
                            id="ros"
                            title="Review of Systems"
                            icon={<ListCheckIcon />}
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['ros']}
                            onToggle={() => toggleSection('ros')}
                        >
                            <div className="space-y-6">
                                <CheckboxGroup 
                                    label="General"
                                    items={['Fever', 'Chills', 'Night Sweats', 'Weight Loss', 'Fatigue', 'Lumps/Bumps']}
                                    modeConfig={currentConfig}
                                />
                                {mode === 'obgyn' && (
                                    <CheckboxGroup 
                                        label="Gyn/Ob Specific"
                                        items={['Abnormal Bleeding', 'Vaginal Discharge', 'Pelvic Pain', 'Dyspareunia', 'Breast Pain/Lumps']}
                                        modeConfig={currentConfig}
                                    />
                                )}
                                <CheckboxGroup 
                                    label="Cardio-Respiratory"
                                    items={['Chest Pain', 'Palpitations', 'Dyspnea', 'Orthopnea', 'Cough', 'Wheeze', 'Edema']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Gastrointestinal"
                                    items={['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abd Pain', 'Blood in Stool']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Genitourinary"
                                    items={['Dysuria', 'Frequency', 'Urgency', 'Hematuria', 'Incontinence']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Neurological"
                                    items={['Headache', 'Dizziness', 'Syncope', 'Numbness', 'Weakness', 'Seizures']}
                                    modeConfig={currentConfig}
                                />
                                {mode === 'peds' && (
                                    <CheckboxGroup 
                                        label="Behavior/Skin"
                                        items={['Rash', 'Bruising', 'Sleep Problems', 'Tantrums', 'School Issues']}
                                        modeConfig={currentConfig}
                                    />
                                )}
                                {mode === 'adult' && (
                                    <CheckboxGroup 
                                        label="Psych/Other"
                                        items={['Mood Changes', 'Anxiety', 'Sleep Issues', 'Joint Pain', 'Rashes']}
                                        modeConfig={currentConfig}
                                    />
                                )}
                            </div>
                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                        <Section 
                            id="background"
                            title="Background History" 
                            icon={<ClipboardIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['background']}
                            onToggle={() => toggleSection('background')}
                        >
                        
                        {/* --- OB/GYN BACKGROUND --- */}
                        {mode === 'obgyn' && (
                            <>
                                <SubHeader title="1. Menstrual History" />
                                <ModuleContext modeConfig={currentConfig}>
                                    <ContextBadge label="Cycle Details" modeConfig={currentConfig} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                                        <Input label="Menarche Age" placeholder="Years" modeConfig={currentConfig} />
                                        <Input label="Cycle Length" placeholder="Days (e.g. 28)" modeConfig={currentConfig} />
                                        <Input label="Duration" placeholder="Days (e.g. 5)" modeConfig={currentConfig} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                        <Select label="Regularity" options={['Regular', 'Irregular', 'Absent']} modeConfig={currentConfig} />
                                        <Select label="Flow" options={['Light', 'Moderate', 'Heavy', 'Flooding/Clots']} modeConfig={currentConfig} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                        <Select label="Dysmenorrhea" options={['None', 'Mild', 'Moderate', 'Severe']} modeConfig={currentConfig} />
                                        <TextArea label="Other Bleeding" placeholder="Intermenstrual, Postcoital..." modeConfig={currentConfig} />
                                    </div>
                                    <Input label="Last Menstrual Period (LMP)" type="date" modeConfig={currentConfig} />
                                </ModuleContext>

                                <SubHeader title="2. Obstetric History" />
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                     <Input label="Gravida (G)" placeholder="Total Pregnancies" modeConfig={currentConfig} />
                                     <Input label="Para (P)" placeholder="Births >24w" modeConfig={currentConfig} />
                                </div>
                                <TextArea label="Previous Pregnancies" placeholder="Year, Type (SVD/CS), Complications, Outcome..." modeConfig={currentConfig} />
                                
                                <SubHeader title="3. Current Pregnancy (If Applicable)" />
                                <ModuleContext modeConfig={currentConfig}>
                                    <ContextBadge label="Current Gestation" modeConfig={currentConfig} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                                        <Input label="Gestational Age" placeholder="Weeks + Days" modeConfig={currentConfig} />
                                        <Input label="EDD" type="date" modeConfig={currentConfig} />
                                        <Select label="Planned?" options={['Yes', 'No']} modeConfig={currentConfig} />
                                    </div>
                                    <TextArea label="Antenatal Course" placeholder="Screening results, HTN, GDM, Bleeding..." modeConfig={currentConfig} />
                                    <TextArea label="Fetal Wellbeing" placeholder="Movements normal?" modeConfig={currentConfig} />
                                </ModuleContext>

                                <SubHeader title="4. Sexual History & Contraception" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Select label="Sexually Active?" options={['Yes', 'No', 'Previously']} modeConfig={currentConfig} />
                                    <TextArea label="Partners" placeholder="Number, Gender, Regular/Casual" modeConfig={currentConfig} />
                                    <Select label="Dyspareunia" options={['No', 'Yes (Deep)', 'Yes (Superficial)']} modeConfig={currentConfig} />
                                    <TextArea label="Protection/STI" placeholder="Condoms, History of STIs" modeConfig={currentConfig} />
                                </div>
                                <div className="mt-6">
                                    <Input label="Current Contraception" placeholder="Method & Duration" modeConfig={currentConfig} />
                                    <TextArea label="Past Contraception" placeholder="Issues, Side effects" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="5. Gyn & Medical History" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <TextArea label="Gyn Conditions" placeholder="Fibroids, Endo, PCOS, Ovarian Cysts, Smears..." modeConfig={currentConfig} />
                                    <TextArea label="Past Surgeries" placeholder="C-Section, Laparoscopy, Hysterectomy..." modeConfig={currentConfig} />
                                </div>
                                <TextArea label="Medical Hx & Meds" placeholder="Chronic illness, Current Meds, Allergies" className="mt-4" modeConfig={currentConfig} />
                                <TextArea label="Family History" placeholder="Breast CA, Ovarian CA, Clotting disorders..." className="mt-4" modeConfig={currentConfig} />
                            </>
                        )}

                        {/* --- PEDIATRIC BACKGROUND --- */}
                        {mode === 'peds' && (
                            <>
                                <SubHeader title="1. Perinatal History" />
                                <ModuleContext modeConfig={currentConfig}>
                                    <ContextBadge label="Maternal & Birth" modeConfig={currentConfig} />
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                                        <TextArea label="Maternal Pregnancy" placeholder="Illnesses, HTN, GDM, Meds, Smoking, Scans..." modeConfig={currentConfig} />
                                        <TextArea label="Delivery" placeholder="Gestational Age, Mode (SVD/CS/Instrumental)..." modeConfig={currentConfig} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <Input label="Birth Weight" placeholder="kg / lb" modeConfig={currentConfig} />
                                        <TextArea label="Neonatal Course" placeholder="Resuscitation, NICU, Jaundice, Breathing..." modeConfig={currentConfig} />
                                    </div>
                                </ModuleContext>

                                <SubHeader title="2. Feeding & Nutrition" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <Select label="Method" options={['Breast', 'Bottle', 'Mixed', 'Solids']} modeConfig={currentConfig} />
                                    <Input label="Volume/Freq" placeholder="e.g. 5oz q3h" modeConfig={currentConfig} />
                                    <Select label="Appetite" options={['Normal', 'Reduced', 'Increased']} modeConfig={currentConfig} />
                                </div>
                                <TextArea label="Dietary Restrictions" placeholder="Allergies, Special diets" className="mt-4" modeConfig={currentConfig} />

                                <SubHeader title="3. Growth & Development" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Growth" placeholder="Tracking curves? Weight/Height/Head Circ concerns?" modeConfig={currentConfig} />
                                    <TextArea label="Milestones" placeholder="Gross Motor, Fine Motor, Speech, Social..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="4. Past Medical History" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Illnesses" placeholder="Asthma, Seizures, Recurrent infections..." modeConfig={currentConfig} />
                                    <TextArea label="Hospitalizations/Surgeries" placeholder="Dates, Reasons" modeConfig={currentConfig} />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                                    <TextArea label="Medications" placeholder="Regular & PRN" modeConfig={currentConfig} />
                                    <TextArea label="Allergies" placeholder="Drug, Food (Reaction)" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="5. Preventive & Social" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <Select label="Immunizations" options={['Up to Date', 'Delayed', 'Unknown']} modeConfig={currentConfig} />
                                    <TextArea label="Family History" placeholder="Inherited conditions, Early deaths, Atopy..." modeConfig={currentConfig} />
                                </div>
                                <div className="mt-4">
                                    <TextArea label="Social History" placeholder="Who lives at home? Primary carer? Smokers? School/Daycare? Pets?" modeConfig={currentConfig} />
                                </div>
                            </>
                        )}

                        {/* --- ADULT BACKGROUND --- */}
                        {mode === 'adult' && (
                            <>
                                <SubHeader title="1. Medical & Surgical" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Chronic Conditions" placeholder="HTN, DM, Asthma, Lipid, CAD, Depression..." modeConfig={currentConfig} />
                                    <TextArea label="Surgical History" placeholder="Operation, Date, Complications" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="2. Meds & Allergies" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Current Medications" placeholder="Prescription, OTC, Herbal (Dose/Freq)" modeConfig={currentConfig} />
                                    <TextArea label="Allergies" placeholder="Drug (Reaction), Food, Latex" modeConfig={currentConfig} />
                                    <TextArea label="Adherence" placeholder="Issues taking meds?" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="3. Family History" />
                                <TextArea label="First Degree Relatives" placeholder="Parents/Siblings (Age, Health). CV Risk, Cancer, Diabetes..." modeConfig={currentConfig} />

                                <SubHeader title="4. Social History" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Living Situation" placeholder="Who with? Support system? Housing?" modeConfig={currentConfig} />
                                    <TextArea label="Occupation" placeholder="Job, Exposures, Stress" modeConfig={currentConfig} />
                                    <TextArea label="Financial/Safety" placeholder="Access to care, Safety at home" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="5. Habits" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <Input label="Smoking" placeholder="Packs/day x Years" modeConfig={currentConfig} />
                                    <Input label="Alcohol" placeholder="Units/week, CAGE" modeConfig={currentConfig} />
                                    <Input label="Recreational Drugs" placeholder="Type, Frequency" modeConfig={currentConfig} />
                                    <TextArea label="Lifestyle" placeholder="Diet, Exercise, Sleep" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="6. Reproductive (Screen)" />
                                <TextArea label="Sexual History" placeholder="Partners, Protection (if relevant)" modeConfig={currentConfig} />
                            </>
                        )}
                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
                        <Section 
                            id="exam"
                            title="Physical Examination" 
                            icon={<StethoscopeIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['exam']}
                            onToggle={() => toggleSection('exam')}
                        >
                        
                        {/* Vitals Block */}
                        <div className="bg-white/60 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-dashed border-slate-300 dark:border-slate-700 mb-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vital Signs</label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
                                {VITALS_CONFIG.map(vital => (
                                    <div key={vital.id} className="group relative flex flex-col items-center justify-center pt-8 pb-6 px-4 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1.5">
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm z-10 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{vital.label}</span>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <NumberInput placeholder="--" max={vital.max} min={vital.min} decimals={vital.decimals} className="text-center" />
                                            <span className="absolute left-0 -bottom-3 w-full text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 pointer-events-none tracking-wider">{vital.unit}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="col-span-2 group relative flex flex-col items-center justify-center pt-8 pb-6 px-4 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1.5">
                                     <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm z-10 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">BP (mmHg)</span>
                                     </div>
                                     <div className="flex items-center justify-center w-full gap-4">
                                         <div className="relative w-24">
                                            <NumberInput placeholder="Sys" max={250} min={50} className="text-center" />
                                            <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">SYS</div>
                                         </div>
                                         <span className="text-2xl text-slate-200 dark:text-slate-700 font-light -mt-2">/</span>
                                         <div className="relative w-24">
                                            <NumberInput placeholder="Dia" max={180} min={30} className="text-center" />
                                            <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">DIA</div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* --- PEDS EXAM --- */}
                        {mode === 'peds' && (
                            <>
                                <SubHeader title="General & Skin" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Appearance" placeholder="Well/Ill, Toxic? Alert? Hydration status..." modeConfig={currentConfig} />
                                    <TextArea label="Skin" placeholder="Rashes, Mottling, Turgor, Birthmarks..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="HEENT" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Head" placeholder="Fontanelles (Normotensive/Bulging/Sunken), Shape" modeConfig={currentConfig} />
                                    <TextArea label="Eyes/Ears/Nose" placeholder="Red reflex, TMs, Coryza..." modeConfig={currentConfig} />
                                    <TextArea label="Throat" placeholder="Tonsils, Mucosa, Teeth..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Cardio & Resp" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Respiratory" placeholder="Work of breathing, Recessions, Sounds, Stridor..." modeConfig={currentConfig} />
                                    <TextArea label="Cardiac" placeholder="Murmurs, Femoral Pulses, CRT..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Abdomen & Genitalia" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Abdomen" placeholder="Soft, Distended, Masses, Hernias..." modeConfig={currentConfig} />
                                    <TextArea label="Genitalia/Anus" placeholder="Testes descended? Patency? Diaper rash?" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Neuro & MSK" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Neurological" placeholder="Tone, Primitive Reflexes, Alertness..." modeConfig={currentConfig} />
                                    <TextArea label="MSK" placeholder="Hips (Barlow/Ortolani), Limb movement..." modeConfig={currentConfig} />
                                </div>
                            </>
                        )}

                        {/* --- OB/GYN EXAM --- */}
                        {mode === 'obgyn' && (
                            <>
                                <SubHeader title="General" />
                                <TextArea label="General Appearance" placeholder="Comfort, Pallor, BMI check..." modeConfig={currentConfig} />

                                <SubHeader title="Abdominal" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Inspection" placeholder="Scars (CS/Lap), Distension..." modeConfig={currentConfig} />
                                    <TextArea label="Palpation" placeholder="Masses, Tenderness, Organomegaly..." modeConfig={currentConfig} />
                                </div>
                                <ModuleContext modeConfig={currentConfig}>
                                    <ContextBadge label="Obstetric (If Pregnant)" modeConfig={currentConfig} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Input label="Fundal Height" placeholder="cm" modeConfig={currentConfig} />
                                        <TextArea label="Lie/Presentation" placeholder="Cephalic/Breech, Long/Transverse" modeConfig={currentConfig} />
                                        <Input label="Fetal Heart Rate" placeholder="bpm" modeConfig={currentConfig} />
                                        <TextArea label="Liquor/Movements" placeholder="Clinical assessment" modeConfig={currentConfig} />
                                    </div>
                                </ModuleContext>

                                <SubHeader title="Breast Exam (If Indicated)" />
                                <TextArea label="Findings" placeholder="Inspection, Palpation (Lumps, Axilla), Nipple changes..." modeConfig={currentConfig} />

                                <SubHeader title="Pelvic Exam (If Indicated)" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="External" placeholder="Vulva, Perineum, lesions, atrophy..." modeConfig={currentConfig} />
                                    <TextArea label="Speculum" placeholder="Cervix appearance, Discharge, Bleeding..." modeConfig={currentConfig} />
                                    <TextArea label="Bimanual" placeholder="Uterine size/mobility, Adnexal masses/tenderness, CMT..." modeConfig={currentConfig} />
                                </div>
                            </>
                        )}

                        {/* --- ADULT EXAM --- */}
                        {mode === 'adult' && (
                            <>
                                <SubHeader title="General" />
                                <TextArea label="General" placeholder="Appearance, Distress, Color, Alertness..." modeConfig={currentConfig} />

                                <SubHeader title="Head & Neck" />
                                <TextArea label="HEENT" placeholder="Eyes, Throat, Neck masses, Nodes, Thyroid..." modeConfig={currentConfig} />

                                <SubHeader title="Chest" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Cardiovascular" placeholder="Rhythm, Murmurs, JVP, Edema..." modeConfig={currentConfig} />
                                    <TextArea label="Respiratory" placeholder="Effort, Air entry, Added sounds..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Abdomen" />
                                <TextArea label="Abdomen" placeholder="Soft? Tender? Masses? Organomegaly? Bowel sounds?" modeConfig={currentConfig} />

                                <SubHeader title="Neurological" />
                                <TextArea label="Neuro Screen" placeholder="CN, Power, Tone, Sensation, Reflexes, Gait..." modeConfig={currentConfig} />

                                <SubHeader title="Musculoskeletal/Skin" />
                                <TextArea label="MSK/Skin" placeholder="Joints, ROM, Rashes, Lesions..." modeConfig={currentConfig} />
                            </>
                        )}

                        </Section>
                    </div>

                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
                        <Section 
                            id="plan"
                            title="Assessment & Plan" 
                            icon={<CheckCircleIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['plan']}
                            onToggle={() => toggleSection('plan')}
                        >
                        <TextArea label="Summary Statement" placeholder="Synthesize findings..." className="font-medium text-lg" modeConfig={currentConfig} />
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                            <TextArea label="Differential Diagnosis" placeholder="Most likely... Rule out..." modeConfig={currentConfig} />
                            <TextArea label="Management Plan" placeholder="Investigations, Treatment, Safety Netting, Follow-up..." modeConfig={currentConfig} />
                        </div>
                        </Section>
                    </div>
                </div>

            </main>
        </div>
      </div>

      {/* Pro Floating Theme Toggle (Bottom Left) */}
      <div className="fixed bottom-8 left-8 z-50 hidden xl:block">
         <button
            onClick={() => setIsDark(!isDark)}
            className="relative group flex items-center justify-center h-12 w-12 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-90"
         >
             <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 opacity-50 rounded-full" />
             <div className="relative z-10 text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                 {isDark 
                    ? <SunIcon className="w-5 h-5 transition-transform duration-500 rotate-0 group-hover:rotate-90" /> 
                    : <MoonIcon className="w-5 h-5 transition-transform duration-500 rotate-0 group-hover:-rotate-12" />
                 }
             </div>
             {/* Tooltip */}
             <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                 {isDark ? 'Light Mode' : 'Dark Mode'}
             </div>
         </button>
      </div>

      {/* Pro Bottom Action Bar */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-full max-w-md px-4 animate-slide-up-fade" style={{ animationDelay: '700ms' }}>
         <div className="group/bar flex items-center justify-between p-2 rounded-full border border-white/40 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-1">
             
             <button className="flex-1 h-14 flex items-center justify-center rounded-l-full text-xs font-bold uppercase tracking-wider text-slate-400 transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
               Clear
             </button>
             
             <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>

             <button 
                onClick={handleSave}
                className={`group relative flex-1 h-14 flex items-center justify-center overflow-hidden rounded-2xl mx-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 ${currentConfig.accentBg}`}
             >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                
                {isSaving ? (
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                    <span className="relative text-sm font-bold uppercase tracking-widest text-white text-shadow-sm">Save</span>
                )}
             </button>

             <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>

             <button className="flex-1 h-14 flex items-center justify-center gap-2 rounded-r-full text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 active:scale-95">
               <SparklesIcon className="h-4 w-4 transition-transform duration-300 hover:rotate-12 hover:scale-110" />
               <span className="hidden sm:inline">Assist</span>
             </button>
         </div>
      </div>

    </div>
  );
};

export default App;