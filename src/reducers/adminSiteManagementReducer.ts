import { AdminSiteManagementState, AdminSiteManagementAction } from './types/adminSiteManagementTypes';

// Initial state factory
export const createInitialState = (): AdminSiteManagementState => ({
  editingId: null,
  deletingId: null,
  selectedSites: [],
  logoFile: null,
  logoPreview: null,
});

// Reducer function
export const adminSiteManagementReducer = (
  state: AdminSiteManagementState,
  action: AdminSiteManagementAction
): AdminSiteManagementState => {
  switch (action.type) {
    case 'SET_EDITING_ID':
      return {
        ...state,
        editingId: action.id,
      };

    case 'SET_DELETING_ID':
      return {
        ...state,
        deletingId: action.id,
      };

    case 'SET_SELECTED_SITES':
      return {
        ...state,
        selectedSites: action.ids,
      };

    case 'TOGGLE_SITE_SELECTION':
      return {
        ...state,
        selectedSites: state.selectedSites.includes(action.id)
          ? state.selectedSites.filter(id => id !== action.id)
          : [...state.selectedSites, action.id],
      };

    case 'TOGGLE_ALL_SELECTION': {
      const allSelected = 
        state.selectedSites.length === action.allSiteIds.length && 
        action.allSiteIds.length > 0;
      
      return {
        ...state,
        selectedSites: allSelected ? [] : action.allSiteIds,
      };
    }

    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedSites: [],
      };

    case 'SET_LOGO':
      console.log('📦 Reducer - SET_LOGO:', { 
        fileName: action.file?.name,
        previewLength: action.preview?.length || 0,
        previewStart: action.preview?.substring(0, 50)
      });
      return {
        ...state,
        logoFile: action.file,
        logoPreview: action.preview,
      };

    case 'CLEAR_LOGO':
      return {
        ...state,
        logoFile: null,
        logoPreview: null,
      };

    case 'RESET_FORM':
      return {
        ...state,
        editingId: null,
        logoFile: null,
        logoPreview: null,
      };

    default:
      return state;
  }
};
