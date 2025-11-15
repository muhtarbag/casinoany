/**
 * Notification Form Component
 * Form UI for creating/editing notifications
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, ChevronDown } from 'lucide-react';
import type { NotificationFormData } from './types';

interface NotificationFormProps {
  formData: NotificationFormData;
  onChange: (data: NotificationFormData) => void;
  onSubmit: (data: NotificationFormData) => void;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
  isSubmitting: boolean;
  uploadingImage: boolean;
  isEditing: boolean;
}

export function NotificationForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  onImageUpload,
  isSubmitting,
  uploadingImage,
  isEditing,
}: NotificationFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (field: keyof NotificationFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleArrayChange = (field: 'display_pages' | 'user_segments', value: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onChange({ ...formData, [field]: newArray });
  };

  const handleFormFieldChange = (field: string, value: string) => {
    onChange({
      ...formData,
      form_fields: { ...formData.form_fields, [field]: value },
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    await onImageUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Başlık *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            placeholder="Örn: Hoş Geldin Bonusu!"
          />
        </div>

        <div>
          <Label htmlFor="content">İçerik</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Bildirim içeriği..."
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Görsel</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingImage}
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage ? 'Yükleniyor...' : 'Görsel Yükle'}
                </span>
              </Button>
            </label>
            {formData.image_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleChange('image_url', '')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {formData.image_url && (
            <img src={formData.image_url} alt="Preview" className="mt-2 rounded-lg max-h-40 object-cover" />
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notification_type">Bildirim Tipi</Label>
          <Select
            value={formData.notification_type}
            onValueChange={(value) => handleChange('notification_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popup">Pop-up</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="form">Form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="display_frequency">Gösterim Sıklığı</Label>
          <Select
            value={formData.display_frequency}
            onValueChange={(value) => handleChange('display_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Bir kez</SelectItem>
              <SelectItem value="once_per_session">Oturum başına bir kez</SelectItem>
              <SelectItem value="always">Her zaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Display Pages */}
      <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
        <Label className="text-base font-semibold">📄 Gösterilecek Sayfalar</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'all', label: 'Tüm Sayfalar' },
            { value: 'home', label: 'Ana Sayfa (/)' },
            { value: 'casino-sites', label: 'Casino Siteleri' },
            { value: 'sports-betting', label: 'Spor Bahisleri' },
            { value: 'live-casino', label: 'Canlı Casino' },
            { value: 'blog', label: 'Blog' },
            { value: 'categories', label: 'Kategoriler' },
            { value: 'news', label: 'Haberler' },
          ].map((page) => (
            <div key={page.value} className="flex items-center space-x-2">
              <Checkbox
                id={`page-${page.value}`}
                checked={formData.display_pages.includes(page.value)}
                onCheckedChange={() => handleArrayChange('display_pages', page.value)}
              />
              <label
                htmlFor={`page-${page.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {page.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* User Segments */}
      <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
        <Label className="text-base font-semibold">👥 Hedef Kitle</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'all', label: 'Herkes' },
            { value: 'new_visitor', label: 'Yeni Ziyaretçiler' },
            { value: 'returning_visitor', label: 'Geri Dönen Ziyaretçiler' },
            { value: 'registered', label: 'Kayıtlı Kullanıcılar' },
          ].map((segment) => (
            <div key={segment.value} className="flex items-center space-x-2">
              <Checkbox
                id={`segment-${segment.value}`}
                checked={formData.user_segments.includes(segment.value)}
                onCheckedChange={() => handleArrayChange('user_segments', segment.value)}
              />
              <label
                htmlFor={`segment-${segment.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {segment.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Settings */}
      <Collapsible className="border rounded-lg p-4 space-y-4 bg-muted/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-sm">⚡ Tetikleme Ayarları</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="trigger_type">Tetikleme Türü</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value) => handleChange('trigger_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">⚡ Anında</SelectItem>
                <SelectItem value="time_on_page">⏱️ Sayfada Geçirilen Süre</SelectItem>
                <SelectItem value="scroll_depth">📜 Scroll Derinliği</SelectItem>
                <SelectItem value="exit_intent">🚪 Çıkış Niyeti</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time on Page Condition */}
          {formData.trigger_type === 'time_on_page' && (
            <div>
              <Label htmlFor="time_seconds">Süre (saniye)</Label>
              <Input
                id="time_seconds"
                type="number"
                min="1"
                value={(formData.trigger_conditions as any)?.timeSeconds || 5}
                onChange={(e) => handleChange('trigger_conditions', { timeSeconds: parseInt(e.target.value) || 5 })}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bildirim bu süre sonra gösterilecek
              </p>
            </div>
          )}

          {/* Scroll Depth Condition */}
          {formData.trigger_type === 'scroll_depth' && (
            <div>
              <Label htmlFor="scroll_percentage">Scroll Yüzdesi (%)</Label>
              <Input
                id="scroll_percentage"
                type="number"
                min="1"
                max="100"
                value={(formData.trigger_conditions as any)?.scrollPercentage || 50}
                onChange={(e) => handleChange('trigger_conditions', { scrollPercentage: parseInt(e.target.value) || 50 })}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sayfa bu kadar scroll edildiğinde bildirim gösterilecek
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Form Fields */}
      {formData.notification_type === 'form' && (
        <Collapsible open={true} className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-sm">📝 Form Alanları</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="email_label">E-posta Etiketi</Label>
              <Input
                id="email_label"
                value={formData.form_fields?.email_label || ''}
                onChange={(e) => handleFormFieldChange('email_label', e.target.value)}
                placeholder="E-posta Adresiniz"
              />
            </div>
            <div>
              <Label htmlFor="phone_label">Telefon Etiketi</Label>
              <Input
                id="phone_label"
                value={formData.form_fields?.phone_label || ''}
                onChange={(e) => handleFormFieldChange('phone_label', e.target.value)}
                placeholder="Telefon Numaranız"
              />
            </div>
            <div>
              <Label htmlFor="submit_text">Gönder Butonu</Label>
              <Input
                id="submit_text"
                value={formData.form_fields?.submit_text || ''}
                onChange={(e) => handleFormFieldChange('submit_text', e.target.value)}
                placeholder="Bonus Kodumu Gönder"
              />
            </div>
            <div>
              <Label htmlFor="success_message">Başarı Mesajı</Label>
              <Textarea
                id="success_message"
                value={formData.form_fields?.success_message || ''}
                onChange={(e) => handleFormFieldChange('success_message', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="privacy_text">Gizlilik Metni</Label>
              <Textarea
                id="privacy_text"
                value={formData.form_fields?.privacy_text || ''}
                onChange={(e) => handleFormFieldChange('privacy_text', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="button_color">Buton Rengi</Label>
              <Input
                id="button_color"
                type="color"
                value={formData.form_fields?.button_color || '#ffffff'}
                onChange={(e) => handleFormFieldChange('button_color', e.target.value)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Button Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="button_text">Buton Metni</Label>
          <Input
            id="button_text"
            value={formData.button_text}
            onChange={(e) => handleChange('button_text', e.target.value)}
            placeholder="Detayları Gör"
          />
        </div>
        <div>
          <Label htmlFor="button_url">Buton URL</Label>
          <Input
            id="button_url"
            value={formData.button_url}
            onChange={(e) => handleChange('button_url', e.target.value)}
            placeholder="/kampanyalar"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Başlangıç</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end_date">Bitiş</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="background_color">Arkaplan</Label>
          <Input
            id="background_color"
            type="color"
            value={formData.background_color}
            onChange={(e) => handleChange('background_color', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="text_color">Metin Rengi</Label>
          <Input
            id="text_color"
            type="color"
            value={formData.text_color}
            onChange={(e) => handleChange('text_color', e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Styling */}
      <Collapsible className="border rounded-lg p-4 space-y-4 bg-muted/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-sm">🎨 Gelişmiş Stiller</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Font</Label>
              <Select value={formData.font_family} onValueChange={(v) => handleChange('font_family', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Boyut</Label>
              <Select value={formData.font_size} onValueChange={(v) => handleChange('font_size', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Küçük</SelectItem>
                  <SelectItem value="base">Normal</SelectItem>
                  <SelectItem value="lg">Büyük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Öncelik (0-100)</Label>
          <Input
            id="priority"
            type="number"
            min="0"
            max="100"
            value={formData.priority}
            onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
}
