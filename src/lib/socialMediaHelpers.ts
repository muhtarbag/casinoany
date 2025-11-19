/**
 * Sosyal medya URL'lerini normalize eden yardımcı fonksiyonlar
 */

export function normalizeWhatsAppUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise, + karakterini kaldırıp kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // URL'deki + karakterini kaldır (WhatsApp API bunu kabul etmiyor)
    return value.replace(/\+/g, '');
  }
  
  // Telefon numarası ise wa.me formatına çevir
  // + karakterini ve boşlukları temizle
  const cleanNumber = value.replace(/[\s+]/g, '');
  return `https://wa.me/${cleanNumber}`;
}

export function normalizeTelegramUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise direkt kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  // @ ile başlıyorsa kaldır
  const username = value.startsWith('@') ? value.substring(1) : value;
  return `https://t.me/${username}`;
}

export function normalizeTwitterUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise direkt kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  // @ ile başlıyorsa kaldır
  const username = value.startsWith('@') ? value.substring(1) : value;
  return `https://x.com/${username}`;
}

export function normalizeInstagramUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise direkt kullan (www dahil aynen bırak)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  // @ ile başlıyorsa kaldır
  const username = value.startsWith('@') ? value.substring(1) : value;
  return `https://www.instagram.com/${username}`;
}

export function normalizeFacebookUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise direkt kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  return `https://www.facebook.com/${value}`;
}

export function normalizeYouTubeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Zaten tam URL ise direkt kullan (www dahil aynen bırak)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  
  // @ ile başlıyorsa YouTube handle formatı
  if (value.startsWith('@')) {
    return `https://www.youtube.com/${value}`;
  }
  
  // Kanal ID veya kullanıcı adı
  return `https://www.youtube.com/${value}`;
}
