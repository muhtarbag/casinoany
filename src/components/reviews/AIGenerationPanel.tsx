import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2 } from "lucide-react";

interface BettingSite {
  id: string;
  name: string;
}

interface AIGenerationPanelProps {
  sites: BettingSite[];
  isLoading: boolean;
  onGenerate: (params: {
    siteId: string;
    count: string;
    tone: "positive" | "negative" | "neutral";
    ratingMin: string;
    ratingMax: string;
    language: "tr" | "en";
    autoPublish: boolean;
  }) => void;
}

export const AIGenerationPanel = memo(function AIGenerationPanel({ sites, isLoading, onGenerate }: AIGenerationPanelProps) {
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [reviewCount, setReviewCount] = useState<string>("3");
  const [tone, setTone] = useState<"positive" | "negative" | "neutral">("neutral");
  const [ratingMin, setRatingMin] = useState<string>("3");
  const [ratingMax, setRatingMax] = useState<string>("5");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [autoPublish, setAutoPublish] = useState(false);

  const handleGenerate = useCallback(() => {
    onGenerate({
      siteId: selectedSite,
      count: reviewCount,
      tone,
      ratingMin,
      ratingMax,
      language,
      autoPublish
    });
  }, [selectedSite, reviewCount, tone, ratingMin, ratingMax, language, autoPublish, onGenerate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI ile Otomatik Yorum Oluştur
        </CardTitle>
        <CardDescription>
          AI her yorum için benzersiz isimler ve farklı kullanıcı profilleri oluşturur. Organik ve gerçekçi yorumlar üretilir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Site Seçin</label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Bir site seçin" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Yorum Sayısı</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              placeholder="Kaç yorum oluşturulsun?"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Yorum Tonu</label>
            <Select value={tone} onValueChange={(value: "positive" | "negative" | "neutral") => setTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Olumlu</SelectItem>
                <SelectItem value="neutral">Nötr</SelectItem>
                <SelectItem value="negative">Olumsuz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Dil</label>
            <Select value={language} onValueChange={(value: "tr" | "en") => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Min Puan</label>
            <Select value={ratingMin} onValueChange={setRatingMin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Yıldız
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Puan</label>
            <Select value={ratingMax} onValueChange={setRatingMax}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Yıldız
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-publish"
              checked={autoPublish}
              onCheckedChange={setAutoPublish}
            />
            <Label htmlFor="auto-publish" className="text-sm">
              Otomatik yayınla (onay beklemeden)
            </Label>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!selectedSite || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yorumlar Oluşturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI ile Yorum Oluştur
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});
