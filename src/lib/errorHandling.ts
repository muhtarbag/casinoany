import { toast } from "@/hooks/use-toast";

interface ErrorHandlerOptions {
  title?: string;
  description?: string;
  showToast?: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SuccessOptions {
  title?: string;
  description: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
  const {
    title = "Bir Hata Oluştu",
    description,
    showToast = true,
    duration = 5000,
    action,
  } = options;

  if (import.meta.env.DEV) {
    console.error('Error:', error);
  }

  let errorMessage = description || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";

  // Parse different error types
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Handle Supabase errors
    const supabaseError = error as any;
    if (supabaseError.message) {
      errorMessage = supabaseError.message;
    } else if (supabaseError.error_description) {
      errorMessage = supabaseError.error_description;
    }
  }

  if (showToast) {
    toast({
      variant: "destructive",
      title,
      description: errorMessage,
      duration,
      action: action ? {
        altText: action.label,
        onClick: action.onClick,
      } as any : undefined,
    });
  }

  return errorMessage;
};

export const handleSuccess = (options: SuccessOptions | string, legacyTitle?: string) => {
  // Support both old and new API
  if (typeof options === 'string') {
    toast({
      title: legacyTitle || "Başarılı",
      description: options,
      duration: 3000,
      className: "border-success bg-success/10",
    });
    return;
  }

  const { title = "Başarılı", description, duration = 3000, action } = options;
  
  toast({
    title,
    description,
    duration,
    className: "border-success bg-success/10",
    action: action ? {
      altText: action.label,
      onClick: action.onClick,
    } as any : undefined,
  });
};

export const handleInfo = (message: string, title = "Bilgi", duration = 4000) => {
  toast({
    title,
    description: message,
    duration,
    className: "border-info bg-info/10",
  });
};

export const handleWarning = (message: string, title = "Uyarı", duration = 4000) => {
  toast({
    title,
    description: message,
    duration,
    className: "border-warning bg-warning/10",
  });
};

export const handleLoading = (message: string, title = "Yükleniyor...") => {
  return toast({
    title,
    description: message,
    duration: Infinity, // Won't auto-dismiss
    className: "border-muted",
  });
};

export const logger = {
  logError: (message: string, error?: Error | unknown) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  logWarning: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARNING] ${message}`, data);
    }
  },
  logInfo: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, data);
    }
  }
};
