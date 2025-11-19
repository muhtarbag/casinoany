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
  
  // Zaten tam URL ise direkt kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // www kullanımını kaldır
    return value.replace('www.instagram.com', 'instagram.com');
  }
  
  // @ ile başlıyorsa kaldır
  const username = value.startsWith('@') ? value.substring(1) : value;
  return `https://instagram.com/${username}`;
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
  
  // Zaten tam URL ise direkt kullan
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // www.youtube.com yerine youtube.com kullan (bazı ağlarda www engelli olabilir)
    return value.replace('www.youtube.com', 'youtube.com');
  }
  
  // @ ile başlıyorsa YouTube handle formatı
  if (value.startsWith('@')) {
    return `https://youtube.com/${value}`;
  }
  
  // Kanal ID veya kullanıcı adı
  return `https://youtube.com/${value}`;
}
