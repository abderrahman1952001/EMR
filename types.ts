export type ClinicalMode = 'adult' | 'peds' | 'obgyn';

export interface ModeConfig {
  id: ClinicalMode;
  label: string;
  color: string; // Tailwind color name fragment (e.g., 'emerald', 'indigo')
  accentBg: string;
  accentText: string;
  borderColor: string;
  ringColor: string;
}

export interface IconProps {
  className?: string;
}
