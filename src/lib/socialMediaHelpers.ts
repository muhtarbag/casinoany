/**
 * Sosyal medya URL'lerini normalize eden yardımcı fonksiyonlar
 */

export function normalizeWhatsAppUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi WhatsApp veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // Telefon numarasını temizle
  const phoneNumber = trimmedValue;
  
  // Telefon numarasını tamamen temizle: +, boşluk, tire vb. tüm özel karakterleri kaldır
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  
  // Güvenlik: Telefon numarası uzunluk kontrolü (minimum 5, maksimum 15 rakam)
  if (cleanNumber.length < 5 || cleanNumber.length > 15) {
    return null;
  }
  
  // Güvenlik: Sadece rakam içerdiğinden emin ol
  if (!/^\d+$/.test(cleanNumber)) {
    return null;
  }
  
  // wa.me formatını kullan - WhatsApp'ın resmi ve en güvenilir kısa linki
  return `https://wa.me/${cleanNumber}`;
}

export function normalizeTelegramUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi Telegram veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // @ ile başlıyorsa kaldır
  const username = trimmedValue.startsWith('@') ? trimmedValue.substring(1) : trimmedValue;
  
  // Güvenlik: Kullanıcı adı validasyonu (5-32 karakter, sadece alfanumerik ve alt çizgi)
  if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
    return null;
  }
  
  return `https://t.me/${username}`;
}

export function normalizeTwitterUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi Twitter/X veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // @ ile başlıyorsa kaldır
  const username = trimmedValue.startsWith('@') ? trimmedValue.substring(1) : trimmedValue;
  
  // Güvenlik: Kullanıcı adı validasyonu (1-15 karakter, sadece alfanumerik ve alt çizgi)
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
    return null;
  }
  
  return `https://x.com/${username}`;
}

export function normalizeInstagramUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi Instagram veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // @ ile başlıyorsa kaldır
  const username = trimmedValue.startsWith('@') ? trimmedValue.substring(1) : trimmedValue;
  
  // Güvenlik: Kullanıcı adı validasyonu (1-30 karakter, sadece alfanumerik, nokta ve alt çizgi)
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return null;
  }
  
  return `https://www.instagram.com/${username}`;
}

export function normalizeFacebookUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi Facebook veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // Güvenlik: Kullanıcı adı/sayfa validasyonu (5-50 karakter, alfanumerik, nokta ve alt çizgi)
  if (!/^[a-zA-Z0-9._-]{5,50}$/.test(trimmedValue)) {
    return null;
  }
  
  return `https://www.facebook.com/${trimmedValue}`;
}

export function normalizeYouTubeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise (resmi YouTube veya özel kısa link)
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // XSS koruması: Sadece güvenli karakterler
    if (!/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(trimmedValue)) {
      return null;
    }
    return trimmedValue;
  }
  
  // @ ile başlıyorsa YouTube handle formatı
  if (trimmedValue.startsWith('@')) {
    const handle = trimmedValue.substring(1);
    // Güvenlik: Handle validasyonu (3-30 karakter, alfanumerik, nokta, alt çizgi ve tire)
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(handle)) {
      return null;
    }
    return `https://www.youtube.com/@${handle}`;
  }
  
  // Kanal ID veya kullanıcı adı validasyonu
  if (!/^[a-zA-Z0-9._-]{3,100}$/.test(trimmedValue)) {
    return null;
  }
  
  return `https://www.youtube.com/${trimmedValue}`;
}
