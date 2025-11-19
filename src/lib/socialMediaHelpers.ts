/**
 * Sosyal medya URL'lerini normalize eden yardımcı fonksiyonlar
 */

export function normalizeWhatsAppUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Telefon numarasını temizle
  let phoneNumber = value;
  
  // Zaten tam URL ise numarayı çıkar
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // wa.me/PHONE veya web.whatsapp.com/send?phone=PHONE formatından numarayı çıkar
    const match = value.match(/(?:wa\.me\/|phone=)(\+?[\d]+)/);
    if (match) {
      phoneNumber = match[1];
    } else {
      return null;
    }
  }
  
  // Telefon numarasını temizle: + karakterini ve boşlukları kaldır
  const cleanNumber = phoneNumber.replace(/[\s+]/g, '');
  
  // web.whatsapp.com formatını kullan (daha güvenilir, engelleme riski düşük)
  return `https://web.whatsapp.com/send?phone=${cleanNumber}`;
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
