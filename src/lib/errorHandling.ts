import { toast } from "@/hooks/use-toast";

interface ErrorHandlerOptions {
  title?: string;
  description?: string;
  showToast?: boolean;
}

export const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
  const {
    title = "Bir Hata Oluştu",
    description,
    showToast = true,
  } = options;

  console.error('Error:', error);

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
    });
  }

  return errorMessage;
};

export const handleSuccess = (message: string, title = "Başarılı") => {
  toast({
    title,
    description: message,
  });
};

export const handleInfo = (message: string, title = "Bilgi") => {
  toast({
    title,
    description: message,
  });
};

export const handleWarning = (message: string, title = "Uyarı") => {
  toast({
    title,
    description: message,
    variant: "default",
  });
};
