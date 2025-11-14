import { toast } from 'sonner';

// User-friendly error message mapping
export const ERROR_MESSAGES: Record<string, string> = {
  // Database errors
  'duplicate key value violates unique constraint': 'Bu kayıt zaten mevcut. Lütfen farklı bir değer deneyin.',
  'violates foreign key constraint': 'Bu kayıt başka yerlerde kullanılıyor ve silinemez.',
  'null value in column': 'Zorunlu alanlar boş bırakılamaz.',
  'violates check constraint': 'Geçersiz değer. Lütfen kontrol edip tekrar deneyin.',
  
  // Network errors
  'Failed to fetch': 'İnternet bağlantısı koptu. Lütfen bağlantınızı kontrol edin.',
  'NetworkError': 'İnternet bağlantısı sorunlu. Lütfen tekrar deneyin.',
  'timeout': 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
  
  // Auth errors
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
  'User already registered': 'Bu e-posta adresi zaten kayıtlı.',
  'Email not confirmed': 'Lütfen e-postanızı onaylayın.',
  
  // File upload errors
  'File too large': 'Dosya çok büyük. Maksimum 5MB olmalı.',
  'Invalid file type': 'Geçersiz dosya türü. Sadece resim dosyaları kabul edilir.',
  
  // Generic
  'Permission denied': 'Bu işlem için yetkiniz yok.',
  'Not found': 'Kayıt bulunamadı.',
};

/**
 * Convert technical error message to user-friendly Turkish message
 */
export function getUserFriendlyError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Bilinmeyen hata';
  
  // Check if we have a mapped message
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If no match, return a generic friendly message
  return `Bir hata oluştu: ${errorMessage}`;
}

/**
 * Enhanced success toast with configurable duration
 */
export function showSuccessToast(
  message: string,
  options?: {
    duration?: number;
    onUndo?: () => void;
    undoLabel?: string;
  }
) {
  return toast.success(message, {
    duration: options?.duration || 5000, // 5 seconds default (was 3)
    action: options?.onUndo ? {
      label: options.undoLabel || 'Geri Al',
      onClick: options.onUndo,
    } : undefined,
  });
}

/**
 * Enhanced error toast with user-friendly messages and longer duration
 */
export function showErrorToast(
  error: any,
  customMessage?: string,
  options?: {
    duration?: number;
  }
) {
  const friendlyMessage = customMessage || getUserFriendlyError(error);
  
  return toast.error(friendlyMessage, {
    duration: options?.duration || 10000, // 10 seconds default (was 5)
    description: process.env.NODE_ENV === 'development' 
      ? error?.message || error?.toString() 
      : undefined, // Show technical error in dev mode
  });
}

/**
 * Info toast with standard duration
 */
export function showInfoToast(
  message: string,
  options?: {
    duration?: number;
    description?: string;
  }
) {
  return toast.info(message, {
    duration: options?.duration || 5000,
    description: options?.description,
  });
}

/**
 * Loading toast that can be updated
 */
export function showLoadingToast(message: string) {
  return toast.loading(message, {
    duration: Infinity, // Until manually dismissed or updated
  });
}

/**
 * Update an existing toast (useful for loading states)
 */
export function updateToast(
  toastId: string | number,
  type: 'success' | 'error' | 'info',
  message: string,
  options?: {
    duration?: number;
  }
) {
  if (type === 'success') {
    toast.success(message, {
      id: toastId,
      duration: options?.duration || 5000,
    });
  } else if (type === 'error') {
    toast.error(message, {
      id: toastId,
      duration: options?.duration || 10000,
    });
  } else {
    toast.info(message, {
      id: toastId,
      duration: options?.duration || 5000,
    });
  }
}
