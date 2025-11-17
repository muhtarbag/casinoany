import { SiteBasicInfoState, SiteBasicInfoAction } from './types/siteBasicInfoTypes';

// Initial state factory
export const createInitialState = (): SiteBasicInfoState => ({
  bonus: '',
  features: [],
  newFeature: '',
  logoFile: null,
  logoPreview: '',
  email: '',
  whatsapp: '',
  telegram: '',
  twitter: '',
  instagram: '',
  facebook: '',
  youtube: '',
  errors: {},
  initialData: null,
  lastSaved: undefined,
});

// Reducer function
export const siteBasicInfoReducer = (
  state: SiteBasicInfoState,
  action: SiteBasicInfoAction
): SiteBasicInfoState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SET_MULTIPLE_FIELDS':
      return {
        ...state,
        ...action.fields,
      };

    case 'ADD_FEATURE':
      // Don't add if already exists or limit reached
      if (state.features.includes(action.feature) || state.features.length >= 20) {
        return state;
      }
      return {
        ...state,
        features: [...state.features, action.feature],
        newFeature: '', // Clear input after adding
      };

    case 'REMOVE_FEATURE':
      return {
        ...state,
        features: state.features.filter((_, i) => i !== action.index),
      };

    case 'SET_LOGO':
      return {
        ...state,
        logoFile: action.file,
        logoPreview: action.preview,
      };

    case 'CLEAR_LOGO':
      return {
        ...state,
        logoFile: null,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };

    case 'RESET_TO_INITIAL':
      if (!state.initialData) return state;
      
      return {
        ...state,
        bonus: state.initialData.bonus,
        features: state.initialData.features,
        email: state.initialData.email,
        whatsapp: state.initialData.whatsapp,
        telegram: state.initialData.telegram,
        twitter: state.initialData.twitter,
        instagram: state.initialData.instagram,
        facebook: state.initialData.facebook,
        youtube: state.initialData.youtube,
        logoFile: null,
        errors: {},
      };

    case 'SET_INITIAL_DATA':
      return {
        ...state,
        bonus: action.data.bonus,
        features: action.data.features,
        email: action.data.email,
        whatsapp: action.data.whatsapp,
        telegram: action.data.telegram,
        twitter: action.data.twitter,
        instagram: action.data.instagram,
        facebook: action.data.facebook,
        youtube: action.data.youtube,
        logoPreview: action.logoUrl || '',
        initialData: action.data,
      };

    case 'UPDATE_AFTER_SAVE':
      return {
        ...state,
        logoFile: null,
        logoPreview: action.logoUrl || state.logoPreview,
        initialData: action.data,
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.date,
      };

    default:
      return state;
  }
};

// Helper function to check if state is dirty
export const isStateDirty = (state: SiteBasicInfoState): boolean => {
  if (!state.initialData) return false;

  return (
    state.bonus !== state.initialData.bonus ||
    JSON.stringify(state.features) !== JSON.stringify(state.initialData.features) ||
    state.email !== state.initialData.email ||
    state.whatsapp !== state.initialData.whatsapp ||
    state.telegram !== state.initialData.telegram ||
    state.twitter !== state.initialData.twitter ||
    state.instagram !== state.initialData.instagram ||
    state.facebook !== state.initialData.facebook ||
    state.youtube !== state.initialData.youtube ||
    state.logoFile !== null
  );
};
