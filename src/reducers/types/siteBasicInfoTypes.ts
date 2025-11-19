// State interface for SiteBasicInfoEditor
export interface SiteBasicInfoState {
  // Form fields
  bonus: string;
  features: string[];
  newFeature: string;
  logoFile: File | null;
  logoPreview: string;
  
  // Social media
  email: string;
  whatsapp: string;
  telegram: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  telegram_channel: string;
  kick: string;
  discord: string;
  pinterest: string;
  
  // Validation & tracking
  errors: Record<string, string>;
  initialData: SiteBasicInfoData | null;
  lastSaved?: Date;
}

// Data structure for initial/saved state
export interface SiteBasicInfoData {
  bonus: string;
  features: string[];
  email: string;
  whatsapp: string;
  telegram: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  telegram_channel: string;
  kick: string;
  discord: string;
  pinterest: string;
}

// Action types
export type SiteBasicInfoAction =
  | { type: 'SET_FIELD'; field: keyof SiteBasicInfoState; value: any }
  | { type: 'SET_MULTIPLE_FIELDS'; fields: Partial<SiteBasicInfoState> }
  | { type: 'ADD_FEATURE'; feature: string }
  | { type: 'REMOVE_FEATURE'; index: number }
  | { type: 'SET_LOGO'; file: File; preview: string }
  | { type: 'CLEAR_LOGO' }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'RESET_TO_INITIAL' }
  | { type: 'SET_INITIAL_DATA'; data: SiteBasicInfoData; logoUrl?: string }
  | { type: 'SET_LAST_SAVED'; date: Date }
  | { type: 'UPDATE_AFTER_SAVE'; data: SiteBasicInfoData; logoUrl?: string };
