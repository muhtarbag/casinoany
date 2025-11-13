import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ANIMATION_TYPES = [
  { value: 'slide', label: 'Kaydırma (Slide)', description: 'Klasik yan yana kaydırma animasyonu' },
  { value: 'fade', label: 'Solma (Fade)', description: 'Yumuşak geçiş, kartlar belirip soluyor' },
  { value: 'zoom', label: 'Yakınlaştırma (Zoom)', description: 'Kartlar büyüyerek/küçülerek değişiyor' },
  { value: 'flip', label: '3D Çevirme (Flip)', description: 'Kartlar 3D dönerek değişiyor' },
];

export const CarouselSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAnimation, setSelectedAnimation] = useState<string>('slide');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'carousel_animation_type')
        .single();
      
      if (error) throw error;
      setSelectedAnimation(data.setting_value);
      return data;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (animationType: string) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: animationType, updated_at: new Date().toISOString() })
        .eq('setting_key', 'carousel_animation_type');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-settings'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
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

  const handleAnimationChange = (value: string) => {
    setSelectedAnimation(value);
    updateSettingMutation.mutate(value);
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
            disabled={updateSettingMutation.isPending}
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
        
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <p className="text-sm font-medium">Seçili Animasyon:</p>
          <p className="text-sm text-muted-foreground">
            {ANIMATION_TYPES.find(t => t.value === selectedAnimation)?.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
