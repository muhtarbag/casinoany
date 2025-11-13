import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface CasinoVerdictBlockProps {
  verdict?: string;
}

export const CasinoVerdictBlock = ({ verdict }: CasinoVerdictBlockProps) => {
  if (!verdict) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Uzman Görüşü
        </CardTitle>
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
