import { BlogManagementState, BlogManagementAction, BlogFormData } from './types/blogManagementTypes';

// Initial form data
const initialFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  category: '',
  tags: '',
  read_time: '5',
  is_published: false,
  primary_site_id: '',
  category_id: '',
};

// Initial state factory
export const createInitialState = (): BlogManagementState => ({
  isEditing: false,
  editingId: null,
  imageFile: null,
  imagePreview: null,
  selectedSites: [],
  primarySiteId: '',
  isAiLoading: false,
  aiTopic: '',
  isPreviewOpen: false,
  formData: initialFormData,
});

// Reducer function
export const blogManagementReducer = (
  state: BlogManagementState,
  action: BlogManagementAction
): BlogManagementState => {
  switch (action.type) {
    case 'SET_EDITING':
      return {
        ...state,
        isEditing: action.isEditing,
        editingId: action.editingId,
      };

    case 'SET_IMAGE':
      return {
        ...state,
        imageFile: action.file,
        imagePreview: action.preview,
      };

    case 'CLEAR_IMAGE':
      return {
        ...state,
        imageFile: null,
        imagePreview: null,
      };

    case 'SET_SELECTED_SITES':
      return {
        ...state,
        selectedSites: action.sites,
      };

    case 'TOGGLE_SITE_SELECTION': {
      const isSelected = state.selectedSites.includes(action.siteId);
      return {
        ...state,
        selectedSites: isSelected
          ? state.selectedSites.filter(id => id !== action.siteId)
          : [...state.selectedSites, action.siteId],
      };
    }

    case 'SET_PRIMARY_SITE':
      return {
        ...state,
        primarySiteId: action.siteId,
        formData: {
          ...state.formData,
          primary_site_id: action.siteId,
        },
      };

    case 'SET_AI_LOADING':
      return {
        ...state,
        isAiLoading: action.loading,
      };

    case 'SET_AI_TOPIC':
      return {
        ...state,
        aiTopic: action.topic,
      };

    case 'SET_PREVIEW_OPEN':
      return {
        ...state,
        isPreviewOpen: action.open,
      };

    case 'SET_FORM_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };

    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.data,
        },
      };

    case 'LOAD_POST_DATA': {
      const post = action.post;
      return {
        ...state,
        formData: {
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          meta_keywords: Array.isArray(post.meta_keywords) ? post.meta_keywords.join(', ') : '',
          category: post.category || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          read_time: post.read_time?.toString() || '5',
          is_published: post.is_published || false,
          primary_site_id: post.primary_site_id || '',
          category_id: post.category_id || '',
        },
        imagePreview: post.featured_image || null,
        selectedSites: action.relatedSiteIds,
        primarySiteId: post.primary_site_id || '',
      };
    }

    case 'RESET_FORM':
      return createInitialState();

    default:
      return state;
  }
};
