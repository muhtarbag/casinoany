// State interface for Admin Site Management
export interface AdminSiteManagementState {
  editingId: string | null;
  deletingId: string | null;
  selectedSites: string[];
  logoFile: File | null;
  logoPreview: string | null;
}

// Action types
export type AdminSiteManagementAction =
  | { type: 'SET_EDITING_ID'; id: string | null }
  | { type: 'SET_DELETING_ID'; id: string | null }
  | { type: 'SET_SELECTED_SITES'; ids: string[] }
  | { type: 'TOGGLE_SITE_SELECTION'; id: string }
  | { type: 'TOGGLE_ALL_SELECTION'; allSiteIds: string[] }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_LOGO'; file: File; preview: string }
  | { type: 'CLEAR_LOGO' }
  | { type: 'RESET_FORM' };
