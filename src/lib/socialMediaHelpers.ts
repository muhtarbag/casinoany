/**
 * Sosyal medya URL'lerini normalize eden yardımcı fonksiyonlar
 */

export function normalizeWhatsAppUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Telefon numarasını temizle
  let phoneNumber = trimmedValue;
  
  // Zaten tam URL ise numarayı çıkar
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // wa.me/PHONE veya send?phone=PHONE formatından numarayı çıkar
    const match = trimmedValue.match(/(?:wa\.me\/|phone=)(\+?[\d]+)/);
    if (match) {
      phoneNumber = match[1];
    } else {
      return null;
    }
  }
  
  // Telefon numarasını tamamen temizle: +, boşluk, tire vb. tüm özel karakterleri kaldır
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  
  // Güvenlik: Telefon numarası uzunluk kontrolü (minimum 5, maksimum 15 rakam)
  // Bu, geçersiz veya kötü niyetli girişleri engeller
  if (cleanNumber.length < 5 || cleanNumber.length > 15) {
    return null;
  }
  
  // Güvenlik: Sadece rakam içerdiğinden emin ol
  if (!/^\d+$/.test(cleanNumber)) {
    return null;
  }
  
  // wa.me formatını kullan - WhatsApp'ın resmi ve en güvenilir kısa linki
  // + karakteri KULLANMA, sadece rakamlar
  return `https://wa.me/${cleanNumber}`;
}

export function normalizeTelegramUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // Boş string kontrolü
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  
  // Zaten tam URL ise güvenlik kontrolü yap
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Sadece t.me domainini kabul et
    if (trimmedValue.includes('t.me/')) {
      return trimmedValue;
    }
    return null;
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
  
  // Zaten tam URL ise güvenlik kontrolü yap
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Sadece twitter.com ve x.com domainlerini kabul et
    if (trimmedValue.includes('twitter.com/') || trimmedValue.includes('x.com/')) {
      return trimmedValue;
    }
    return null;
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
  
  // Zaten tam URL ise güvenlik kontrolü yap
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Sadece instagram.com domainini kabul et
    if (trimmedValue.includes('instagram.com/')) {
      return trimmedValue;
    }
    return null;
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
  
  // Zaten tam URL ise güvenlik kontrolü yap
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Sadece facebook.com ve fb.com domainlerini kabul et
    if (trimmedValue.includes('facebook.com/') || trimmedValue.includes('fb.com/')) {
      return trimmedValue;
    }
    return null;
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
  
  // Zaten tam URL ise güvenlik kontrolü yap
  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Sadece youtube.com ve youtu.be domainlerini kabul et
    if (trimmedValue.includes('youtube.com/') || trimmedValue.includes('youtu.be/')) {
      return trimmedValue;
    }
    return null;
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
