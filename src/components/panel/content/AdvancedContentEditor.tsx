import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Type, 
  Layout, 
  Box,
  Sparkles,
  Eye,
  Undo2,
  Code2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StylePreview } from './StylePreview';

interface BlockStyles {
  prosConsBlock?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    shadow?: string;
  };
  expertReviewBlock?: {
    backgroundColor?: string;
    accentColor?: string;
    fontSize?: number;
    lineHeight?: number;
  };
  verdictBlock?: {
    backgroundColor?: string;
    highlightColor?: string;
    borderStyle?: string;
  };
  gameCategories?: {
    cardStyle?: string;
    hoverEffect?: string;
    iconSize?: number;
  };
  guides?: {
    backgroundColor?: string;
    stepNumberColor?: string;
    spacing?: number;
  };
}

interface AdvancedContentEditorProps {
  blockStyles: BlockStyles;
  onStylesChange: (styles: BlockStyles) => void;
}

export function AdvancedContentEditor({ blockStyles, onStylesChange }: AdvancedContentEditorProps) {
  const [localStyles, setLocalStyles] = useState<BlockStyles>(blockStyles || {});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setLocalStyles(blockStyles || {});
  }, [blockStyles]);

  const updateBlockStyle = (
    block: keyof BlockStyles,
    property: string,
    value: any
  ) => {
    const newStyles = {
      ...localStyles,
      [block]: {
        ...(localStyles[block] || {}),
        [property]: value,
      },
    };
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const resetBlock = (block: keyof BlockStyles) => {
    const newStyles = { ...localStyles };
    delete newStyles[block];
    setLocalStyles(newStyles);
    onStylesChange(newStyles);
  };

  const colorPresets = [
    { name: 'Varsayılan', primary: '#6366f1', secondary: '#8b5cf6' },
    { name: 'Deniz Mavisi', primary: '#0ea5e9', secondary: '#06b6d4' },
    { name: 'Yeşil', primary: '#10b981', secondary: '#059669' },
    { name: 'Turuncu', primary: '#f97316', secondary: '#ea580c' },
    { name: 'Pembe', primary: '#ec4899', secondary: '#db2777' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gelişmiş Tasarım Düzenleyici</h3>
          <p className="text-sm text-muted-foreground">
            Her blok için özel stil ve tasarım ayarları yapın
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Code2 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Düzenleme' : 'Önizleme'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <StylePreview blockStyles={localStyles} />
      ) : (
        <>
          {/* Quick Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Hızlı Renk Temaları
          </CardTitle>
          <CardDescription>
            Tüm bloklar için hazır renk şemalarını uygulayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => {
                  const newStyles: BlockStyles = {
                    prosConsBlock: {
                      ...localStyles.prosConsBlock,
                      borderColor: preset.primary,
                    },
                    expertReviewBlock: {
                      ...localStyles.expertReviewBlock,
                      accentColor: preset.primary,
                    },
                    verdictBlock: {
                      ...localStyles.verdictBlock,
                      highlightColor: preset.primary,
                    },
                    gameCategories: localStyles.gameCategories,
                    guides: {
                      ...localStyles.guides,
                      stepNumberColor: preset.primary,
                    },
                  };
                  setLocalStyles(newStyles);
                  onStylesChange(newStyles);
                }}
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Block Style Editors */}
      <Tabs defaultValue="pros-cons" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pros-cons">
            <Box className="h-4 w-4 mr-2" />
            Artı/Eksi
          </TabsTrigger>
          <TabsTrigger value="expert">
            <Type className="h-4 w-4 mr-2" />
            Uzman
          </TabsTrigger>
          <TabsTrigger value="verdict">
            <Sparkles className="h-4 w-4 mr-2" />
            Değerlendirme
          </TabsTrigger>
          <TabsTrigger value="games">
            <Layout className="h-4 w-4 mr-2" />
            Oyunlar
          </TabsTrigger>
          <TabsTrigger value="guides">
            <Palette className="h-4 w-4 mr-2" />
            Rehberler
          </TabsTrigger>
        </TabsList>

        {/* Pros/Cons Block */}
        <TabsContent value="pros-cons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Artı/Eksi Bloğu Stilleri</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetBlock('prosConsBlock')}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Arka Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.prosConsBlock?.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      updateBlockStyle('prosConsBlock', 'backgroundColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.prosConsBlock?.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      updateBlockStyle('prosConsBlock', 'backgroundColor', e.target.value)
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Çerçeve Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.prosConsBlock?.borderColor || '#e5e7eb'}
                    onChange={(e) =>
                      updateBlockStyle('prosConsBlock', 'borderColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.prosConsBlock?.borderColor || '#e5e7eb'}
                    onChange={(e) =>
                      updateBlockStyle('prosConsBlock', 'borderColor', e.target.value)
                    }
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Köşe Yuvarlaklığı: {localStyles.prosConsBlock?.borderRadius || 8}px</Label>
                <Slider
                  value={[localStyles.prosConsBlock?.borderRadius || 8]}
                  onValueChange={([value]) =>
                    updateBlockStyle('prosConsBlock', 'borderRadius', value)
                  }
                  min={0}
                  max={24}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <Label>İç Boşluk: {localStyles.prosConsBlock?.padding || 16}px</Label>
                <Slider
                  value={[localStyles.prosConsBlock?.padding || 16]}
                  onValueChange={([value]) =>
                    updateBlockStyle('prosConsBlock', 'padding', value)
                  }
                  min={8}
                  max={48}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Gölge Efekti</Label>
                <Select
                  value={localStyles.prosConsBlock?.shadow || 'none'}
                  onValueChange={(value) =>
                    updateBlockStyle('prosConsBlock', 'shadow', value)
                  }
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expert Review Block */}
        <TabsContent value="expert" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Uzman İncelemesi Bloğu</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetBlock('expertReviewBlock')}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Arka Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.expertReviewBlock?.backgroundColor || '#f9fafb'}
                    onChange={(e) =>
                      updateBlockStyle('expertReviewBlock', 'backgroundColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.expertReviewBlock?.backgroundColor || '#f9fafb'}
                    onChange={(e) =>
                      updateBlockStyle('expertReviewBlock', 'backgroundColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vurgu Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.expertReviewBlock?.accentColor || '#6366f1'}
                    onChange={(e) =>
                      updateBlockStyle('expertReviewBlock', 'accentColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.expertReviewBlock?.accentColor || '#6366f1'}
                    onChange={(e) =>
                      updateBlockStyle('expertReviewBlock', 'accentColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Yazı Boyutu: {localStyles.expertReviewBlock?.fontSize || 16}px</Label>
                <Slider
                  value={[localStyles.expertReviewBlock?.fontSize || 16]}
                  onValueChange={([value]) =>
                    updateBlockStyle('expertReviewBlock', 'fontSize', value)
                  }
                  min={14}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Satır Yüksekliği: {localStyles.expertReviewBlock?.lineHeight || 1.6}</Label>
                <Slider
                  value={[localStyles.expertReviewBlock?.lineHeight || 1.6]}
                  onValueChange={([value]) =>
                    updateBlockStyle('expertReviewBlock', 'lineHeight', value)
                  }
                  min={1.2}
                  max={2.0}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verdict Block */}
        <TabsContent value="verdict" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Değerlendirme Bloğu</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetBlock('verdictBlock')}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Arka Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.verdictBlock?.backgroundColor || '#fef3c7'}
                    onChange={(e) =>
                      updateBlockStyle('verdictBlock', 'backgroundColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.verdictBlock?.backgroundColor || '#fef3c7'}
                    onChange={(e) =>
                      updateBlockStyle('verdictBlock', 'backgroundColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vurgu Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.verdictBlock?.highlightColor || '#f59e0b'}
                    onChange={(e) =>
                      updateBlockStyle('verdictBlock', 'highlightColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.verdictBlock?.highlightColor || '#f59e0b'}
                    onChange={(e) =>
                      updateBlockStyle('verdictBlock', 'highlightColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Çerçeve Stili</Label>
                <Select
                  value={localStyles.verdictBlock?.borderStyle || 'solid'}
                  onValueChange={(value) =>
                    updateBlockStyle('verdictBlock', 'borderStyle', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Düz</SelectItem>
                    <SelectItem value="dashed">Kesikli</SelectItem>
                    <SelectItem value="dotted">Noktalı</SelectItem>
                    <SelectItem value="double">Çift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Categories */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Oyun Kategorileri Bloğu</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetBlock('gameCategories')}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Kart Stili</Label>
                <Select
                  value={localStyles.gameCategories?.cardStyle || 'default'}
                  onValueChange={(value) =>
                    updateBlockStyle('gameCategories', 'cardStyle', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Varsayılan</SelectItem>
                    <SelectItem value="elevated">Yükseltilmiş</SelectItem>
                    <SelectItem value="outlined">Çerçeveli</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hover Efekti</Label>
                <Select
                  value={localStyles.gameCategories?.hoverEffect || 'scale'}
                  onValueChange={(value) =>
                    updateBlockStyle('gameCategories', 'hoverEffect', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    <SelectItem value="scale">Büyüt</SelectItem>
                    <SelectItem value="lift">Kaldır</SelectItem>
                    <SelectItem value="glow">Parlat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>İkon Boyutu: {localStyles.gameCategories?.iconSize || 24}px</Label>
                <Slider
                  value={[localStyles.gameCategories?.iconSize || 24]}
                  onValueChange={([value]) =>
                    updateBlockStyle('gameCategories', 'iconSize', value)
                  }
                  min={16}
                  max={48}
                  step={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides */}
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Rehber Blokları (Giriş/Çekim)</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetBlock('guides')}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Arka Plan Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.guides?.backgroundColor || '#f3f4f6'}
                    onChange={(e) =>
                      updateBlockStyle('guides', 'backgroundColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.guides?.backgroundColor || '#f3f4f6'}
                    onChange={(e) =>
                      updateBlockStyle('guides', 'backgroundColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adım Numarası Rengi</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localStyles.guides?.stepNumberColor || '#6366f1'}
                    onChange={(e) =>
                      updateBlockStyle('guides', 'stepNumberColor', e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={localStyles.guides?.stepNumberColor || '#6366f1'}
                    onChange={(e) =>
                      updateBlockStyle('guides', 'stepNumberColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adım Arası Boşluk: {localStyles.guides?.spacing || 16}px</Label>
                <Slider
                  value={[localStyles.guides?.spacing || 16]}
                  onValueChange={([value]) =>
                    updateBlockStyle('guides', 'spacing', value)
                  }
                  min={8}
                  max={32}
                  step={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}

      {/* Preview Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Değişiklikler Otomatik Kaydediliyor</p>
              <p className="text-xs text-muted-foreground">
                Yaptığınız tüm stil değişiklikleri anında kaydedilir ve site detay sayfasında uygulanır.
                Değişiklikleri site detay sayfasında önizleyebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
