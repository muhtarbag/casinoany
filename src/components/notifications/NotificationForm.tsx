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
import { Upload, X } from 'lucide-react';
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
                size="icon"
                onClick={() => handleChange('image_url', '')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="mt-2 h-32 w-auto rounded-md object-cover"
            />
          )}
        </div>
      </div>

      {/* Type & Behavior */}
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
              <SelectItem value="toast">Toast</SelectItem>
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

      {/* Buttons */}
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
          <Label htmlFor="button_url">Buton URL'si</Label>
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
          <Label htmlFor="start_date">Başlangıç Tarihi</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="end_date">Bitiş Tarihi</Label>
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
          <Label htmlFor="background_color">Arkaplan Rengi</Label>
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
      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold">Gelişmiş Stil Seçenekleri</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="font_family">Font</Label>
            <Select
              value={formData.font_family}
              onValueChange={(value) => handleChange('font_family', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="font_size">Yazı Boyutu</Label>
            <Select
              value={formData.font_size}
              onValueChange={(value) => handleChange('font_size', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">Çok Küçük</SelectItem>
                <SelectItem value="sm">Küçük</SelectItem>
                <SelectItem value="base">Normal</SelectItem>
                <SelectItem value="lg">Büyük</SelectItem>
                <SelectItem value="xl">Çok Büyük</SelectItem>
                <SelectItem value="2xl">Ekstra Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="border_radius">Köşe Yuvarlaklığı</Label>
            <Select
              value={formData.border_radius}
              onValueChange={(value) => handleChange('border_radius', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                <SelectItem value="sm">Az</SelectItem>
                <SelectItem value="md">Orta</SelectItem>
                <SelectItem value="lg">Çok</SelectItem>
                <SelectItem value="xl">Ekstra</SelectItem>
                <SelectItem value="2xl">Maksimum</SelectItem>
                <SelectItem value="full">Tam Yuvarlak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="max_width">Maksimum Genişlik</Label>
            <Select
              value={formData.max_width}
              onValueChange={(value) => handleChange('max_width', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Küçük (384px)</SelectItem>
                <SelectItem value="md">Orta (448px)</SelectItem>
                <SelectItem value="lg">Büyük (512px)</SelectItem>
                <SelectItem value="xl">Çok Büyük (576px)</SelectItem>
                <SelectItem value="2xl">Ekstra Büyük (672px)</SelectItem>
                <SelectItem value="full">Tam Genişlik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="padding">İç Boşluk</Label>
            <Select
              value={formData.padding}
              onValueChange={(value) => handleChange('padding', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Sıkı</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Rahat</SelectItem>
                <SelectItem value="loose">Geniş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shadow_size">Gölge</Label>
            <Select
              value={formData.shadow_size}
              onValueChange={(value) => handleChange('shadow_size', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                <SelectItem value="sm">Küçük</SelectItem>
                <SelectItem value="md">Orta</SelectItem>
                <SelectItem value="lg">Büyük</SelectItem>
                <SelectItem value="xl">Çok Büyük</SelectItem>
                <SelectItem value="2xl">Ekstra Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="border_color">Kenarlık Rengi</Label>
            <Input
              id="border_color"
              type="color"
              value={formData.border_color}
              onChange={(e) => handleChange('border_color', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="border_width">Kenarlık Kalınlığı</Label>
            <Select
              value={formData.border_width}
              onValueChange={(value) => handleChange('border_width', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Yok</SelectItem>
                <SelectItem value="1">İnce (1px)</SelectItem>
                <SelectItem value="2">Orta (2px)</SelectItem>
                <SelectItem value="4">Kalın (4px)</SelectItem>
                <SelectItem value="8">Çok Kalın (8px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Status & Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>

        <div className="w-24">
          <Label htmlFor="priority">Öncelik</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
}
