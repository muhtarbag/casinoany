import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { SocialShareButtons } from "./SocialShareButtons";

interface CasinoVerdictBlockProps {
  verdict?: string;
  siteName?: string;
}

export const CasinoVerdictBlock = ({ verdict, siteName }: CasinoVerdictBlockProps) => {
  if (!verdict) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Uzman Görüşü
          </CardTitle>
          <SocialShareButtons 
            title={`${siteName || 'Casino'} İncelemesi - Uzman Görüşü`}
            description="Detaylı casino incelememizi okuyun!"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: verdict }}
        />
      </CardContent>
    </Card>
  );
};
