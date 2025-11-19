// State interface for Blog Management
export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  category: string;
  tags: string;
  read_time: string;
  is_published: boolean;
  scheduled_publish_at: string; // Zamanlı yayınlama tarihi
  primary_site_id: string;
  category_id: string;
}

export interface BlogManagementState {
  // Editing state
  isEditing: boolean;
  editingId: string | null;
  
  // Image state
  imageFile: File | null;
  imagePreview: string | null;
  
  // Site selection
  selectedSites: string[];
  primarySiteId: string;
  
  // AI generation
  isAiLoading: boolean;
  aiTopic: string;
  
  // Preview
  isPreviewOpen: boolean;
  
  // Form data
  formData: BlogFormData;
}

// Action types
export type BlogManagementAction =
  | { type: 'SET_EDITING'; isEditing: boolean; editingId: string | null }
  | { type: 'SET_IMAGE'; file: File; preview: string }
  | { type: 'CLEAR_IMAGE' }
  | { type: 'SET_SELECTED_SITES'; sites: string[] }
  | { type: 'TOGGLE_SITE_SELECTION'; siteId: string }
  | { type: 'SET_PRIMARY_SITE'; siteId: string }
  | { type: 'SET_AI_LOADING'; loading: boolean }
  | { type: 'SET_AI_TOPIC'; topic: string }
  | { type: 'SET_PREVIEW_OPEN'; open: boolean }
  | { type: 'SET_FORM_FIELD'; field: keyof BlogFormData; value: any }
  | { type: 'SET_FORM_DATA'; data: Partial<BlogFormData> }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_POST_DATA'; post: any; relatedSiteIds: string[] };
