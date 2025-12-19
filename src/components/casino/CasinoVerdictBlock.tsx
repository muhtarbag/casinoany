import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { SocialShareButtons } from "./SocialShareButtons";
import DOMPurify from 'dompurify';

interface CasinoVerdictBlockProps {
  verdict?: string;
  siteName?: string;
}

export const CasinoVerdictBlock = ({ verdict, siteName }: CasinoVerdictBlockProps) => {
  if (!verdict) return null;

  // 🛡️ XSS Protection: Sanitize HTML content
  const sanitizedVerdict = DOMPurify.sanitize(verdict, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });

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
          dangerouslySetInnerHTML={{ __html: sanitizedVerdict }}
        />
      </CardContent>
    </Card>
  );
};
