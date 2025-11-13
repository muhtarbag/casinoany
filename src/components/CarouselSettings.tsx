import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ANIMATION_TYPES = [
  { value: 'slide', label: 'Kaydırma (Slide)', description: 'Klasik yan yana kaydırma animasyonu' },
  { value: 'fade', label: 'Solma (Fade)', description: 'Yumuşak geçiş, kartlar belirip soluyor' },
  { value: 'zoom', label: 'Yakınlaştırma (Zoom)', description: 'Kartlar büyüyerek/küçülerek değişiyor' },
  { value: 'flip', label: '3D Çevirme (Flip)', description: 'Kartlar 3D dönerek değişiyor' },
];

const DURATION_OPTIONS = [
  { value: 2000, label: '2 saniye' },
  { value: 2500, label: '2.5 saniye' },
  { value: 3000, label: '3 saniye' },
  { value: 3500, label: '3.5 saniye' },
  { value: 4000, label: '4 saniye' },
  { value: 5000, label: '5 saniye' },
  { value: 7500, label: '7.5 saniye' },
  { value: 10000, label: '10 saniye' },
];

export const CarouselSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAnimation, setSelectedAnimation] = useState<string>('slide');
  const [duration, setDuration] = useState<number>(2500);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data: animData, error: animError } = await (supabase as any)
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'carousel_animation_type')
        .single();
      
      if (animError) throw animError;
      
      const { data: durationData, error: durationError } = await (supabase as any)
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'carousel_auto_scroll_duration')
        .single();
      
      if (durationError) throw durationError;
      
      setSelectedAnimation((animData as any).setting_value);
      setDuration(parseInt((durationData as any).setting_value));
      
      return { animation: animData, duration: durationData };
    },
  });

  const updateAnimationMutation = useMutation({
    mutationFn: async (animationType: string) => {
      const { error } = await (supabase as any)
        .from('site_settings')
        .update({ setting_value: animationType, updated_at: new Date().toISOString() })
        .eq('setting_key', 'carousel_animation_type');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-settings'] });
      toast({
        title: 'Başarılı!',
        description: 'Carousel animasyonu güncellendi.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Ayar güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
      console.error('Error updating carousel animation:', error);
    },
  });

  const updateDurationMutation = useMutation({
    mutationFn: async (newDuration: number) => {
      const { error } = await (supabase as any)
        .from('site_settings')
        .update({ setting_value: newDuration.toString(), updated_at: new Date().toISOString() })
        .eq('setting_key', 'carousel_auto_scroll_duration');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-settings'] });
      toast({
        title: 'Başarılı!',
        description: 'Carousel geçiş süresi güncellendi.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Ayar güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
      console.error('Error updating carousel duration:', error);
    },
  });

  const handleAnimationChange = (value: string) => {
    setSelectedAnimation(value);
    updateAnimationMutation.mutate(value);
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    updateDurationMutation.mutate(newDuration);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carousel Animasyonu</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carousel Animasyonu</CardTitle>
        <CardDescription>
          Ana sayfadaki öne çıkan siteler carousel'inin animasyon stilini seçin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="animation-type">Animasyon Tipi</Label>
          <Select
            value={selectedAnimation}
            onValueChange={handleAnimationChange}
            disabled={updateAnimationMutation.isPending}
          >
            <SelectTrigger id="animation-type">
              <SelectValue placeholder="Animasyon seçin" />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration-slider">Otomatik Geçiş Süresi</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="duration-slider"
                min={2000}
                max={10000}
                step={500}
                value={[duration]}
                onValueChange={handleDurationChange}
                disabled={updateDurationMutation.isPending}
                className="flex-1"
              />
              <span className="text-sm font-medium w-20 text-right">
                {(duration / 1000).toFixed(1)}s
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mobil cihazlarda kartların otomatik olarak değişme süresi
            </p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <p className="text-sm font-medium">Mevcut Ayarlar:</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Animasyon: {ANIMATION_TYPES.find(t => t.value === selectedAnimation)?.label}</p>
            <p>• Geçiş Süresi: {(duration / 1000).toFixed(1)} saniye</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
