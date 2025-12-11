/**
 * Exit Intent Popup Templates
 * Pre-designed templates for exit intent notifications
 */

export interface ExitIntentTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: {
    title: string;
    content: string;
    notification_type: 'popup' | 'banner' | 'modal';
    button_text: string;
    button_url: string;
    background_color: string;
    text_color: string;
    trigger_type: 'exit_intent';
    display_frequency: 'session' | 'daily' | 'once';
    display_pages: string[];
    user_segments: string[];
    font_family?: string;
    font_size?: string;
    border_radius?: string;
    max_width?: string;
    padding?: string;
    shadow_size?: string;
  };
}

export const exitIntentTemplates: ExitIntentTemplate[] = [
  {
    id: 'bonus_alert',
    name: '🎁 Bonus Kaçmasın',
    description: 'Kullanıcı ayrılmadan önce bonus teklifi göster',
    preview: '🎁 Bekle! Bonus Kaçmasın!',
    config: {
      title: '🎁 Bekle! Bonus Kaçmasın!',
      content: 'Ayrılmadan önce harika bonusumuzu kaçırma! Hemen üye ol ve %100 hoş geldin bonusunu kazan.',
      notification_type: 'modal',
      button_text: 'Bonusu Hemen Al',
      button_url: '{affiliate_link}',
      background_color: '#1a1a1a',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'session',
      display_pages: ['site_detail'],
      user_segments: ['all'],
      font_size: 'lg',
      border_radius: 'xl',
      max_width: 'md',
      padding: 'relaxed',
      shadow_size: '2xl',
    },
  },
  {
    id: 'limited_offer',
    name: '⏰ Sınırlı Süre Teklifi',
    description: 'Aciliyet hissi yaratarak bonus teklifini vurgula',
    preview: '⏰ Son Dakika Fırsatı!',
    config: {
      title: '⏰ Son Dakika Fırsatı!',
      content: 'Bu teklif sadece bugün geçerli! Şimdi kayıt ol ve özel bonusunu kazan. Fırsatı kaçırma!',
      notification_type: 'modal',
      button_text: 'Hemen Kayıt Ol',
      button_url: '{affiliate_link}',
      background_color: '#dc2626',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'daily',
      display_pages: ['site_detail'],
      user_segments: ['new_visitor', 'returning_visitor'],
      font_size: 'xl',
      border_radius: '2xl',
      max_width: 'lg',
      padding: 'loose',
      shadow_size: '2xl',
    },
  },
  {
    id: 'exclusive_vip',
    name: '👑 VIP Özel Teklif',
    description: 'Özel hissettiren VIP temalı bonus teklifi',
    preview: '👑 Sana Özel VIP Bonus',
    config: {
      title: '👑 Sana Özel VIP Bonus',
      content: 'Değerli kullanıcılarımıza özel! VIP bonusunu almak için hemen üye ol.',
      notification_type: 'modal',
      button_text: 'VIP Bonusu Al',
      button_url: '{affiliate_link}',
      background_color: '#7c3aed',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'once',
      display_pages: ['site_detail'],
      user_segments: ['returning_visitor'],
      font_size: 'lg',
      border_radius: 'xl',
      max_width: 'md',
      padding: 'relaxed',
      shadow_size: 'xl',
    },
  },
  {
    id: 'trust_signal',
    name: '✓ Güven Odaklı',
    description: 'Güvenilirlik vurgulayan, sakin ton',
    preview: '✓ Güvenilir Bahis Sitesi',
    config: {
      title: '✓ Türkiye\'nin En Güvenilir Bahis Sitesi',
      content: '10.000+ mutlu üyemiz var! Lisanslı ve güvenilir. Hemen üye ol, güvenle oyna.',
      notification_type: 'modal',
      button_text: 'Güvenle Başla',
      button_url: '{affiliate_link}',
      background_color: '#16a34a',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'session',
      display_pages: ['site_detail'],
      user_segments: ['all'],
      font_size: 'base',
      border_radius: 'lg',
      max_width: 'md',
      padding: 'normal',
      shadow_size: 'lg',
    },
  },
  {
    id: 'social_proof',
    name: '🔥 Sosyal Kanıt',
    description: 'Diğer kullanıcıların aktivitesini göster',
    preview: '🔥 2.500+ Kişi Bugün Kayıt Oldu',
    config: {
      title: '🔥 2.500+ Kişi Bugün Kayıt Oldu!',
      content: 'Sen de onlara katıl! Binlerce kullanıcı bu bonuslardan yararlanıyor.',
      notification_type: 'modal',
      button_text: 'Ben de Katılıyorum',
      button_url: '{affiliate_link}',
      background_color: '#ea580c',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'session',
      display_pages: ['site_detail'],
      user_segments: ['new_visitor'],
      font_size: 'lg',
      border_radius: 'xl',
      max_width: 'md',
      padding: 'relaxed',
      shadow_size: 'xl',
    },
  },
  {
    id: 'comparison',
    name: '📊 Karşılaştırma',
    description: 'Site avantajlarını karşılaştırmalı göster',
    preview: '📊 Neden Bu Siteyi Seçmelisin?',
    config: {
      title: '📊 Neden Bu Siteyi Seçmelisin?',
      content: '✓ En yüksek bonus oranları\n✓ 7/24 canlı destek\n✓ Hızlı para çekme\n✓ Güvenli ödeme',
      notification_type: 'modal',
      button_text: 'Avantajları Gör',
      button_url: '{affiliate_link}',
      background_color: '#0891b2',
      text_color: '#ffffff',
      trigger_type: 'exit_intent',
      display_frequency: 'daily',
      display_pages: ['site_detail'],
      user_segments: ['all'],
      font_size: 'base',
      border_radius: 'lg',
      max_width: 'lg',
      padding: 'normal',
      shadow_size: 'lg',
    },
  },
  {
    id: 'minimal_clean',
    name: '⚪ Minimal & Temiz',
    description: 'Sade ve profesyonel görünüm',
    preview: 'Bonus Fırsatını Kaçırma',
    config: {
      title: 'Bonus Fırsatını Kaçırma',
      content: 'Hemen üye ol, bonusunu al.',
      notification_type: 'modal',
      button_text: 'Devam Et',
      button_url: '{affiliate_link}',
      background_color: '#ffffff',
      text_color: '#1f2937',
      trigger_type: 'exit_intent',
      display_frequency: 'session',
      display_pages: ['site_detail'],
      user_segments: ['all'],
      font_size: 'base',
      border_radius: 'md',
      max_width: 'sm',
      padding: 'tight',
      shadow_size: 'md',
    },
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ExitIntentTemplate | undefined {
  return exitIntentTemplates.find(t => t.id === id);
}

/**
 * Get all template names for dropdown
 */
export function getTemplateOptions() {
  return exitIntentTemplates.map(t => ({
    value: t.id,
    label: t.name,
    description: t.description,
  }));
}
